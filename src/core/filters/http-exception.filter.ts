import { ConfigService } from '@/config/config.service';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorObject } from './error-object.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(HttpExceptionFilter.name);
  }

  catch(exception: HttpException | any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { url, method } = request;
    const timestamp = new Date().toISOString();

    // Catch HttpExceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorMessage = exception.getResponse() as HttpException;

      const errorObject = {
        ...errorMessage,
      };

      const errorObjectForLogger = {
        statusCode: exception.getStatus(),
        method,
        url,
        timestamp,
        ...errorMessage,
      };

      this.logger.warn({ errorObjectForLogger, stack: exception.stack });

      return response.status(status).json(errorObject);
    }

    // Catch all other errors with a 500 status
    const status = exception.graph
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorObject: ErrorObject = {
      statusCode: status,
      method,
      url,
      timestamp,
      body: request.body,
    };

    if (exception instanceof Error) {
      errorObject.error = exception.name;
      errorObject.message = exception.message;
      errorObject.stack = exception.stack;
    } else {
      errorObject.error = 'INTERNAL SERVER';
    }
    this.logger.error({ errorObject, stack: exception.stack });
    return response.status(status).json(errorObject);
  }
}
