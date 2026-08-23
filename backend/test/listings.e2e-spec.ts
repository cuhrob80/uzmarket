import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { Category, Listing, ListingStatus, User } from '../src/entities';

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

  it('allows the owner to publish a draft listing', async () => {
    if (!app) throw new Error('Test application did not start');

    const listingsRepository = dataSource.getRepository(Listing);
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
