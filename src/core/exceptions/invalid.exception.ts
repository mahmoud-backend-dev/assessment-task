import { BadRequestException, HttpStatus } from '@nestjs/common';

export class InvalidException extends BadRequestException {
  constructor(message: string) {
    super({ message, code: 40, statusCode: HttpStatus.BAD_REQUEST });
  }
}
