import { HttpException, HttpStatus } from '@nestjs/common';

const message = 'Payment gateway server error';

export class PaymentGatewayException extends HttpException {
  constructor() {
    super(
      {
        message,
        code: 5050,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
