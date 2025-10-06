import { BadRequestException, HttpStatus } from '@nestjs/common';

const message = ' already exists';
export class RecordExistsException extends BadRequestException {
  constructor(record: string) {
    super({ message: record + message, code: 24, statusCode: HttpStatus.BAD_REQUEST });
  }
}
