import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, type FindOptionsWhere, Repository } from 'typeorm';
import { Category, Listing, ListingImage, ListingStatus, User } from '../entities';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListListingsQueryDto } from './dto/list-listings-query.dto';
import { ListMineListingsQueryDto } from './dto/list-mine-listings-query.dto';
import type { ListingResponseDto } from './dto/listing-response.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private readonly listingsRepository: Repository<Listing>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(dto: CreateListingDto, sellerId: string): Promise<Listing> {
    const [seller, category] = await Promise.all([
      this.usersRepository.findOne({ where: { id: sellerId } }),
      this.categoriesRepository.findOne({ where: { id: dto.categoryId, isActive: true } }),
    ]);

    if (!seller) {
      throw new BadRequestException('Seller does not exist');
    }

    if (!category) {
      throw new BadRequestException('Category does not exist');
    }

    const listing = this.listingsRepository.create({
      sellerId,
      categoryId: dto.categoryId,
      title: dto.title,
      description: dto.description,
      price: dto.price,
      currency: dto.currency ?? 'UZS',
      status: ListingStatus.Draft,
      location: dto.location ?? null,
    });

    return this.listingsRepository.save(listing);
  }

  async update(
    id: string,
    dto: UpdateListingDto,
    sellerId: string,
  ): Promise<ListingResponseDto> {
    const listing = await this.findOwnedListing(id, sellerId);

    if (
      listing.status !== ListingStatus.Draft &&
      listing.status !== ListingStatus.Active
    ) {
      throw new BadRequestException('Listing cannot be edited in its current status');
    }

    if (dto.categoryId && dto.categoryId !== listing.categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: dto.categoryId, isActive: true },
      });

      if (!category) {
        throw new BadRequestException('Category does not exist');
      }
    }

    this.listingsRepository.merge(listing, dto);
    await this.listingsRepository.save(listing);

    return this.findResponseById(listing.id);
  }

  async publish(id: string, sellerId: string): Promise<ListingResponseDto> {
    const listing = await this.findOwnedListing(id, sellerId);

    if (listing.status !== ListingStatus.Draft) {
      throw new BadRequestException('Only draft listings can be published');
    }

    const category = await this.categoriesRepository.findOne({
      where: { id: listing.categoryId, isActive: true },
    });

    if (!category) {
      throw new BadRequestException('Category does not exist');
    }

    if (Number(listing.price) <= 0) {
      throw new BadRequestException(
        'Listing price must be greater than zero before publishing',
      );
    }

    const imageCount = await this.listingsRepository.manager
      .getRepository(ListingImage)
      .count({
        where: { listingId: listing.id },
      });

    if (imageCount < 1) {
      throw new BadRequestException(
        'Listing must have at least one image before publishing',
      );
    }

    listing.status = ListingStatus.Active;
    await this.listingsRepository.save(listing);

    return this.findResponseById(listing.id);
  }

  async markSold(id: string, sellerId: string): Promise<ListingResponseDto> {
    const listing = await this.findOwnedListing(id, sellerId);

    if (listing.status !== ListingStatus.Active) {
      throw new BadRequestException('Only active listings can be marked as sold');
    }

    listing.status = ListingStatus.Sold;
    await this.listingsRepository.save(listing);

    return this.findResponseById(listing.id);
  }

  async archive(id: string, sellerId: string): Promise<ListingResponseDto> {
    const listing = await this.findOwnedListing(id, sellerId);

    if (
      listing.status !== ListingStatus.Draft &&
      listing.status !== ListingStatus.Active
    ) {
      throw new BadRequestException('Listing cannot be archived in its current status');
    }

    listing.status = ListingStatus.Archived;
    await this.listingsRepository.save(listing);

    return this.findResponseById(listing.id);
  }

  async findOne(id: string): Promise<ListingResponseDto> {
    const listing = await this.listingsRepository.findOne({
      where: { id, status: ListingStatus.Active },
      relations: {
        seller: true,
        category: true,
        images: true,
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return this.toResponse(listing);
  }

  async findAll(query: ListListingsQueryDto): Promise<{
    items: ListingResponseDto[];
    page: number;
    limit: number;
    total: number;
  }> {
    if (
      query.minPrice !== undefined &&
      query.maxPrice !== undefined &&
      query.minPrice > query.maxPrice
    ) {
      throw new BadRequestException(
        'minPrice must be less than or equal to maxPrice',
      );
    }

    const queryBuilder = this.listingsRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.seller', 'seller')
      .leftJoinAndSelect('listing.category', 'category')
      .leftJoinAndSelect('listing.images', 'images')
      .where('listing.status = :status', {
        status: ListingStatus.Active,
      });

    if (query.categoryId) {
      queryBuilder.andWhere('listing.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    const search = query.search?.trim();

    if (search) {
      queryBuilder.andWhere('listing.title ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (query.minPrice !== undefined) {
      queryBuilder.andWhere('listing.price >= :minPrice', {
        minPrice: query.minPrice,
      });
    }

    if (query.maxPrice !== undefined) {
      queryBuilder.andWhere('listing.price <= :maxPrice', {
        maxPrice: query.maxPrice,
      });
    }

    if (query.currency) {
      queryBuilder.andWhere('listing.currency = :currency', {
        currency: query.currency,
      });
    }

    const location = query.location?.trim();

    if (location) {
      queryBuilder.andWhere('listing.location ILIKE :location', {
        location: `%${location}%`,
      });
    }

    queryBuilder
      .orderBy('listing.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items: items.map((item) => this.toResponse(item)),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async findMineOne(
    id: string,
    sellerId: string,
  ): Promise<ListingResponseDto> {
    const listing = await this.listingsRepository.findOne({
      where: {
        id,
        sellerId,
      },
      relations: {
        seller: true,
        category: true,
        images: true,
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return this.toResponse(listing);
  }

  async findMine(
    sellerId: string,
    query: ListMineListingsQueryDto,
  ): Promise<{
    items: ListingResponseDto[];
    page: number;
    limit: number;
    total: number;
  }> {
    const where: FindOptionsWhere<Listing> = {
      sellerId,
    };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.title = ILike(`%${query.search}%`);
    }

    const [items, total] = await this.listingsRepository.findAndCount({
      where,
      relations: {
        seller: true,
        category: true,
        images: true,
      },
      order: {
        createdAt: 'DESC',
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return {
      items: items.map((item) => this.toResponse(item)),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  private async findResponseById(id: string): Promise<ListingResponseDto> {
    const listing = await this.listingsRepository.findOne({
      where: { id },
      relations: {
        seller: true,
        category: true,
        images: true,
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return this.toResponse(listing);
  }

  private async findOwnedListing(id: string, sellerId: string): Promise<Listing> {
    const listing = await this.listingsRepository.findOne({
      where: { id, sellerId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  private toResponse(listing: Listing): ListingResponseDto {
    return {
      id: listing.id,
      sellerId: listing.sellerId,
      categoryId: listing.categoryId,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      currency: listing.currency,
      status: listing.status,
      location: listing.location,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      seller: {
        id: listing.seller.id,
        displayName: listing.seller.displayName,
      },
      category: {
        id: listing.category.id,
        name: listing.category.name,
        slug: listing.category.slug,
      },
      images: [...listing.images]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((image) => ({
          id: image.id,
          url: image.url,
          sortOrder: image.sortOrder,
        })),
    };
  }
}
