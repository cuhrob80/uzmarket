import { resolve } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import type { Environment } from './config/environment';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get<ConfigService<Environment, true>>(ConfigService);
  const storagePath =
    config.get('STORAGE_LOCAL_PATH', { infer: true }) ?? './storage';

  app.useStaticAssets(resolve(storagePath), {
    prefix: '/media/',
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({ origin: config.get('FRONTEND_URL', { infer: true }), credentials: false });
  await app.listen(config.get('PORT', { infer: true }));
}
void bootstrap();
