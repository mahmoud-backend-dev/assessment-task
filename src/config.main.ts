import { VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import rateLimiter from 'express-rate-limit';
import helmet from 'helmet';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import * as qs from 'qs';
import { ConfigService } from './config/config.service';
import { setupSwagger } from './swagger';
import cookieSession = require('cookie-session');

/**
 * Configure Express application and middleware.
 */
export function configure(
  app: NestExpressApplication,
  config: ConfigService
): void {
  app.set('trust proxy', true);

  // Use qs parser to support comma-separated arrays and nested query structures
  app.set('query parser', (str: string) => {
    try {
      return qs.parse(str, { comma: true });
    } catch (error) {
      console.error('Query parsing error:', error);
      return {};
    }
  });

  // Enable CORS FIRST â€” before helmet, cookieParser, etc.
  app.enableCors({
    origin: config.cors,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Access-Api, Lang',
  });

  app.use(
    helmet(),
    compression(),
    cookieParser(),
    cookieSession({ name: 'session', signed: true, keys: ['key'] }),
    rateLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: config.rateLimit,
      message: 'Too many requests, please try again later.',
    })
  );

  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    })
  );

  app.useGlobalFilters(
    new I18nValidationExceptionFilter({ detailedErrors: false })
  );

  app.setGlobalPrefix(config.globalPrefix);
  app.enableVersioning({ type: VersioningType.URI });

  setupSwagger(app);
}
