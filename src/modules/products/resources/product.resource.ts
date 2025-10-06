import { Decimal } from '@prisma/client/runtime/library';
import { Product, ProductVariant } from '@prisma/client';

const toNumber = (value: number | Decimal | null | undefined): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }
  return value instanceof Decimal ? value.toNumber() : value;
};

export type ProductVariantResponse = {
  id: string;
  name?: Record<string, any> | null;
  sku: string;
  attributes?: Record<string, any> | null;
  isPrimary: boolean;
  price: number;
  listPrice?: number;
  stock: number;
};

export type ProductResponse = {
  id: string;
  name: Record<string, any>;
  description?: Record<string, any> | null;
  shortDescription?: Record<string, any> | null;
  slug: string;
  sku: string;
  basePrice?: number;
  type: string;
  status: string;
  isBestPrice: boolean;
  isExclusive: boolean;
  isTopSelling: boolean;
  isNewArrival: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  variants: ProductVariantResponse[];
};

export class ProductResource {
  static fromModel(
    product: Product & { variants?: ProductVariant[] }
  ): ProductResponse {
    const variants = product.variants
      ? product.variants.map(ProductResource.variantFromModel)
      : [];

    return {
      id: product.id,
      name: product.name as Record<string, any>,
      description: product.description as Record<string, any> | null,
      shortDescription: product.shortDescription as Record<string, any> | null,
      slug: product.slug,
      sku: product.sku,
      basePrice: toNumber(product.basePrice ?? undefined),
      type: product.type,
      status: product.status,
      isBestPrice: product.isBestPrice,
      isExclusive: product.isExclusive,
      isTopSelling: product.isTopSelling,
      isNewArrival: product.isNewArrival,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      createdById: product.createdById,
      variants,
    };
  }

  static collection(products: (Product & { variants?: ProductVariant[] })[]) {
    return products.map(ProductResource.fromModel);
  }

  static variantFromModel(variant: ProductVariant): ProductVariantResponse {
    return {
      id: variant.id,
      name: variant.name as Record<string, any> | null,
      sku: variant.sku,
      attributes: variant.attributes as Record<string, any> | null,
      isPrimary: variant.isPrimary,
      price: toNumber(variant.price) ?? 0,
      listPrice: toNumber(variant.listPrice),
      stock: variant.stock,
    };
  }
}
