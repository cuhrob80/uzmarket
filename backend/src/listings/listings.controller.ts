import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { Listing } from '../entities';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListListingsQueryDto } from './dto/list-listings-query.dto';
import type { ListingResponseDto } from './dto/listing-response.dto';
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
