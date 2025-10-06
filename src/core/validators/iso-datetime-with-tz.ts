import { registerDecorator, ValidationOptions } from 'class-validator';

const ISO_DATETIME_TZ =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(Z|[+\-]\d{2}:\d{2})$/;

export function IsIsoDateTimeWithTimezone(
  validationOptions?: ValidationOptions
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsIsoDateTimeWithTimezone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return (
            typeof value === 'string' && ISO_DATETIME_TZ.test(value.trim())
          );
        },
      },
    });
  };
}
