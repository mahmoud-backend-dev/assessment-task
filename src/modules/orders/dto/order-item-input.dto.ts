import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class OrderItemInputDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  @IsOptional()
  productVariantId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
