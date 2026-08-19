import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { Category, Listing, User } from '../src/entities';

describe('Listings API', () => {
  let app: INestApplication | undefined;
  let dataSource: DataSource;
  let seller: User;
  let category: Category;
  let createdListingId: string | undefined;

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
  }, 30000);

  afterAll(async () => {
    if (createdListingId) {
      await dataSource.getRepository(Listing).delete({ id: createdListingId });
    }

    if (category?.id) {
      await dataSource.getRepository(Category).delete({ id: category.id });
    }

    if (seller?.id) {
      await dataSource.getRepository(User).delete({ id: seller.id });
    }

    await app?.close();
  });

  it('creates a listing', async () => {
    if (!app) throw new Error('Test application did not start');

    const response = await request(app.getHttpServer())
      .post('/api/v1/listings')
      .send({
        sellerId: seller.id,
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
    });
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
