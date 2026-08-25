import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateListingDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{1,12}(\.\d{1,2})?$/)
  price?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(UZS|USD)$/)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;
}
