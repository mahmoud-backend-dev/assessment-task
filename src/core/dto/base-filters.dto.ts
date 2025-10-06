import { QueryDto } from '@/core/dto/pagination-query.dto';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class BaseFiltersDto {
  @ApiPropertyOptional({
    description: `Filters object (JSON string). Example: {"name[like]":"admin","status[ne]":"false"}`,
    type: String,
    example: '{"name[like]":"admin","status[ne]":"false"}',
  })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return {};
    }
  })
  @IsObject()
  filters?: Record<string, any>;

  @ApiPropertyOptional({
    description: `Sorting object (JSON string). Example: {"created_at":"ASC","name":"DESC"}`,
    type: String,
    example: '{"created_at":"ASC","name":"DESC"}',
  })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return {};
    }
  })
  @IsObject()
  sort?: Record<string, 'ASC' | 'DESC' | 'asc' | 'desc'>;

  @ApiPropertyOptional({ description: 'Search keyword.' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class PaginationAndFiltersDto extends IntersectionType(
  BaseFiltersDto,
  QueryDto
) {}
