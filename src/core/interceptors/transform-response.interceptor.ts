import { RESPONSE_MESSAGE } from '@/core/decorators/response-message.decorator';
import { I18nHelperService } from '@/core/i18n/providers/I18n-helper-service';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { ResponseService } from '../custom-response/custom-response.service';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly i18nHelper: I18nHelperService,
    private readonly responseService: ResponseService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const [OPERATION = 'common.operation_succeeded', MODEL_NAME] =
      this.reflector.get<string[]>(RESPONSE_MESSAGE, context.getHandler()) ||
      [];

    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        // If already formatted, skip transformation
        if (data && typeof data.statusCode === 'number') {
          return data;
        }

        const message = this.i18nHelper.t(`response-messages.${OPERATION}`, {
          args: {
            MODEL_NAME: MODEL_NAME
              ? this.i18nHelper.t(`common.MODELS_NAMES.${MODEL_NAME}`)
              : '',
          },
        });

        return this.responseService.format({
          statusCode,
          data,
          message,
        });
      })
    );
  }
}
