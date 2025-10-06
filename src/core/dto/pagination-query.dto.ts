import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryDto {
  @ApiProperty({
    description: 'Page number (starts from 1)',
    type: Number,
    default: 1,
    required: false,
    minimum: 1,
    example: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page = 1;

  @ApiProperty({
    description: 'Number of items per page',
    type: Number,
    default: 20,
    required: false,
    minimum: 1,
    maximum: 1000,
    example: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit = 10;
}

