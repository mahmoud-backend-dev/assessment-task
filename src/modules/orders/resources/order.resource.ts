import { Decimal } from '@prisma/client/runtime/library';
import { Order, OrderItem, Product, ProductVariant, User } from '@prisma/client';
import { ProductResource } from '@/modules/products/resources/product.resource';

const toNumber = (value: number | Decimal): number => {
  return value instanceof Decimal ? value.toNumber() : value;
};

export type OrderItemResponse = {
  id: string;
  productId: string;
  productVariantId?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product?: ReturnType<typeof ProductResource.fromModel>;
  variant?: ReturnType<typeof ProductResource.variantFromModel>;
};

export type OrderResponse = {
  id: string;
  customerId: string;
  subtotal: number;
  deliveryFee: number;
  vatAmount: number;
  total: number;
  status: string;
  notes?: string | null;
  orderedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemResponse[];
  customer?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
};

export class OrderResource {
  static fromModel(
    order: Order & {
      items: (OrderItem & {
        product?: Product | null;
        productVariant?: ProductVariant | null;
      })[];
      customer?: User | null;
    }
  ): OrderResponse {
    return {
      id: order.id,
      customerId: order.customerId,
      subtotal: toNumber(order.subtotal),
      deliveryFee: toNumber(order.deliveryFee),
      vatAmount: toNumber(order.vatAmount),
      total: toNumber(order.total),
      status: order.status,
      notes: order.notes,
      orderedAt: order.orderedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice: toNumber(item.unitPrice),
        lineTotal: toNumber(item.lineTotal),
        product: item.product
          ? ProductResource.fromModel({ ...item.product, variants: [] })
          : undefined,
        variant: item.productVariant
          ? ProductResource.variantFromModel(item.productVariant)
          : undefined,
      })),
      customer: order.customer
        ? {
            id: order.customer.id,
            firstName: order.customer.firstName,
            lastName: order.customer.lastName,
            email: order.customer.email,
          }
        : undefined,
    };
  }

  static collection(
    orders: (Order & {
      items: (OrderItem & {
        product?: Product | null;
        productVariant?: ProductVariant | null;
      })[];
      customer?: User | null;
    })[]
  ): OrderResponse[] {
    return orders.map(OrderResource.fromModel);
  }
}
