import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class OptionalLocalizationDto {
  constructor(init?: Partial<OptionalLocalizationDto>) {
    if (init) {
      Object.assign(this, init);
    }
  }

  @ApiProperty({ example: 'Local Arabic' })
  @IsOptional()
  @IsString({ message: 'ar must be a string value' })
  ar: string;

  @ApiProperty({ example: 'Local English' })
  @IsOptional()
  @IsString({ message: 'en must be a string value' })
  en: string;
}
