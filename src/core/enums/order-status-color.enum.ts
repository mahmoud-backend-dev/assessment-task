import { OrderStatus } from './order-status.enum';

export const OrderStatusColor = {
  [OrderStatus.PENDING]: '#FFA500', // Orange
  [OrderStatus.PROCESSING]: '#1E90FF', // DodgerBlue
  [OrderStatus.CONFIRMED]: '#32CD32', // LimeGreen
  [OrderStatus.SHIPPED]: '#4169E1', // RoyalBlue
  [OrderStatus.DELIVERED]: '#228B22', // ForestGreen
  [OrderStatus.CANCELLED]: '#DC143C', // Crimson
  [OrderStatus.REFUNDED]: '#FFA726', // SaddleBrown
  [OrderStatus.READY_TO_SHIP]: '#00CED1', // DarkTurquoise
  [OrderStatus.PENDING_PAYMENT]: '#FF6347', // Tomato
  [OrderStatus.READY_FOR_PICKUP]: '#9370DB', // MediumPurple
  [OrderStatus.VALIDATED]: '#20B2AA', // LightSeaGreen
} as const;
