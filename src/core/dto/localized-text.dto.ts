import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LocalizedTextDto {
  private static getValidationMessage(
    args: any,
    lang: 'EN' | 'AR',
    key: string
  ) {
    const FIELD_NAME = args.object?._FIELD_NAME || 'NAME';
    return i18nValidationMessage(`validation.${lang}_${key}`, {
      FIELD_NAME: `$t(common.FIELDS.${FIELD_NAME})`,
    })(args);
  }

  @IsNotEmpty({
    message: (args) =>
      LocalizedTextDto.getValidationMessage(args, 'EN', 'NOT_EMPTY'),
  })
  @IsString({
    message: (args) =>
      LocalizedTextDto.getValidationMessage(args, 'EN', 'IS_STRING'),
  })
  @Length(2, 300, {
    // Allow longer text if needed
    message: (args) =>
      LocalizedTextDto.getValidationMessage(args, 'EN', 'LENGTH'),
  })
  @Transform(({ value }) => value.toString().trim())
  en: string;

  @IsNotEmpty({
    message: (args) =>
      LocalizedTextDto.getValidationMessage(args, 'AR', 'NOT_EMPTY'),
  })
  @IsString({
    message: (args) =>
      LocalizedTextDto.getValidationMessage(args, 'AR', 'IS_STRING'),
  })
  @Length(2, 300, {
    message: (args) =>
      LocalizedTextDto.getValidationMessage(args, 'AR', 'LENGTH'),
  })
  @Transform(({ value }) => value.toString().trim())
  ar: string;

  @Transform(({ value }) => {
    if (typeof value === 'object' && value !== null) {
      delete value._FIELD_NAME;
    }
    return value;
  })
  _FIELD_NAME?: string;
}
