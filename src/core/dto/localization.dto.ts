import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LocalizationDto {
  constructor(init?: Partial<LocalizationDto>) {
    if (init) {
      Object.assign(this, init);
    }
  }

  @ApiProperty({ example: 'Local Arabic' })
  @IsString({ message: 'ar must be a string value' })
  ar: string;

  @ApiProperty({ example: 'Local English' })
  @IsString({ message: 'en must be a string value' })
  en: string;
}