// import {
//   ValidatorConstraint,
//   ValidatorConstraintInterface,
//   ValidationArguments,
// } from 'class-validator';
// import { plateNumberMatches } from '../constants';

// @ValidatorConstraint({ name: 'plateNumberValidation', async: false })
// export class PlateNumberValidation implements ValidatorConstraintInterface {
//   validate(value: string, args: ValidationArguments): boolean {
//     const object = args.object as any;
//     const isSaudiPlate = object.is_saudi_plate !== undefined ? object.is_saudi_plate : true;

//     if (isSaudiPlate) {
//       // Saudi plate validation (e.g., 4 digits + 3 uppercase letters)
//       const regex = plateNumberMatches;
//       return regex.test(value);
//     } else {
//       // Non-Saudi plate validation: 1-10 characters max
//       return value.length >= 1 && value.length <= 10;
//     }
//   }

//   defaultMessage(args: ValidationArguments): string {
//     const object = args.object as any;
//     const isSaudiPlate = object.is_saudi_plate !== undefined ? object.is_saudi_plate : true;

//     if (isSaudiPlate) {
//       return 'Number plate should be in the format of 4 digits followed by 3 uppercase letters';
//     } else {
//       return 'Kindly enter a valid plate number (1 to 10 characters).';
//     }
//   }
// }
