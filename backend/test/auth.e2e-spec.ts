import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { User } from '../src/entities';

describe('Auth API', () => {
  let app: INestApplication | undefined;
  let dataSource: DataSource;
  let email: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    dataSource = app.get(DataSource);
    email = `auth-${Date.now()}@example.com`;
  }, 30000);

  afterAll(async () => {
    if (dataSource && email) {
      await dataSource.getRepository(User).delete({ email });
    }

    await app?.close();
  });

  it('registers a user', async () => {
    if (!app) throw new Error('Test application did not start');

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'StrongPass123!',
        displayName: 'Auth E2E User',
        phone: '+998901234567',
      })
      .expect(201);

    expect(typeof response.body.accessToken).toBe('string');
    expect(response.body.user).toMatchObject({
      email,
      displayName: 'Auth E2E User',
      phone: '+998901234567',
    });

    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it('rejects duplicate email registration', async () => {
    if (!app) throw new Error('Test application did not start');

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'StrongPass123!',
        displayName: 'Duplicate User',
      })
      .expect(409);
  });

  it('logs in with valid credentials', async () => {
    if (!app) throw new Error('Test application did not start');

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email,
        password: 'StrongPass123!',
      })
      .expect(200);

    expect(typeof response.body.accessToken).toBe('string');
    expect(response.body.user.email).toBe(email);
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it('rejects invalid password', async () => {
    if (!app) throw new Error('Test application did not start');

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email,
        password: 'WrongPass123!',
      })
      .expect(401);
  });
});
