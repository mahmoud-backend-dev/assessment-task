import { IsOptional, IsString } from 'class-validator';
import { QueryDto } from '@/core/dto/pagination-query.dto';

export class AdminQueryDto extends QueryDto {
  @IsString()
  @IsOptional()
  search?: string;
}
