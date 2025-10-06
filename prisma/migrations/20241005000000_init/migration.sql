-- Auto-generated baseline migration reflecting prisma/schema.prisma on 2024-10-05

CREATE TYPE "UserType" AS ENUM ('ADMIN', 'CUSTOMER');
CREATE TYPE "ProductType" AS ENUM ('SIMPLE', 'VARIABLE');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  "first_name" VARCHAR(255) NOT NULL,
  "last_name" VARCHAR(191),
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(255),
  "last_login_at" TIMESTAMPTZ,
  "password" VARCHAR(255) NOT NULL,
  "type" "UserType" NOT NULL
);

CREATE UNIQUE INDEX "INX_uq_Email_USER" ON "users" ("email", "deleted_at");
CREATE INDEX "IDX_user_type" ON "users" ("type");

CREATE TABLE "categories" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  "slug" VARCHAR(191) NOT NULL,
  "title" JSONB NOT NULL,
  "is_featured" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_new" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_returnable" BOOLEAN NOT NULL DEFAULT TRUE,
  "parent_id" UUID,
  "meta_keywords" JSONB,
  "meta_description" JSONB
);

CREATE UNIQUE INDEX "IDX_categories_slug_unique" ON "categories" ("slug", "deleted_at");
CREATE INDEX "IDX_categories_parent_id" ON "categories" ("parent_id");

ALTER TABLE "categories"
  ADD CONSTRAINT "fk_category_parent"
  FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL;

CREATE TABLE "products" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  "name" JSONB NOT NULL,
  "description" JSONB,
  "short_description" JSONB,
  "slug" VARCHAR(255) NOT NULL,
  "sku" VARCHAR(191) NOT NULL,
  "base_price" NUMERIC(10, 2),
  "type" "ProductType" NOT NULL,
  "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
  "is_best_price" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_exclusive" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_top_selling" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_new_arrival" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_by_id" UUID NOT NULL
);

CREATE UNIQUE INDEX "UQ_Product_slug" ON "products" ("slug", "deleted_at");
CREATE UNIQUE INDEX "UQ_Product_sku" ON "products" ("sku", "deleted_at");
CREATE INDEX "IDX_product_created_by" ON "products" ("created_by_id");

ALTER TABLE "products"
  ADD CONSTRAINT "fk_product_created_by"
  FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT;

CREATE TABLE "product_category" (
  "product_id" UUID NOT NULL,
  "category_id" UUID NOT NULL,
  PRIMARY KEY ("product_id", "category_id")
);

ALTER TABLE "product_category"
  ADD CONSTRAINT "fk_product_category_product"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;
ALTER TABLE "product_category"
  ADD CONSTRAINT "fk_product_category_category"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE;

CREATE TABLE "product_related" (
  "product_id" UUID NOT NULL,
  "related_product_id" UUID NOT NULL,
  PRIMARY KEY ("product_id", "related_product_id")
);

ALTER TABLE "product_related"
  ADD CONSTRAINT "fk_product_related_product"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;
ALTER TABLE "product_related"
  ADD CONSTRAINT "fk_product_related_related"
  FOREIGN KEY ("related_product_id") REFERENCES "products"("id") ON DELETE CASCADE;

CREATE TABLE "product_up_sell" (
  "product_id" UUID NOT NULL,
  "up_sell_product_id" UUID NOT NULL,
  PRIMARY KEY ("product_id", "up_sell_product_id")
);

ALTER TABLE "product_up_sell"
  ADD CONSTRAINT "fk_product_up_sell_product"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;
ALTER TABLE "product_up_sell"
  ADD CONSTRAINT "fk_product_up_sell_related"
  FOREIGN KEY ("up_sell_product_id") REFERENCES "products"("id") ON DELETE CASCADE;

CREATE TABLE "product_cross_sell" (
  "product_id" UUID NOT NULL,
  "cross_sell_product_id" UUID NOT NULL,
  PRIMARY KEY ("product_id", "cross_sell_product_id")
);

ALTER TABLE "product_cross_sell"
  ADD CONSTRAINT "fk_product_cross_sell_product"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;
ALTER TABLE "product_cross_sell"
  ADD CONSTRAINT "fk_product_cross_sell_related"
  FOREIGN KEY ("cross_sell_product_id") REFERENCES "products"("id") ON DELETE CASCADE;

CREATE TABLE "product_variants" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  "product_id" UUID NOT NULL,
  "name" JSONB,
  "sku" VARCHAR(191) NOT NULL,
  "attributes" JSONB,
  "is_primary" BOOLEAN NOT NULL DEFAULT FALSE,
  "price" NUMERIC(10, 2) NOT NULL,
  "list_price" NUMERIC(10, 2),
  "stock" INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX "UQ_ProductVariant_sku" ON "product_variants" ("product_id", "sku");
CREATE INDEX "IDX_product_variant_product" ON "product_variants" ("product_id");

ALTER TABLE "product_variants"
  ADD CONSTRAINT "fk_product_variant_product"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;

CREATE TABLE "orders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  "customer_id" UUID NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "subtotal" NUMERIC(12, 2) NOT NULL,
  "delivery_fee" NUMERIC(12, 2) NOT NULL,
  "vat_amount" NUMERIC(12, 2) NOT NULL,
  "total" NUMERIC(12, 2) NOT NULL,
  "notes" VARCHAR(500),
  "ordered_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "IDX_order_customer" ON "orders" ("customer_id");
CREATE INDEX "IDX_order_status" ON "orders" ("status");

ALTER TABLE "orders"
  ADD CONSTRAINT "fk_order_customer"
  FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT;

CREATE TABLE "order_items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  "order_id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "product_variant_id" UUID,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unit_price" NUMERIC(12, 2) NOT NULL,
  "line_total" NUMERIC(12, 2) NOT NULL
);

CREATE INDEX "IDX_order_item_product" ON "order_items" ("product_id");
CREATE INDEX "IDX_order_item_variant" ON "order_items" ("product_variant_id");

ALTER TABLE "order_items"
  ADD CONSTRAINT "fk_order_item_order"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;
ALTER TABLE "order_items"
  ADD CONSTRAINT "fk_order_item_product"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;
ALTER TABLE "order_items"
  ADD CONSTRAINT "fk_order_item_variant"
  FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL;
