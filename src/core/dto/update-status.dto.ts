import { OrderStatus } from '../enums/order-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

const ORDER_STATUS_KEYS = Object.keys(OrderStatus).filter(k =>
  isNaN(Number(k))
);

export class UpdateStatusDto {
  @ApiProperty({
    description: 'Order status (accepts key like "PENDING" or number like 5)',
    enum: ORDER_STATUS_KEYS,
    example: 'DELIVERED',
  })
  @Transform(({ value }) => {
    // Already a number -> keep
    if (typeof value === 'number') return value;

    if (typeof value === 'string') {
      const trimmed = value.trim();

      // numeric string -> convert to number (e.g., "5" -> 5)
      if (/^\d+$/.test(trimmed)) return Number(trimmed);

      // non-numeric -> treat as enum key
      const key = trimmed.toUpperCase();
      if (ORDER_STATUS_KEYS.includes(key)) {
        return OrderStatus[key as keyof typeof OrderStatus]; // returns the numeric value
      }
    }

    return value;
  })
  @IsEnum(OrderStatus, {
    message: i18nValidationMessage('validation.IS_ENUM', {
      FIELD_NAME: '$t(common.FIELDS.STATUS)',
    }),
  })
  status: OrderStatus;
}
