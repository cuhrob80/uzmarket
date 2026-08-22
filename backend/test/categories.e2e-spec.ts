import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { Category } from '../src/entities';

describe('Categories API', () => {
  let app: INestApplication | undefined;
  let dataSource: DataSource;
  let parentCategory: Category;
  let childCategory: Category;
  let inactiveCategory: Category;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    dataSource = app.get(DataSource);
    const categoriesRepository = dataSource.getRepository(Category);

    parentCategory = await categoriesRepository.save(
      categoriesRepository.create({
        name: 'E2E Parent Category',
        slug: `e2e-parent-${Date.now()}`,
        parentId: null,
        isActive: true,
      }),
    );

    childCategory = await categoriesRepository.save(
      categoriesRepository.create({
        name: 'E2E Child Category',
        slug: `e2e-child-${Date.now()}`,
        parentId: parentCategory.id,
        isActive: true,
      }),
    );

    inactiveCategory = await categoriesRepository.save(
      categoriesRepository.create({
        name: 'E2E Inactive Category',
        slug: `e2e-inactive-${Date.now()}`,
        parentId: null,
        isActive: false,
      }),
    );
  }, 30000);

  afterAll(async () => {
    const categoriesRepository = dataSource.getRepository(Category);

    if (childCategory?.id) {
      await categoriesRepository.delete({ id: childCategory.id });
    }

    if (inactiveCategory?.id) {
      await categoriesRepository.delete({ id: inactiveCategory.id });
    }

    if (parentCategory?.id) {
      await categoriesRepository.delete({ id: parentCategory.id });
    }

    await app?.close();
  });

  it('lists active categories only', async () => {
    if (!app) throw new Error('Test application did not start');

    const response = await request(app.getHttpServer())
      .get('/api/v1/categories')
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: parentCategory.id,
          slug: parentCategory.slug,
          isActive: true,
        }),
        expect.objectContaining({
          id: childCategory.id,
          slug: childCategory.slug,
          isActive: true,
        }),
      ]),
    );

    expect(response.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: inactiveCategory.id,
        }),
      ]),
    );
  });

  it('gets an active category by slug', async () => {
    if (!app) throw new Error('Test application did not start');

    const response = await request(app.getHttpServer())
      .get(`/api/v1/categories/${childCategory.slug}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: childCategory.id,
      name: childCategory.name,
      slug: childCategory.slug,
      parentId: parentCategory.id,
      isActive: true,
    });
  });

  it('returns 404 for an inactive category', async () => {
    if (!app) throw new Error('Test application did not start');

    await request(app.getHttpServer())
      .get(`/api/v1/categories/${inactiveCategory.slug}`)
      .expect(404);
  });

  it('returns 404 for an unknown category slug', async () => {
    if (!app) throw new Error('Test application did not start');

    await request(app.getHttpServer())
      .get('/api/v1/categories/category-that-does-not-exist')
      .expect(404);
  });
});
