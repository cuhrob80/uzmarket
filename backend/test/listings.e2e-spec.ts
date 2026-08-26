import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import sharp from 'sharp';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { Category, Listing, ListingImage, ListingStatus, User } from '../src/entities';
import { STORAGE_PROVIDER, type StorageProvider } from '../src/storage/storage.types';

describe('Listings API', () => {
  let app: INestApplication | undefined;
  let dataSource: DataSource;
  let seller: User;
  let otherUser: User;
  let category: Category;
  let inactiveCategory: Category;
  let createdListingId: string | undefined;
  let accessToken: string;
  let otherAccessToken: string;

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

    otherUser = await usersRepository.save(
      usersRepository.create({
        email: `other-${Date.now()}@example.com`,
        phone: null,
        displayName: 'E2E Other User',
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

    otherAccessToken = await jwtService.signAsync({
      sub: otherUser.id,
      email: otherUser.email,
    });
  }, 30000);

  afterAll(async () => {
    if (createdListingId) {
      const images = await dataSource.getRepository(ListingImage).find({
        where: { listingId: createdListingId },
      });

      const storage = app?.get<StorageProvider>(STORAGE_PROVIDER);

      if (storage) {
        for (const image of images) {
          if (image.storageKey) {
            await storage.deleteObject(image.storageKey);
          }
        }
      }

      await dataSource.getRepository(Listing).delete({ id: createdListingId });
    }

    if (inactiveCategory?.id) {
      await dataSource.getRepository(Category).delete({ id: inactiveCategory.id });
    }

    if (category?.id) {
      await dataSource.getRepository(Category).delete({ id: category.id });
    }

    if (otherUser?.id) {
      await dataSource.getRepository(User).delete({ id: otherUser.id });
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
      status: ListingStatus.Draft,
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
        status: ListingStatus.Active,
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

  it('allows the owner to update a draft listing', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/listings/${createdListingId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated E2E Listing',
        price: '175000.00',
        location: 'Samarkand',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      id: createdListingId,
      sellerId: seller.id,
      title: 'Updated E2E Listing',
      price: '175000.00',
      location: 'Samarkand',
      status: ListingStatus.Draft,
    });
  });

  it('returns 404 when another user tries to update the listing', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    await request(app.getHttpServer())
      .patch(`/api/v1/listings/${createdListingId}`)
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .send({
        title: 'Hijacked Listing',
      })
      .expect(404);
  });

  it('does not allow sellerId or status to be changed through update', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/listings/${createdListingId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sellerId: otherUser.id,
        status: ListingStatus.Active,
        description: 'Updated safely',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      id: createdListingId,
      sellerId: seller.id,
      status: ListingStatus.Draft,
      description: 'Updated safely',
    });
  });

  it('rejects image upload without authentication', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    const image = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 100, g: 100, b: 100 },
      },
    })
      .jpeg()
      .toBuffer();

    await request(app.getHttpServer())
      .post(`/api/v1/listings/${createdListingId}/images`)
      .attach('file', image, {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      })
      .expect(401);
  });

  it('returns 404 when another user uploads an image to the listing', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    const image = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 90, g: 90, b: 90 },
      },
    })
      .jpeg()
      .toBuffer();

    await request(app.getHttpServer())
      .post(`/api/v1/listings/${createdListingId}/images`)
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .attach('file', image, {
        filename: 'foreign.jpg',
        contentType: 'image/jpeg',
      })
      .expect(404);
  });

  it('rejects image upload without a file', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    await request(app.getHttpServer())
      .post(`/api/v1/listings/${createdListingId}/images`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  it('rejects invalid image content', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    await request(app.getHttpServer())
      .post(`/api/v1/listings/${createdListingId}/images`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', Buffer.from('not-an-image'), {
        filename: 'fake.jpg',
        contentType: 'image/jpeg',
      })
      .expect(400);
  });

  it('uploads an image and stores a WebP image record', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    const image = await sharp({
      create: {
        width: 1600,
        height: 1200,
        channels: 3,
        background: { r: 20, g: 40, b: 60 },
      },
    })
      .jpeg()
      .toBuffer();

    const response = await request(app.getHttpServer())
      .post(`/api/v1/listings/${createdListingId}/images`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', image, {
        filename: 'listing.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      url: expect.any(String),
      sortOrder: 0,
    });

    expect(response.body.storageKey).toBeUndefined();
    expect(response.body.mimeType).toBeUndefined();
    expect(response.body.fileSizeBytes).toBeUndefined();

    const storedImage = await dataSource.getRepository(ListingImage).findOneByOrFail({
      id: response.body.id,
    });

    expect(storedImage.listingId).toBe(createdListingId);
    expect(storedImage.mimeType).toBe('image/webp');
    expect(storedImage.storageKey).toMatch(
      new RegExp(`^listings/${createdListingId}/.+\\.webp$`),
    );
    expect(storedImage.width).toBe(1600);
    expect(storedImage.height).toBe(1200);
    expect(storedImage.sortOrder).toBe(0);
  });

  it('limits a listing to 10 images', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    const image = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 50, g: 70, b: 90 },
      },
    })
      .jpeg()
      .toBuffer();

    for (let sortOrder = 1; sortOrder < 10; sortOrder += 1) {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/listings/${createdListingId}/images`)
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', image, {
          filename: `listing-${sortOrder}.jpg`,
          contentType: 'image/jpeg',
        })
        .expect(201);

      expect(response.body.sortOrder).toBe(sortOrder);
    }

    await request(app.getHttpServer())
      .post(`/api/v1/listings/${createdListingId}/images`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', image, {
        filename: 'eleventh.jpg',
        contentType: 'image/jpeg',
      })
      .expect(400);

    const count = await dataSource.getRepository(ListingImage).count({
      where: { listingId: createdListingId },
    });

    expect(count).toBe(10);
  });

  it('rejects image deletion without authentication', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    const image = await dataSource.getRepository(ListingImage).findOneOrFail({
      where: { listingId: createdListingId },
      order: { sortOrder: 'ASC' },
    });

    await request(app.getHttpServer())
      .delete(`/api/v1/listings/${createdListingId}/images/${image.id}`)
      .expect(401);
  });

  it('returns 404 when another user tries to delete an image', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    const imagesRepository = dataSource.getRepository(ListingImage);
    const image = await imagesRepository.findOneOrFail({
      where: { listingId: createdListingId },
      order: { sortOrder: 'ASC' },
    });

    await request(app.getHttpServer())
      .delete(`/api/v1/listings/${createdListingId}/images/${image.id}`)
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .expect(404);

    const unchanged = await imagesRepository.findOneBy({ id: image.id });
    expect(unchanged).not.toBeNull();
  });

  it('returns 404 when the image does not belong to the listing', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    const listingsRepository = dataSource.getRepository(Listing);
    const imagesRepository = dataSource.getRepository(ListingImage);

    const otherListing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Other Listing For Image Delete',
        description: 'Used to verify image ownership',
        price: '100000.00',
        currency: 'UZS',
        status: ListingStatus.Draft,
        location: null,
      }),
    );

    const image = await imagesRepository.findOneOrFail({
      where: { listingId: createdListingId },
      order: { sortOrder: 'ASC' },
    });

    try {
      await request(app.getHttpServer())
        .delete(`/api/v1/listings/${otherListing.id}/images/${image.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      const unchanged = await imagesRepository.findOneBy({ id: image.id });
      expect(unchanged).not.toBeNull();
    } finally {
      await listingsRepository.delete({ id: otherListing.id });
    }
  });

  it('allows the owner to delete an image and compacts sort order', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    const imagesRepository = dataSource.getRepository(ListingImage);

    const before = await imagesRepository.find({
      where: { listingId: createdListingId },
      order: { sortOrder: 'ASC' },
    });

    expect(before).toHaveLength(10);

    const imageToDelete = before[4];
    const deletedImageId = imageToDelete.id;
    const deletedStorageKey = imageToDelete.storageKey;

    expect(deletedStorageKey).not.toBeNull();

    const deletedFilePath = resolve(
      process.env.STORAGE_LOCAL_PATH ?? './storage',
      deletedStorageKey!,
    );

    await expect(access(deletedFilePath)).resolves.toBeUndefined();

    await request(app.getHttpServer())
      .delete(
        `/api/v1/listings/${createdListingId}/images/${deletedImageId}`,
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    const deletedImage = await imagesRepository.findOneBy({
      id: deletedImageId,
    });

    expect(deletedImage).toBeNull();

    await expect(access(deletedFilePath)).rejects.toThrow();

    const after = await imagesRepository.find({
      where: { listingId: createdListingId },
      order: { sortOrder: 'ASC' },
    });

    expect(after).toHaveLength(9);
    expect(after.map((image) => image.sortOrder)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8,
    ]);

    expect(after.some((image) => image.storageKey === deletedStorageKey)).toBe(
      false,
    );
  });

  it('allows the owner to reorder listing images', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);
    const imagesRepository = dataSource.getRepository(ListingImage);

    const listing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Image Reorder Listing',
        description: 'Listing used to test image ordering',
        price: '100000.00',
        currency: 'UZS',
        status: ListingStatus.Draft,
        location: null,
      }),
    );

    const images = await imagesRepository.save([
      imagesRepository.create({
        listingId: listing.id,
        url: 'http://localhost/media/reorder-1.webp',
        sortOrder: 0,
      }),
      imagesRepository.create({
        listingId: listing.id,
        url: 'http://localhost/media/reorder-2.webp',
        sortOrder: 1,
      }),
      imagesRepository.create({
        listingId: listing.id,
        url: 'http://localhost/media/reorder-3.webp',
        sortOrder: 2,
      }),
    ]);

    try {
      const desiredOrder = [
        images[2].id,
        images[0].id,
        images[1].id,
      ];

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/listings/${listing.id}/images/order`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          imageIds: desiredOrder,
        })
        .expect(200);

      expect(response.body.map((image: { id: string }) => image.id)).toEqual(
        desiredOrder,
      );

      expect(
        response.body.map((image: { sortOrder: number }) => image.sortOrder),
      ).toEqual([0, 1, 2]);

      const stored = await imagesRepository.find({
        where: { listingId: listing.id },
        order: { sortOrder: 'ASC' },
      });

      expect(stored.map((image) => image.id)).toEqual(desiredOrder);
      expect(stored[0].id).toBe(images[2].id);
      expect(stored[0].sortOrder).toBe(0);
    } finally {
      await listingsRepository.delete({ id: listing.id });
    }
  });

  it('protects listing image reorder from invalid requests', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);
    const imagesRepository = dataSource.getRepository(ListingImage);

    const listing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Protected Image Reorder Listing',
        description: 'Listing used to test reorder protection',
        price: '100000.00',
        currency: 'UZS',
        status: ListingStatus.Draft,
        location: null,
      }),
    );

    const otherListing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Other Image Listing',
        description: 'Provides an image belonging to another listing',
        price: '100000.00',
        currency: 'UZS',
        status: ListingStatus.Draft,
        location: null,
      }),
    );

    const images = await imagesRepository.save([
      imagesRepository.create({
        listingId: listing.id,
        url: 'http://localhost/media/protected-reorder-1.webp',
        sortOrder: 0,
      }),
      imagesRepository.create({
        listingId: listing.id,
        url: 'http://localhost/media/protected-reorder-2.webp',
        sortOrder: 1,
      }),
    ]);

    const foreignImage = await imagesRepository.save(
      imagesRepository.create({
        listingId: otherListing.id,
        url: 'http://localhost/media/foreign-reorder.webp',
        sortOrder: 0,
      }),
    );

    try {
      await request(app.getHttpServer())
        .patch(`/api/v1/listings/${listing.id}/images/order`)
        .set('Authorization', `Bearer ${otherAccessToken}`)
        .send({
          imageIds: [images[1].id, images[0].id],
        })
        .expect(404);

      await request(app.getHttpServer())
        .patch(`/api/v1/listings/${listing.id}/images/order`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          imageIds: [images[0].id],
        })
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/api/v1/listings/${listing.id}/images/order`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          imageIds: [images[0].id, images[0].id],
        })
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/api/v1/listings/${listing.id}/images/order`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          imageIds: [images[0].id, foreignImage.id],
        })
        .expect(400);

      const unchanged = await imagesRepository.find({
        where: { listingId: listing.id },
        order: { sortOrder: 'ASC' },
      });

      expect(unchanged.map((image) => image.id)).toEqual([
        images[0].id,
        images[1].id,
      ]);
    } finally {
      await listingsRepository.delete({ id: listing.id });
      await listingsRepository.delete({ id: otherListing.id });
    }
  });

  it('protects and returns one owner listing for editing', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);
    const imagesRepository = dataSource.getRepository(ListingImage);

    const listing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Owner Editable Draft',
        description: 'Draft used for owner detail endpoint',
        price: '125000.00',
        currency: 'UZS',
        status: ListingStatus.Draft,
        location: 'Tashkent',
      }),
    );

    await imagesRepository.save([
      imagesRepository.create({
        listingId: listing.id,
        url: 'http://localhost/media/owner-detail-2.webp',
        sortOrder: 1,
      }),
      imagesRepository.create({
        listingId: listing.id,
        url: 'http://localhost/media/owner-detail-1.webp',
        sortOrder: 0,
      }),
    ]);

    try {
      await request(app.getHttpServer())
        .get(`/api/v1/listings/mine/${listing.id}`)
        .expect(401);

      await request(app.getHttpServer())
        .get(`/api/v1/listings/mine/${listing.id}`)
        .set('Authorization', `Bearer ${otherAccessToken}`)
        .expect(404);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/listings/mine/${listing.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: listing.id,
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Owner Editable Draft',
        status: ListingStatus.Draft,
      });

      expect(
        response.body.images.map(
          (image: { sortOrder: number }) => image.sortOrder,
        ),
      ).toEqual([0, 1]);
    } finally {
      await listingsRepository.delete({ id: listing.id });
    }
  });

  it('allows the owner to publish a ready draft listing', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);
    const imagesRepository = dataSource.getRepository(ListingImage);

    const listing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Publishable Draft',
        description: 'Draft listing for publish test',
        price: '400000.00',
        currency: 'UZS',
        status: ListingStatus.Draft,
        location: 'Tashkent',
      }),
    );

    await imagesRepository.save(
      imagesRepository.create({
        listingId: listing.id,
        url: `/uploads/test/${listing.id}.webp`,
        storageKey: null,
        mimeType: 'image/webp',
        width: 800,
        height: 600,
        fileSizeBytes: '1000',
        sortOrder: 0,
      }),
    );

    try {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/listings/${listing.id}/publish`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body).toMatchObject({
        id: listing.id,
        sellerId: seller.id,
        status: ListingStatus.Active,
      });
    } finally {
      await listingsRepository.delete({ id: listing.id });
    }
  });

  it('rejects publishing a draft without images', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);

    const listing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Draft Without Images',
        description: 'Draft listing without images',
        price: '400000.00',
        currency: 'UZS',
        status: ListingStatus.Draft,
        location: 'Tashkent',
      }),
    );

    try {
      await request(app.getHttpServer())
        .post(`/api/v1/listings/${listing.id}/publish`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);

      const storedListing = await listingsRepository.findOneByOrFail({
        id: listing.id,
      });

      expect(storedListing.status).toBe(ListingStatus.Draft);
    } finally {
      await listingsRepository.delete({ id: listing.id });
    }
  });

  it('rejects publishing a draft with zero price', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);
    const imagesRepository = dataSource.getRepository(ListingImage);

    const listing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Zero Price Draft',
        description: 'Draft listing with zero price',
        price: '0.00',
        currency: 'UZS',
        status: ListingStatus.Draft,
        location: 'Tashkent',
      }),
    );

    await imagesRepository.save(
      imagesRepository.create({
        listingId: listing.id,
        url: `/uploads/test/${listing.id}.webp`,
        storageKey: null,
        mimeType: 'image/webp',
        width: 800,
        height: 600,
        fileSizeBytes: '1000',
        sortOrder: 0,
      }),
    );

    try {
      await request(app.getHttpServer())
        .post(`/api/v1/listings/${listing.id}/publish`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);

      const storedListing = await listingsRepository.findOneByOrFail({
        id: listing.id,
      });

      expect(storedListing.status).toBe(ListingStatus.Draft);
    } finally {
      await listingsRepository.delete({ id: listing.id });
    }
  });

  it('returns 404 when another user tries to publish the listing', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);
    const listing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Protected Draft',
        description: 'Draft listing owned by another user',
        price: '410000.00',
        currency: 'UZS',
        status: ListingStatus.Draft,
        location: null,
      }),
    );

    try {
      await request(app.getHttpServer())
        .post(`/api/v1/listings/${listing.id}/publish`)
        .set('Authorization', `Bearer ${otherAccessToken}`)
        .expect(404);
    } finally {
      await listingsRepository.delete({ id: listing.id });
    }
  });

  it('rejects publishing a listing whose category is inactive', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);
    const listing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: inactiveCategory.id,
        title: 'Inactive Category Draft',
        description: 'Draft listing with inactive category',
        price: '420000.00',
        currency: 'UZS',
        status: ListingStatus.Draft,
        location: null,
      }),
    );

    try {
      await request(app.getHttpServer())
        .post(`/api/v1/listings/${listing.id}/publish`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);

      const unchanged = await listingsRepository.findOneByOrFail({ id: listing.id });
      expect(unchanged.status).toBe('draft');
    } finally {
      await listingsRepository.delete({ id: listing.id });
    }
  });

  it('rejects publishing an already active listing', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);
    const listing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Already Active Listing',
        description: 'Active listing for transition validation',
        price: '430000.00',
        currency: 'UZS',
        status: ListingStatus.Active,
        location: null,
      }),
    );

    try {
      await request(app.getHttpServer())
        .post(`/api/v1/listings/${listing.id}/publish`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    } finally {
      await listingsRepository.delete({ id: listing.id });
    }
  });

  it('allows the owner to mark an active listing as sold', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);
    const listing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Active Listing To Sell',
        description: 'Active listing for sold transition',
        price: '500000.00',
        currency: 'UZS',
        status: ListingStatus.Active,
        location: null,
      }),
    );

    try {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/listings/${listing.id}/sold`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body.status).toBe(ListingStatus.Sold);
    } finally {
      await listingsRepository.delete({ id: listing.id });
    }
  });

  it('rejects marking a draft listing as sold', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);
    const listing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Draft Listing Not Sold',
        description: 'Draft listing for invalid sold transition',
        price: '510000.00',
        currency: 'UZS',
        status: ListingStatus.Draft,
        location: null,
      }),
    );

    try {
      await request(app.getHttpServer())
        .post(`/api/v1/listings/${listing.id}/sold`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    } finally {
      await listingsRepository.delete({ id: listing.id });
    }
  });

  it('allows the owner to archive a draft listing', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);
    const listing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Draft Listing To Archive',
        description: 'Draft listing for archive transition',
        price: '520000.00',
        currency: 'UZS',
        status: ListingStatus.Draft,
        location: null,
      }),
    );

    try {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/listings/${listing.id}/archive`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body.status).toBe(ListingStatus.Archived);
    } finally {
      await listingsRepository.delete({ id: listing.id });
    }
  });

  it('allows the owner to archive an active listing', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);
    const listing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Active Listing To Archive',
        description: 'Active listing for archive transition',
        price: '530000.00',
        currency: 'UZS',
        status: ListingStatus.Active,
        location: null,
      }),
    );

    try {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/listings/${listing.id}/archive`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body.status).toBe(ListingStatus.Archived);
    } finally {
      await listingsRepository.delete({ id: listing.id });
    }
  });

  it('rejects archiving a sold listing', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);
    const listing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Sold Listing Stays Sold',
        description: 'Sold listing for invalid archive transition',
        price: '540000.00',
        currency: 'UZS',
        status: ListingStatus.Sold,
        location: null,
      }),
    );

    try {
      await request(app.getHttpServer())
        .post(`/api/v1/listings/${listing.id}/archive`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    } finally {
      await listingsRepository.delete({ id: listing.id });
    }
  });

  it('prevents another user from changing listing lifecycle', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);
    const listing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Protected Active Listing',
        description: 'Ownership protection for lifecycle actions',
        price: '550000.00',
        currency: 'UZS',
        status: ListingStatus.Active,
        location: null,
      }),
    );

    try {
      await request(app.getHttpServer())
        .post(`/api/v1/listings/${listing.id}/sold`)
        .set('Authorization', `Bearer ${otherAccessToken}`)
        .expect(404);

      await request(app.getHttpServer())
        .post(`/api/v1/listings/${listing.id}/archive`)
        .set('Authorization', `Bearer ${otherAccessToken}`)
        .expect(404);
    } finally {
      await listingsRepository.delete({ id: listing.id });
    }
  });

  it('does not expose a draft listing through the public endpoint', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    await request(app.getHttpServer())
      .get(`/api/v1/listings/${createdListingId}`)
      .expect(404);
  });

  it('lists active listings publicly and hides drafts', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    const listingsRepository = dataSource.getRepository(Listing);
    const activeListing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Public Active Listing',
        description: 'Visible in the public marketplace',
        price: '600000.00',
        currency: 'UZS',
        status: ListingStatus.Active,
        location: 'Tashkent',
      }),
    );

    try {
      const response = await request(app.getHttpServer())
        .get('/api/v1/listings')
        .query({
          categoryId: category.id,
          page: 1,
          limit: 20,
        })
        .expect(200);

      expect(response.body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: activeListing.id,
            status: ListingStatus.Active,
          }),
        ]),
      );

      expect(response.body.items).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: createdListingId,
          }),
        ]),
      );
    } finally {
      await listingsRepository.delete({ id: activeListing.id });
    }
  });

  it('filters public listings by price, currency, location and combined criteria', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);

    const filterListings = await listingsRepository.save([
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Filter Cheap Tashkent',
        description: 'Public listing used for filter tests',
        price: '100000.00',
        currency: 'UZS',
        status: ListingStatus.Active,
        location: 'Tashkent',
      }),
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Filter Expensive Tashkent',
        description: 'Public listing used for filter tests',
        price: '900000.00',
        currency: 'UZS',
        status: ListingStatus.Active,
        location: 'Tashkent',
      }),
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Filter Samarkand USD',
        description: 'Public listing used for filter tests',
        price: '500.00',
        currency: 'USD',
        status: ListingStatus.Active,
        location: 'Samarkand',
      }),
    ]);

    const [
      cheapTashkent,
      expensiveTashkent,
      samarkandUsd,
    ] = filterListings;

    try {
      const minPriceResponse = await request(app.getHttpServer())
        .get('/api/v1/listings')
        .query({
          search: 'Filter',
          minPrice: 500000,
          page: 1,
          limit: 20,
        })
        .expect(200);

      expect(
        minPriceResponse.body.items.map(
          (item: { id: string }) => item.id,
        ),
      ).toContain(expensiveTashkent.id);

      expect(
        minPriceResponse.body.items.map(
          (item: { id: string }) => item.id,
        ),
      ).not.toContain(cheapTashkent.id);

      const maxPriceResponse = await request(app.getHttpServer())
        .get('/api/v1/listings')
        .query({
          search: 'Filter',
          maxPrice: 200000,
          currency: 'UZS',
          page: 1,
          limit: 20,
        })
        .expect(200);

      expect(
        maxPriceResponse.body.items.map(
          (item: { id: string }) => item.id,
        ),
      ).toContain(cheapTashkent.id);

      expect(
        maxPriceResponse.body.items.map(
          (item: { id: string }) => item.id,
        ),
      ).not.toContain(expensiveTashkent.id);

      const currencyResponse = await request(app.getHttpServer())
        .get('/api/v1/listings')
        .query({
          search: 'Filter',
          currency: 'USD',
          page: 1,
          limit: 20,
        })
        .expect(200);

      expect(
        currencyResponse.body.items.map(
          (item: { id: string }) => item.id,
        ),
      ).toEqual([samarkandUsd.id]);

      const locationResponse = await request(app.getHttpServer())
        .get('/api/v1/listings')
        .query({
          search: 'Filter',
          location: 'samar',
          page: 1,
          limit: 20,
        })
        .expect(200);

      expect(
        locationResponse.body.items.map(
          (item: { id: string }) => item.id,
        ),
      ).toEqual([samarkandUsd.id]);

      const combinedResponse = await request(app.getHttpServer())
        .get('/api/v1/listings')
        .query({
          search: 'Filter',
          minPrice: 500000,
          maxPrice: 1000000,
          currency: 'UZS',
          location: 'Tashkent',
          page: 1,
          limit: 20,
        })
        .expect(200);

      expect(
        combinedResponse.body.items.map(
          (item: { id: string }) => item.id,
        ),
      ).toEqual([expensiveTashkent.id]);
    } finally {
      await listingsRepository.delete({
        id: samarkandUsd.id,
      });
      await listingsRepository.delete({
        id: expensiveTashkent.id,
      });
      await listingsRepository.delete({
        id: cheapTashkent.id,
      });
    }
  });

  it('rejects an invalid public price range', async () => {
    if (!app) throw new Error('Test application did not start');

    const response = await request(app.getHttpServer())
      .get('/api/v1/listings')
      .query({
        minPrice: 1000000,
        maxPrice: 100000,
        page: 1,
        limit: 20,
      })
      .expect(400);

    expect(response.body.message).toBe(
      'minPrice must be less than or equal to maxPrice',
    );
  });

  it('requires authentication for the owner listing feed', async () => {
    if (!app) throw new Error('Test application did not start');

    await request(app.getHttpServer())
      .get('/api/v1/listings/mine')
      .expect(401);
  });

  it('lists only the owners listings across lifecycle statuses', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    const listingsRepository = dataSource.getRepository(Listing);

    const ownedActive = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Mine Active Listing',
        description: 'Owned active listing',
        price: '610000.00',
        currency: 'UZS',
        status: ListingStatus.Active,
        location: null,
      }),
    );

    const ownedSold = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Mine Sold Listing',
        description: 'Owned sold listing',
        price: '620000.00',
        currency: 'UZS',
        status: ListingStatus.Sold,
        location: null,
      }),
    );

    const ownedArchived = await listingsRepository.save(
      listingsRepository.create({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Mine Archived Listing',
        description: 'Owned archived listing',
        price: '630000.00',
        currency: 'UZS',
        status: ListingStatus.Archived,
        location: null,
      }),
    );

    const otherListing = await listingsRepository.save(
      listingsRepository.create({
        sellerId: otherUser.id,
        categoryId: category.id,
        title: 'Other User Listing',
        description: 'Must not appear in seller mine feed',
        price: '640000.00',
        currency: 'UZS',
        status: ListingStatus.Active,
        location: null,
      }),
    );

    try {
      const response = await request(app.getHttpServer())
        .get('/api/v1/listings/mine')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({
          page: 1,
          limit: 20,
        })
        .expect(200);

      const ids = response.body.items.map((item: { id: string }) => item.id);

      expect(ids).toEqual(
        expect.arrayContaining([
          createdListingId,
          ownedActive.id,
          ownedSold.id,
          ownedArchived.id,
        ]),
      );

      expect(ids).not.toContain(otherListing.id);
    } finally {
      await listingsRepository.delete({
        id: otherListing.id,
      });
      await listingsRepository.delete({
        id: ownedArchived.id,
      });
      await listingsRepository.delete({
        id: ownedSold.id,
      });
      await listingsRepository.delete({
        id: ownedActive.id,
      });
    }
  });

  it('filters the owner listing feed by status', async () => {
    if (!app) throw new Error('Test application did not start');
    if (!createdListingId) throw new Error('Listing was not created');

    const response = await request(app.getHttpServer())
      .get('/api/v1/listings/mine')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        status: ListingStatus.Draft,
        page: 1,
        limit: 20,
      })
      .expect(200);

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdListingId,
          sellerId: seller.id,
          status: ListingStatus.Draft,
        }),
      ]),
    );

    expect(
      response.body.items.every(
        (item: { status: ListingStatus }) => item.status === ListingStatus.Draft,
      ),
    ).toBe(true);
  });
});
