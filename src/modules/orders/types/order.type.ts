import { Prisma } from '@prisma/client';

export const ORDER_INCLUDE = Prisma.validator<Prisma.OrderInclude>()({
  items: { include: { product: true, productVariant: true } },
  customer: true,
});

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof ORDER_INCLUDE;
}>;
