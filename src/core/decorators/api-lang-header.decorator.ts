import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

export const ApiLangHeader = () =>
  applyDecorators(
    ApiHeader({
      name: 'Lang',
      description: 'Localization language key (e.g. en, ar)',
      required: false,
    })
  );
