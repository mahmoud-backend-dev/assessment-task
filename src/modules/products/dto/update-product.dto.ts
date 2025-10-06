import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateProductDto } from './create-product.dto';
import { VariantInputDto } from './variant-input.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantInputDto)
  @IsOptional()
  variants?: VariantInputDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  removeVariantIds?: string[];
}
