import { HttpStatus, NotFoundException } from '@nestjs/common';

const message = ' not found';
export class RecordNotFoundException extends NotFoundException {
  constructor(record: string) {
    super({ message: record + message, code: 24, statusCode: HttpStatus.NOT_FOUND });
  }
}
