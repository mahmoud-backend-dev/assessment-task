import { ProductStatus, ProductType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { QueryDto } from '@/core/dto/pagination-query.dto';

export class ProductQueryDto extends QueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isExclusive?: boolean;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isBestPrice?: boolean;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isTopSelling?: boolean;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isNewArrival?: boolean;
}
