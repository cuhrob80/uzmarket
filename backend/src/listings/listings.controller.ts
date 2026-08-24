import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Listing } from '../entities';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListListingsQueryDto } from './dto/list-listings-query.dto';
import { ListMineListingsQueryDto } from './dto/list-mine-listings-query.dto';
import type { ListingImageResponse, ListingResponseDto } from './dto/listing-response.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ReorderListingImagesDto } from './dto/reorder-listing-images.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MAX_IMAGE_FILE_SIZE_BYTES } from './listing-image.processor';
import { ListingMediaService } from './listing-media.service';
import { ListingsService } from './listings.service';

@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly listingMediaService: ListingMediaService,
  ) {}

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

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_IMAGE_FILE_SIZE_BYTES,
        files: 1,
      },
    }),
  )
  async uploadImage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: JwtUser,
  ): Promise<ListingImageResponse> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const image = await this.listingMediaService.uploadImage(
      id,
      user.userId,
      file,
    );

    return {
      id: image.id,
      url: image.url,
      sortOrder: image.sortOrder,
    };
  }

  @Patch(':id/images/order')
  @UseGuards(JwtAuthGuard)
  async reorderImages(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ReorderListingImagesDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ListingImageResponse[]> {
    const images = await this.listingMediaService.reorderImages(
      id,
      user.userId,
      dto.imageIds,
    );

    return images.map((image) => ({
      id: image.id,
      url: image.url,
      sortOrder: image.sortOrder,
    }));
  }

  @Delete(':id/images/:imageId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteImage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('imageId', new ParseUUIDPipe()) imageId: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.listingMediaService.deleteImage(
      id,
      imageId,
      user.userId,
    );
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

  @Get('mine/:id')
  @UseGuards(JwtAuthGuard)
  findMineOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<ListingResponseDto> {
    return this.listingsService.findMineOne(id, user.userId);
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
