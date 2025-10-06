import { OrderStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { QueryDto } from '@/core/dto/pagination-query.dto';

export class OrderQueryDto extends QueryDto {
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
