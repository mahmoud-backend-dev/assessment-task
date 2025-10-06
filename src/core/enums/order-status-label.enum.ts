import { OrderStatus } from './order-status.enum';

export const OrderStatusLabel = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.PROCESSING]: 'Processing',
  [OrderStatus.CONFIRMED]: 'Confirmed',
  [OrderStatus.SHIPPED]: 'Shipped',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.REFUNDED]: 'Refunded',
  [OrderStatus.READY_TO_SHIP]: 'Ready to Ship',
  [OrderStatus.PENDING_PAYMENT]: 'Pending Payment',
  [OrderStatus.READY_FOR_PICKUP]: 'Ready for Pickup',
  [OrderStatus.VALIDATED]: 'Validated',
} as const;
