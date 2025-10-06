import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class VariantInputDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsObject()
  @IsOptional()
  name?: Record<string, any> | null;

  @IsString()
  sku: string;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, any> | null;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  listPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;
}
