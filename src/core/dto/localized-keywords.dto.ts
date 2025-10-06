import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LocalizedKeywordsDto {
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
    message: args =>
      LocalizedKeywordsDto.getValidationMessage(args, 'EN', 'NOT_EMPTY'),
  })
  @IsString({
    message: args =>
      LocalizedKeywordsDto.getValidationMessage(args, 'EN', 'IS_STRING'),
  })
  @Length(2, 200, {
    message: args =>
      LocalizedKeywordsDto.getValidationMessage(args, 'EN', 'LENGTH'),
  })
  @Transform(({ value }) => (value != null ? value.toString().trim() : value))
  en: string;

  @IsNotEmpty({
    message: args =>
      LocalizedKeywordsDto.getValidationMessage(args, 'AR', 'NOT_EMPTY'),
  })
  @IsString({
    message: args =>
      LocalizedKeywordsDto.getValidationMessage(args, 'AR', 'IS_STRING'),
  })
  @Length(2, 200, {
    message: args =>
      LocalizedKeywordsDto.getValidationMessage(args, 'AR', 'LENGTH'),
  })
  @Transform(({ value }) => (value != null ? value.toString().trim() : value))
  ar: string;

  @Transform(({ value }) => {
    if (typeof value === 'object' && value !== null) {
      delete value._FIELD_NAME;
    }
    return value;
  })
  _FIELD_NAME?: string;
}
