import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, type FindOptionsWhere, Repository } from 'typeorm';
import { Category, Listing, User } from '../entities';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListListingsQueryDto } from './dto/list-listings-query.dto';

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

  async create(dto: CreateListingDto): Promise<Listing> {
    const [seller, category] = await Promise.all([
      this.usersRepository.findOne({ where: { id: dto.sellerId } }),
      this.categoriesRepository.findOne({ where: { id: dto.categoryId } }),
    ]);

    if (!seller) {
      throw new BadRequestException('Seller does not exist');
    }

    if (!category) {
      throw new BadRequestException('Category does not exist');
    }

    const listing = this.listingsRepository.create({
      sellerId: dto.sellerId,
      categoryId: dto.categoryId,
      title: dto.title,
      description: dto.description,
      price: dto.price,
      currency: dto.currency ?? 'UZS',
      status: dto.status,
      location: dto.location ?? null,
    });

    return this.listingsRepository.save(listing);
  }

  async findOne(id: string): Promise<Listing> {
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

    return listing;
  }

  async findAll(query: ListListingsQueryDto): Promise<{
    items: Listing[];
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
      items,
      page: query.page,
      limit: query.limit,
      total,
    };
  }
}
