import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrdersHelper } from './order-helper.service';\nimport { Role } from '@/modules/auth/enums/auth.enum';

describe('OrdersHelper', () => {
  const prismaMock = {
    user: { findFirst: jest.fn() },
    order: { findFirst: jest.fn() },
    productVariant: { findMany: jest.fn(), update: jest.fn() },
    orderItem: { findMany: jest.fn() },
  } as any;

  const translator = { t: jest.fn((key: string) => key) };
  const i18nMock = {
    createNamespaceTranslator: jest.fn(() => translator),
  } as any;

  const helper = new OrdersHelper(prismaMock, i18nMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates totals with delivery fee and tax', () => {
    const prepared = [
      { lineTotal: 40, productId: 'a', productVariantId: 'va', quantity: 2, unitPrice: 20 },
      { lineTotal: 60, productId: 'b', productVariantId: 'vb', quantity: 3, unitPrice: 20 },
    ];

    const result = helper.calculateTotals(prepared, 10, 0.15);

    expect(result).toEqual({
      subtotal: 100,
      deliveryFee: 10,
      vatAmount: 15,
      total: 125,
    });
  });

  it('ensures customer exists', async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'user-1' });

    await expect(helper.ensureCustomerExists('user-1')).resolves.toBeUndefined();
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'user-1', deletedAt: null },
    });
  });

  it('throws when customer missing', async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce(null);

    await expect(helper.ensureCustomerExists('missing')).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('returns order when found', async () => {
    prismaMock.order.findFirst.mockResolvedValueOnce({ id: 'order-1' });

    await expect(helper.getOrderOrThrow('order-1')).resolves.toEqual({ id: 'order-1' });
  });

  it('throws when order missing', async () => {
    prismaMock.order.findFirst.mockResolvedValueOnce(null);

    await expect(helper.getOrderOrThrow('missing')).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('prevents customer access when ids mismatch', () => {
    expect(() =>
      helper.ensureCustomerAccess('owner-id', {
        id: 'another',
        email: 'a@b.com',
        type: Role.CUSTOMER,
      } as any)
    ).toThrow(ForbiddenException);
  });

  it('allows admin access regardless of customer id', () => {
    expect(() =>
      helper.ensureCustomerAccess('owner-id', {
        id: 'admin-1',
        email: 'a@b.com',
        type: Role.ADMIN,
      } as any)
    ).not.toThrow();
  });

  it('asserts ownership for customer cancel flow', () => {
    expect(() => helper.assertCustomerOwnership('u1', 'u1')).not.toThrow();
    expect(() => helper.assertCustomerOwnership('u1', 'u2')).toThrow(ForbiddenException);
  });
});

