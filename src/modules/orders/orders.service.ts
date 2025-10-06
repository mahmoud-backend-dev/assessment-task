import { ResponseService } from '@/core/custom-response/custom-response.service';
import { AuthUser } from '@/core/decorators/current-user.decorator';
import { I18nHelperService } from '@/core/i18n/providers/I18n-helper-service';
import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersHelper } from './helpers/order-helper.service';
import { OrderResource } from './resources/order.resource';
import { ORDER_INCLUDE } from './types/order.type';

const TAX_RATE = 0.15;

@Injectable()
export class OrdersService {
  private readonly t: (key: string, options?: any) => string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly i18nHelper: I18nHelperService,
    private readonly ordersHelper: OrdersHelper
  ) {
    const { t } = this.i18nHelper.createNamespaceTranslator('orders');
    this.t = t;
  }

  async create(customerId: string, dto: CreateOrderDto) {
    await this.ordersHelper.ensureCustomerExists(customerId);

    if (!dto.items?.length) {
      throw new BadRequestException(this.t('ORDER_ITEMS_REQUIRED'));
    }

    const preparedItems = await this.ordersHelper.prepareOrderItems(dto.items);
    const { subtotal, deliveryFee, vatAmount, total } =
      this.ordersHelper.calculateTotals(
        preparedItems,
        dto.deliveryFee ?? 0,
        TAX_RATE
      );

    const order = await this.prisma.$transaction(async tx => {
      const created = await tx.order.create({
        data: {
          customerId, // <<< REQUIRED: include the customer
          subtotal: this.ordersHelper.toDecimal(subtotal),
          deliveryFee: this.ordersHelper.toDecimal(deliveryFee),
          vatAmount: this.ordersHelper.toDecimal(vatAmount),
          total: this.ordersHelper.toDecimal(total),
          notes: dto.notes ?? null,
          status: OrderStatus.PENDING,
          items: {
            create: preparedItems.map(item => ({
              productId: item.productId,
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              unitPrice: this.ordersHelper.toDecimal(item.unitPrice),
              lineTotal: this.ordersHelper.toDecimal(item.lineTotal),
            })),
          },
        },
        include: ORDER_INCLUDE, // <<< use typed include
      });

      for (const item of preparedItems) {
        const updated = await tx.productVariant.updateMany({
          where: { id: item.productVariantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count !== 1) {
          throw new BadRequestException(
            this.t('INSUFFICIENT_STOCK_FOR_VARIANT')
          );
        }
      }

      return created;
    });

    return this.response.created({
      message: this.t('ORDER_CREATED_SUCCESSFULLY'),
      data: OrderResource.fromModel(order),
    });
  }

  async findAll(query: OrderQueryDto) {
    const { page = 1, limit = 10 } = query;
    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
      customerId: query.customerId ?? undefined,
      status: query.status ?? undefined,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: ORDER_INCLUDE, // <<< typed include
      }),
      this.prisma.order.count({ where }),
    ]);

    const meta = this.ordersHelper.buildPaginationMeta(page, limit, total);
    const data = this.ordersHelper.buildPaginatedResponseData(items, meta);

    return this.response.success({
      message: this.t('ORDERS_RETRIEVED_SUCCESSFULLY'),
      data,
    });
  }

  async findCustomerOrders(customerId: string, query: OrderQueryDto) {
    const { page = 1, limit = 10, status } = query;

    const where: Prisma.OrderWhereInput = {
      customerId,
      deletedAt: null,
      status: status ?? undefined,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: ORDER_INCLUDE, // <<< typed include
      }),
      this.prisma.order.count({ where }),
    ]);

    const meta = this.ordersHelper.buildPaginationMeta(page, limit, total);
    const data = this.ordersHelper.buildPaginatedResponseData(items, meta);

    return this.response.success({
      message: this.t('CUSTOMER_ORDERS_RETRIEVED_SUCCESSFULLY'),
      data,
    });
  }

  async findOneForUser(id: string, user: AuthUser) {
    const order = await this.ordersHelper.getOrderOrThrow(id, ORDER_INCLUDE);
    this.ordersHelper.ensureCustomerAccess(order.customerId, user);

    return this.response.success({
      message: this.t('ORDER_RETRIEVED_SUCCESSFULLY'),
      data: OrderResource.fromModel(order),
    });
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.ordersHelper.getOrderOrThrow(id, ORDER_INCLUDE);

    if (order.status === dto.status) {
      return this.response.success({
        message: this.t('ORDER_STATUS_UNCHANGED'),
        data: OrderResource.fromModel(order),
      });
    }

    if (
      dto.status === OrderStatus.CANCELLED &&
      order.status !== OrderStatus.PENDING
    ) {
      throw new BadRequestException(
        this.t('ONLY_PENDING_ORDERS_CAN_BE_CANCELLED')
      );
    }

    const updated = await this.prisma.$transaction(async tx => {
      if (dto.status === OrderStatus.CANCELLED) {
        await this.ordersHelper.restoreInventory(tx, order.id);
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: dto.status },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: ORDER_INCLUDE,
      });
    });

    return this.response.success({
      message: this.t('ORDER_STATUS_UPDATED_SUCCESSFULLY'),
      data: OrderResource.fromModel(updated),
    });
  }

  async cancel(orderId: string, customerId: string, dto: CancelOrderDto) {
    const order = await this.ordersHelper.getOrderOrThrow(
      orderId,
      ORDER_INCLUDE
    );
    this.ordersHelper.assertCustomerOwnership(order.customerId, customerId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        this.t('ONLY_PENDING_ORDERS_CAN_BE_CANCELLED')
      );
    }

    const updated = await this.prisma.$transaction(async tx => {
      await this.ordersHelper.restoreInventory(tx, order.id);

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          notes: dto.reason ?? order.notes,
        },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: ORDER_INCLUDE, // <<< typed include
      });
    });

    return this.response.success({
      message: this.t('ORDER_CANCELLED_SUCCESSFULLY'),
      data: OrderResource.fromModel(updated),
    });
  }
}
