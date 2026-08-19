import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ListingStatus } from '../../entities';

export class CreateListingDto {
  @IsUUID()
  sellerId!: string;

  @IsUUID()
  categoryId!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  description!: string;

  @IsString()
  @Matches(/^\d{1,12}(\.\d{1,2})?$/)
  price!: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;
}
