import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category, Listing, User } from '../entities';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, User, Category])],
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
