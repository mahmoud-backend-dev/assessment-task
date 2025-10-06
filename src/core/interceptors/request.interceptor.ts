import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { isEmpty, isNull, isUndefined, omitBy } from 'lodash';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (!isEmpty(request.body)) {
      request.body = omitBy(request.body, (v) => isUndefined(v) || isNull(v) || v === '');
    }
    return next.handle();
  }
}
