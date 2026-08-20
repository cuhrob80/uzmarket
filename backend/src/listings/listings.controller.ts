import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { Listing } from '../entities';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListListingsQueryDto } from './dto/list-listings-query.dto';
import { ListingsService } from './listings.service';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  create(@Body() dto: CreateListingDto): Promise<Listing> {
    return this.listingsService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListListingsQueryDto): Promise<{
    items: Listing[];
    page: number;
    limit: number;
    total: number;
  }> {
    return this.listingsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Listing> {
    return this.listingsService.findOne(id);
  }
}
