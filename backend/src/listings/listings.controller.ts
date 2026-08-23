import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Listing } from '../entities';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListListingsQueryDto } from './dto/list-listings-query.dto';
import { ListMineListingsQueryDto } from './dto/list-mine-listings-query.dto';
import type { ListingResponseDto } from './dto/listing-response.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingsService } from './listings.service';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() dto: CreateListingDto,
    @CurrentUser() user: JwtUser,
  ): Promise<Listing> {
    return this.listingsService.create(dto, user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateListingDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ListingResponseDto> {
    return this.listingsService.update(id, dto, user.userId);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  publish(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<ListingResponseDto> {
    return this.listingsService.publish(id, user.userId);
  }

  @Post(':id/sold')
  @UseGuards(JwtAuthGuard)
  markSold(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<ListingResponseDto> {
    return this.listingsService.markSold(id, user.userId);
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard)
  archive(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<ListingResponseDto> {
    return this.listingsService.archive(id, user.userId);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(
    @Query() query: ListMineListingsQueryDto,
    @CurrentUser() user: JwtUser,
  ): Promise<{
    items: ListingResponseDto[];
    page: number;
    limit: number;
    total: number;
  }> {
    return this.listingsService.findMine(user.userId, query);
  }

  @Get()
  findAll(@Query() query: ListListingsQueryDto): Promise<{
    items: ListingResponseDto[];
    page: number;
    limit: number;
    total: number;
  }> {
    return this.listingsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<ListingResponseDto> {
    return this.listingsService.findOne(id);
  }
}
