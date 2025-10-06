import { ProductStatus, ProductType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { VariantInputDto } from './variant-input.dto';

export class CreateProductDto {
  @IsObject()
  @IsNotEmpty()
  name: Record<string, any>;

  @IsObject()
  @IsOptional()
  description?: Record<string, any>;

  @IsObject()
  @IsOptional()
  shortDescription?: Record<string, any>;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  basePrice?: number;

  @IsEnum(ProductType)
  type: ProductType;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsBoolean()
  @IsOptional()
  isBestPrice?: boolean;

  @IsBoolean()
  @IsOptional()
  isExclusive?: boolean;

  @IsBoolean()
  @IsOptional()
  isTopSelling?: boolean;

  @IsBoolean()
  @IsOptional()
  isNewArrival?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantInputDto)
  @ArrayNotEmpty()
  variants: VariantInputDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];
}
