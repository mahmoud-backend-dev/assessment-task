import { HttpStatus, Injectable } from '@nestjs/common';

interface ResponseParams {
  message?: string;
  data?: any;
  statusCode?: number;
}

@Injectable()
export class ResponseService {
  format(params: ResponseParams): any {
    console.log(params);
    const {
      statusCode = HttpStatus.OK,
      message = 'Request successful',
      data = null,
    } = params;

    return {
      statusCode,
      message,
      data,
    };
  }

  success(params: Omit<ResponseParams, 'statusCode'> = {}): any {
    return this.format({ statusCode: HttpStatus.OK, ...params });
  }

  created(params: Omit<ResponseParams, 'statusCode'> = {}): any {
    return this.format({ statusCode: HttpStatus.CREATED, ...params });
  }
}
