import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

type DateRangeOpts = ValidationOptions & {
  allowEqual?: boolean; // default: true (<=). Set to false to require strictly <
  requireBoth?: boolean; // default: false. If true, start & end must come together
};

/**
 * Validate a pair of ISO date fields on the same DTO.
 * Attach it to *end* (or any) property; it will read both.
 *
 * Example:
 *   @IsDateRange('startDate', 'endDate', { allowEqual: false, requireBoth: true, message: '...' })
 *   endDate?: string;
 */
export function IsDateRange(
  startKey: string,
  endKey: string,
  opts: DateRangeOpts = {}
) {
  const allowEqual = opts.allowEqual ?? true;
  const requireBoth = opts.requireBoth ?? false;

  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsDateRange',
      target: object.constructor,
      propertyName,
      constraints: [startKey, endKey, allowEqual, requireBoth],
      options: opts,
      validator: {
        validate(_: any, args: ValidationArguments) {
          const [sKey, eKey, _allowEqual, _requireBoth] = args.constraints as [
            string,
            string,
            boolean,
            boolean,
          ];
          const obj: any = args.object;

          const s = obj?.[sKey];
          const e = obj?.[eKey];

          // Neither provided → OK
          if (s == null && e == null) return true;

          // Only one provided
          if (s == null || e == null) {
            return _requireBoth ? false : true;
          }

          // Both provided → compare
          const sT = Date.parse(s);
          const eT = Date.parse(e);
          if (!Number.isFinite(sT) || !Number.isFinite(eT)) {
            // Let @IsDateString handle format errors
            return true;
          }
          return _allowEqual ? sT <= eT : sT < eT;
        },
      },
    });
  };
}
