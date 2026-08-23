import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { Category, Listing, User } from '../src/entities';

describe('Listings API', () => {
  let app: INestApplication | undefined;
  let dataSource: DataSource;
  let seller: User;
  let category: Category;
  let inactiveCategory: Category;
  let createdListingId: string | undefined;
  let accessToken: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    dataSource = app.get(DataSource);

    const usersRepository = dataSource.getRepository(User);
    const categoriesRepository = dataSource.getRepository(Category);

    seller = await usersRepository.save(
      usersRepository.create({
        email: `seller-${Date.now()}@example.com`,
        phone: null,
        displayName: 'E2E Seller',
        passwordHash: 'not-used-by-listings-e2e',
      }),
    );

    category = await categoriesRepository.save(
      categoriesRepository.create({
        name: 'E2E Category',
        slug: `e2e-category-${Date.now()}`,
        parentId: null,
        isActive: true,
      }),
    );

    inactiveCategory = await categoriesRepository.save(
      categoriesRepository.create({
        name: 'E2E Inactive Category',
        slug: `e2e-inactive-listings-${Date.now()}`,
        parentId: null,
        isActive: false,
      }),
    );

    const jwtService = app.get(JwtService);
    accessToken = await jwtService.signAsync({
      sub: seller.id,
      email: seller.email,
    });
  }, 30000);

  afterAll(async () => {
    if (createdListingId) {
      await dataSource.getRepository(Listing).delete({ id: createdListingId });
    }

    if (inactiveCategory?.id) {
      await dataSource.getRepository(Category).delete({ id: inactiveCategory.id });
    }

    if (category?.id) {
      await dataSource.getRepository(Category).delete({ id: category.id });
    }

    if (seller?.id) {
      await dataSource.getRepository(User).delete({ id: seller.id });
    }

    await app?.close();
  });

  it('rejects listing creation without authentication', async () => {
    if (!app) throw new Error('Test application did not start');

    await request(app.getHttpServer())
      .post('/api/v1/listings')
      .send({
        categoryId: category.id,
        title: 'Unauthorized Listing',
        description: 'Should not be created',
        price: '1000.00',
      })
      .expect(401);
  });

  it('creates a listing for the authenticated user', async () => {
    if (!app) throw new Error('Test application did not start');

    const response = await request(app.getHttpServer())
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        categoryId: category.id,
        title: 'E2E Listing',
        description: 'Marketplace listing created by e2e test',
        price: '150000.00',
        currency: 'UZS',
        location: 'Tashkent',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      sellerId: seller.id,
      categoryId: category.id,
      title: 'E2E Listing',
      description: 'Marketplace listing created by e2e test',
      price: '150000.00',
      currency: 'UZS',
      location: 'Tashkent',
      status: 'draft',
    });

    expect(typeof response.body.id).toBe('string');
    createdListingId = response.body.id;
  });

  it('ignores client-provided status and creates a draft', async () => {
    if (!app) throw new Error('Test application did not start');

    const response = await request(app.getHttpServer())
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        categoryId: category.id,
        title: 'Forced Active Listing',
        description: 'Client attempts to force active status',
        price: '200000.00',
        status: 'active',
      })
      .expect(201);

    expect(response.body.status).toBe('draft');

    await dataSource.getRepository(Listing).delete({ id: response.body.id });
  });

  it('rejects listing creation in an inactive category', async () => {
    if (!app) throw new Error('Test application did not start');

    await request(app.getHttpServer())
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        categoryId: inactiveCategory.id,
        title: 'Inactive Category Listing',
        description: 'Should not be created',
        price: '300000.00',
      })
      .expect(400);
  });

  it('gets a listing by id', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    const response = await request(app.getHttpServer())
      .get(`/api/v1/listings/${createdListingId}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: createdListingId,
      sellerId: seller.id,
      categoryId: category.id,
      title: 'E2E Listing',
      seller: {
        id: seller.id,
        displayName: seller.displayName,
      },
    });

    expect(response.body.seller.email).toBeUndefined();
    expect(response.body.seller.phone).toBeUndefined();
    expect(response.body.seller.passwordHash).toBeUndefined();
  });

  it('lists and filters listings', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    const response = await request(app.getHttpServer())
      .get('/api/v1/listings')
      .query({
        categoryId: category.id,
        status: 'draft',
        search: 'E2E',
        page: 1,
        limit: 20,
      })
      .expect(200);

    expect(response.body).toMatchObject({
      page: 1,
      limit: 20,
    });

    expect(response.body.total).toBeGreaterThanOrEqual(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdListingId,
          categoryId: category.id,
          status: 'draft',
        }),
      ]),
    );
  });
});
