import { ConfigModule } from '@/config/config.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseModule } from './custom-response/custom-response.module';
import { HttpExceptionFilter } from './filters';
import { LoggingInterceptor, TransformInterceptor } from './interceptors';
import { LanguageMiddleware } from './middlewares/language.middleware';

@Module({
  imports: [ConfigModule.Deferred, ResponseModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LanguageMiddleware).forRoutes('*');
  }
}
