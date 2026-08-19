import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../src/app.module';

describe('Health endpoint', () => {
  let app: INestApplication | undefined;
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  }, 30000);
  afterAll(async () => {
    await app?.close();
  });
  it('reports the API and PostgreSQL as healthy', async () => {
    if (!app) throw new Error('Test application did not start');
    await request(app.getHttpServer()).get('/api/v1/health').expect(200).expect({ status: 'ok' });
  });
});
