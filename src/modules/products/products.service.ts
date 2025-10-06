import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  Prisma,
  ProductStatus,
  ProductType,
  UserType,
} from '@prisma/client';
import { AuthUser } from '@/core/decorators/current-user.decorator';
import { ResponseService } from '@/core/custom-response/custom-response.service';
import { I18nHelperService } from '@/core/i18n/providers/I18n-helper-service';
import { Role } from '@/modules/auth/enums/auth.enum';
import { PrismaService } from '@/prisma/prisma.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { VariantInputDto } from './dto/variant-input.dto';
import { ProductResource } from './resources/product.resource';

@Injectable()
export class ProductsService {
  private readonly t: (key: string, options?: any) => string;
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly i18nHelper: I18nHelperService
  ) {
    const { t } = this.i18nHelper.createNamespaceTranslator('product');
    this.t = t;
  }

  async create(adminId: string, dto: CreateProductDto) {
    await this.ensureAdminExists(adminId);

    const product = await this.prisma.$transaction(async tx => {
      const created = await tx.product.create({
        data: this.mapProductCreateInput(dto, adminId),
        include: { variants: true },
      });

      if (dto.categoryIds?.length) {
        const categoryLinks = dto.categoryIds.map(categoryId => ({
          productId: created.id,
          categoryId,
        }));
        await tx.productCategory.createMany({
          data: categoryLinks,
          skipDuplicates: true,
        });
      }

      return created;
    });

    return this.response.created({
      message: this.t('PRODUCT_CREATED_SUCCESSFULLY'),
      data: ProductResource.fromModel(product),
    });
  }

  async findAll(query: ProductQueryDto) {
    const { page = 1, limit = 10 } = query;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (query.search) {
      where.OR = [
        { slug: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.categoryId) {
      where.categoriesLinks = {
        some: { categoryId: query.categoryId },
      };
    }

    if (query.isExclusive !== undefined) {
      where.isExclusive = query.isExclusive;
    }

    if (query.isBestPrice !== undefined) {
      where.isBestPrice = query.isBestPrice;
    }

    if (query.isTopSelling !== undefined) {
      where.isTopSelling = query.isTopSelling;
    }

    if (query.isNewArrival !== undefined) {
      where.isNewArrival = query.isNewArrival;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { variants: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    const meta = this.buildPaginationMeta(page, limit, total);

    return this.response.success({
      message: this.t('PRODUCTS_RETRIEVED_SUCCESSFULLY'),
      data: {
        items: ProductResource.collection(items),
        meta,
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { variants: true },
    });

    if (!product) {
      throw new NotFoundException(this.t('PRODUCT_NOT_FOUND'));
    }

    return this.response.success({
      message: this.t('PRODUCT_RETRIEVED_SUCCESSFULLY'),
      data: ProductResource.fromModel(product),
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { variants: true },
    });

    if (!product) {
      throw new NotFoundException(this.t('PRODUCT_NOT_FOUND'));
    }

    const updated = await this.prisma.$transaction(async tx => {
      await tx.product.update({
        where: { id },
        data: this.mapProductUpdateInput(dto),
      });

      if (dto.removeVariantIds?.length) {
        await tx.productVariant.deleteMany({
          where: {
            id: { in: dto.removeVariantIds },
            productId: id,
          },
        });
      }

      if (dto.variants) {
        for (const variant of dto.variants) {
          if (variant.id) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: this.mapVariantUpdateInput(variant),
            });
          } else {
            await tx.productVariant.create({
              data: this.mapVariantCreateInput(variant, id),
            });
          }
        }
      }

      if (dto.categoryIds) {
        await tx.productCategory.deleteMany({ where: { productId: id } });
        if (dto.categoryIds.length) {
          await tx.productCategory.createMany({
            data: dto.categoryIds.map(categoryId => ({ productId: id, categoryId })),
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: { variants: true },
      });
    });

    return this.response.success({
      message: this.t('PRODUCT_UPDATED_SUCCESSFULLY'),
      data: ProductResource.fromModel(updated!),
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException(this.t('PRODUCT_NOT_FOUND'));
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return this.response.success({ message: this.t('PRODUCT_DELETED_SUCCESSFULLY') });
  }

  async getRecommendations(requestor: AuthUser, targetUserId: string) {
    if (
      requestor.type === Role.CUSTOMER &&
      requestor.id !== targetUserId
    ) {
      throw new ForbiddenException(this.t('FORBIDDEN_RECOMMENDATIONS_ACCESS'));
    }

    const customer = await this.prisma.user.findFirst({
      where: { id: targetUserId, type: UserType.CUSTOMER, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException(this.t('CUSTOMER_NOT_FOUND'));
    }

    const userOrders = await this.prisma.order.findMany({
      where: {
        customerId: targetUserId,
        deletedAt: null,
        status: { not: OrderStatus.CANCELLED },
      },
      include: { items: true },
    });

    if (!userOrders.length) {
      return this.response.success({
        message: this.t('NO_RECOMMENDATIONS_FOR_NEW_CUSTOMERS'),
        data: [],
      });
    }

    const purchasedProductIds = new Set<string>();
    for (const order of userOrders) {
      for (const item of order.items) {
        purchasedProductIds.add(item.productId);
      }
    }

    if (!purchasedProductIds.size) {
      return this.response.success({ message: this.t('NO_RECOMMENDATIONS_AVAILABLE'), data: [] });
    }

    const relatedOrders = await this.prisma.order.findMany({
      where: {
        customerId: { not: targetUserId },
        deletedAt: null,
        status: { not: OrderStatus.CANCELLED },
        items: {
          some: {
            productId: { in: Array.from(purchasedProductIds) },
          },
        },
      },
      include: { items: true },
    });

    const productsByCustomer = new Map<string, Set<string>>();

    for (const order of relatedOrders) {
      const set = productsByCustomer.get(order.customerId) ?? new Set<string>();
      for (const item of order.items) {
        set.add(item.productId);
      }
      productsByCustomer.set(order.customerId, set);
    }

    const similarCustomers: string[] = [];
    for (const [customerIdKey, productSet] of productsByCustomer.entries()) {
      const overlap = Array.from(productSet).filter(productId =>
        purchasedProductIds.has(productId)
      );
      if (overlap.length >= 2) {
        similarCustomers.push(customerIdKey);
      }
    }

    if (!similarCustomers.length) {
      return this.response.success({ message: this.t('NO_RECOMMENDATIONS_AVAILABLE'), data: [] });
    }

    const recommendationMap = new Map<
      string,
      { count: number; purchasers: Set<string> }
    >();

    for (const customerIdKey of similarCustomers) {
      const productSet = productsByCustomer.get(customerIdKey);
      if (!productSet) continue;

      for (const productId of productSet) {
        if (purchasedProductIds.has(productId)) continue;

        const entry = recommendationMap.get(productId) ?? {
          count: 0,
          purchasers: new Set<string>(),
        };
        entry.count += 1;
        entry.purchasers.add(customerIdKey);
        recommendationMap.set(productId, entry);
      }
    }

    if (!recommendationMap.size) {
      return this.response.success({ message: this.t('NO_RECOMMENDATIONS_AVAILABLE'), data: [] });
    }

    const productIds = Array.from(recommendationMap.keys());
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, deletedAt: null },
      include: { variants: true },
    });

    const recommendations = products
      .map(product => {
        const entry = recommendationMap.get(product.id)!;
        const confidence = entry.purchasers.size / similarCustomers.length;
        return {
          confidence,
          product: ProductResource.fromModel(product),
        };
      })
      .sort((a, b) => b.confidence - a.confidence);

    return this.response.success({ message: this.t('RECOMMENDATIONS_GENERATED_SUCCESSFULLY'), data: recommendations });
  }

  private mapProductCreateInput(
    dto: CreateProductDto,
    adminId: string
  ): Prisma.ProductCreateInput {
    return {
      createdBy: { connect: { id: adminId } },
      name: dto.name,
      description: dto.description ?? null,
      shortDescription: dto.shortDescription ?? null,
      slug: dto.slug,
      sku: dto.sku,
      basePrice: dto.basePrice ?? null,
      type: dto.type ?? ProductType.SIMPLE,
      status: dto.status ?? ProductStatus.ACTIVE,
      isBestPrice: dto.isBestPrice ?? false,
      isExclusive: dto.isExclusive ?? false,
      isTopSelling: dto.isTopSelling ?? false,
      isNewArrival: dto.isNewArrival ?? false,
      variants: {
        create: dto.variants.map(variant => ({
          name: variant.name ?? null,
          sku: variant.sku,
          attributes: variant.attributes ?? null,
          isPrimary: variant.isPrimary ?? false,
          price: variant.price,
          listPrice: variant.listPrice ?? null,
          stock: variant.stock ?? 0,
        })),
      },
    };
  }

  private mapProductUpdateInput(dto: UpdateProductDto): Prisma.ProductUpdateInput {
    const { variants, removeVariantIds, ...rest } = dto;
    return this.removeUndefined({
      name: rest.name,
      description: rest.description ?? null,
      shortDescription: rest.shortDescription ?? null,
      slug: rest.slug,
      sku: rest.sku,
      basePrice: rest.basePrice,
      type: rest.type,
      status: rest.status,
      isBestPrice: rest.isBestPrice,
      isExclusive: rest.isExclusive,
      isTopSelling: rest.isTopSelling,
      isNewArrival: rest.isNewArrival,
    });
  }

  private mapVariantUpdateInput(
    variant: VariantInputDto
  ): Prisma.ProductVariantUpdateInput {
    return {
      name: variant.name ?? null,
      sku: variant.sku,
      attributes: variant.attributes ?? null,
      isPrimary: variant.isPrimary ?? false,
      price: variant.price,
      listPrice: variant.listPrice ?? null,
      stock: variant.stock ?? 0,
    };
  }

  private mapVariantCreateInput(
    variant: VariantInputDto,
    productId: string
  ): Prisma.ProductVariantUncheckedCreateInput {
    return {
      productId,
      name: variant.name ?? null,
      sku: variant.sku,
      attributes: variant.attributes ?? null,
      isPrimary: variant.isPrimary ?? false,
      price: variant.price,
      listPrice: variant.listPrice ?? null,
      stock: variant.stock ?? 0,
    };
  }

  private buildPaginationMeta(page: number, limit: number, totalItems: number) {
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

  private removeUndefined<T extends Record<string, any>>(obj: T): T {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== undefined)
    ) as T;
  }

  private async ensureAdminExists(id: string) {
    const admin = await this.prisma.user.findFirst({
      where: { id, type: UserType.ADMIN, deletedAt: null },
    });

    if (!admin) {
      throw new BadRequestException(this.t('ADMIN_NOT_FOUND'));
    }
  }
}













