import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import { config } from 'dotenv';
import { join } from 'path';
import { AppModule } from './app.module';
import { configure } from './config.main';
import { ConfigService } from './config/config.service';
import { PrismaService } from './prisma/prisma.service';

// Load environment file based on NODE_ENV - temp
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';
config({ path: join(process.cwd(), envFile) });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'verbose', 'debug', 'log'],
  });

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const config = app.get(ConfigService);
  const port = config.port;

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Serve static files from uploads directory using absolute path
  const uploadsPath = join(process.cwd(), 'uploads');

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  configure(app, config);

  await app.listen(port);
  Logger.verbose(
    [
      `Current environment: ${config.nodeEnv}`,
      `Local Docs: http://localhost:3001/api/docs`,
    ].join('\n'),
    'NestApplication'
  );
}
bootstrap();
