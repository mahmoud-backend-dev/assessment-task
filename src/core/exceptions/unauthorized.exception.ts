import { HttpStatus, UnauthorizedException } from '@nestjs/common';

export class UnauthorizedRpcException extends UnauthorizedException {
  constructor(message: string) {
    super({ message, code: 41, statusCode: HttpStatus.UNAUTHORIZED });
  }
}
