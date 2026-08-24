import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category, Listing, ListingImage, User } from '../entities';
import { StorageModule } from '../storage/storage.module';
import { ListingImageProcessor } from './listing-image.processor';
import { ListingMediaService } from './listing-media.service';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Listing, ListingImage, User, Category]),
    StorageModule,
  ],
  controllers: [ListingsController],
  providers: [ListingsService, ListingMediaService, ListingImageProcessor],
})
export class ListingsModule {}
