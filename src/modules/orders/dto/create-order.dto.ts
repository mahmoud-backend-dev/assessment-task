import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { OrderItemInputDto } from './order-item-input.dto';

export class CreateOrderDto {
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  @IsArray()
  items: OrderItemInputDto[];

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  deliveryFee?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
