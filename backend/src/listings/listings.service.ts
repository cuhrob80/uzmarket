import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, type FindOptionsWhere, Repository } from 'typeorm';
import { Category, Listing, ListingStatus, User } from '../entities';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListListingsQueryDto } from './dto/list-listings-query.dto';
import type { ListingResponseDto } from './dto/listing-response.dto';

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

  async findOne(id: string): Promise<ListingResponseDto> {
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

  async findAll(query: ListListingsQueryDto): Promise<{
    items: ListingResponseDto[];
    page: number;
    limit: number;
    total: number;
  }> {
    const where: FindOptionsWhere<Listing> = {};

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
      images: listing.images.map((image) => ({
        id: image.id,
        url: image.url,
        sortOrder: image.sortOrder,
      })),
    };
  }
}
