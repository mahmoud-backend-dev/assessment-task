import { AuthUser } from '@/core/decorators/current-user.decorator';
import { I18nHelperService } from '@/core/i18n/providers/I18n-helper-service';
import { Role } from '@/modules/auth/enums/auth.enum';
import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrderItemInputDto } from '../dto/order-item-input.dto';
import { PreparedOrderItem } from '../interfaces/order.interface';
import { OrderResource } from '../resources/order.resource';
import { ORDER_INCLUDE, OrderWithRelations } from '../types/order.type';

@Injectable()
export class OrdersHelper {
  readonly defaultOrderInclude = ORDER_INCLUDE;

  private readonly t: (key: string, options?: any) => string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly i18nHelper: I18nHelperService
  ) {
    const { t } = this.i18nHelper.createNamespaceTranslator('orders');
    this.t = t;
  }

  roundCurrency(value: number): number {
    return Math.round(value * 100) / 100;
  }

  buildPaginationMeta(page: number, limit: number, totalItems: number) {
    const totalPages = Math.ceil(totalItems / limit) || 1;
    return {
      totalItems,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      limit,
    };
  }

  buildPaginatedResponseData(
    orders: OrderWithRelations[],
    meta: ReturnType<OrdersHelper['buildPaginationMeta']>
  ) {
    return { items: OrderResource.collection(orders), meta };
  }

  calculateTotals(
    preparedItems: PreparedOrderItem[],
    deliveryFeeRaw: number,
    taxRate: number
  ) {
    const subtotal = this.roundCurrency(
      preparedItems.reduce((sum, item) => sum + item.lineTotal, 0)
    );
    const deliveryFee = this.roundCurrency(deliveryFeeRaw);
    const vatAmount = this.roundCurrency(subtotal * taxRate);
    const total = this.roundCurrency(subtotal + deliveryFee + vatAmount);

    return { subtotal, deliveryFee, vatAmount, total };
  }

  async ensureCustomerExists(id: string): Promise<void> {
    const customer = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException(this.t('CUSTOMER_NOT_FOUND'));
    }
  }

  async getOrderOrThrow(
    id: string,
    include: typeof ORDER_INCLUDE = ORDER_INCLUDE
  ): Promise<OrderWithRelations> {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
      include,
    });
    if (!order) throw new NotFoundException(this.t('ORDER_NOT_FOUND'));
    return order;
  }

  ensureCustomerAccess(orderCustomerId: string, user: AuthUser) {
    if (user.type === Role.CUSTOMER && orderCustomerId !== user.id) {
      throw new ForbiddenException(this.t('UNAUTHORIZED_ORDER_ACCESS'));
    }
  }

  assertCustomerOwnership(orderCustomerId: string, customerId: string) {
    if (orderCustomerId !== customerId) {
      throw new ForbiddenException(this.t('ORDER_NOT_BELONG_TO_CUSTOMER'));
    }
  }

  async prepareOrderItems(
    items: OrderItemInputDto[]
  ): Promise<PreparedOrderItem[]> {
    // 1) all items must have productVariantId
    if (items.some(i => !i.productVariantId)) {
      throw new BadRequestException(this.t('ORDER_ITEM_VARIANT_REQUIRED'));
    }

    // 2) collect unique ids and aggregate requested qty per variant
    const variantIds = [...new Set(items.map(i => i.productVariantId!))];

    const requestedQtyByVariant = new Map<string, number>();
    for (const { productVariantId, quantity } of items) {
      requestedQtyByVariant.set(
        productVariantId!,
        (requestedQtyByVariant.get(productVariantId!) ?? 0) + quantity
      );
    }

    // 3) fetch just what we need
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds }, deletedAt: null },
      select: {
        id: true,
        sku: true,
        price: true,
        stock: true,
        productId: true,
      },
    });

    // ensure all exist
    if (variants.length !== variantIds.length) {
      throw new BadRequestException(
        this.t('INVALID_PRODUCT_VARIANT_SELECTION')
      );
    }

    // 4) product/stock checks (aggregate)
    for (const v of variants) {
      // product pairing: every item that references v must match productId
      // (this also catches mixed productId with same variant)
      const anyMismatch = items.some(
        it => it.productVariantId === v.id && it.productId !== v.productId
      );
      if (anyMismatch) {
        throw new BadRequestException(
          this.t('INVALID_PRODUCT_VARIANT_SELECTION')
        );
      }

      const requested = requestedQtyByVariant.get(v.id) ?? 0;
      if (v.stock < requested) {
        throw new BadRequestException(
          this.t('INSUFFICIENT_STOCK_FOR_VARIANT', { args: { sku: v.sku } })
        );
      }
    }

    // 5) build prepared items (use Decimal/number consistently)
    return items.map(item => {
      const v = variants.find(x => x.id === item.productVariantId)!;
      const unitPrice = this.roundCurrency(Number(v.price));
      const lineTotal = this.roundCurrency(unitPrice * item.quantity);
      return {
        productId: item.productId,
        productVariantId: item.productVariantId!,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      };
    });
  }

  async restoreInventory(
    tx: Prisma.TransactionClient,
    orderId: string
  ): Promise<void> {
    const items = await tx.orderItem.findMany({
      where: { orderId, deletedAt: null },
    });

    for (const item of items) {
      if (!item.productVariantId) continue;
      await tx.productVariant.update({
        where: { id: item.productVariantId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }
  }

  toDecimal(n: number | string): Prisma.Decimal {
    return new Prisma.Decimal(n);
  }
}
