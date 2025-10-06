import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsUniqueBy<K extends string>(
  key: K,
  validationOptions?: ValidationOptions
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsUniqueBy',
      target: object.constructor,
      propertyName,
      constraints: [key],
      options: validationOptions,
      validator: {
        validate(values: any[], args: ValidationArguments) {
          if (!Array.isArray(values)) return false;
          const k = args.constraints[0] as string;
          const seen = new Set<string>();
          for (const item of values) {
            const raw = item?.[k];
            const norm =
              typeof raw === 'string' ? raw.trim().toUpperCase() : '';
            if (!norm) return false; // empty/invalid code in array item
            if (seen.has(norm)) return false; // duplicate found
            seen.add(norm);
          }
          return true;
        },
        defaultMessage(args?: ValidationArguments) {
          // fallback message; you’ll pass an i18n message in usage below
          return `Array items must be unique by "${args?.constraints?.[0]}"`;
        },
      },
    });
  };
}
