import { ListingStatus } from '../../entities';

export interface ListingSellerResponse {
  id: string;
  displayName: string;
}

export interface ListingCategoryResponse {
  id: string;
  name: string;
  slug: string;
}

export interface ListingImageResponse {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ListingResponseDto {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  status: ListingStatus;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
  seller: ListingSellerResponse;
  category: ListingCategoryResponse;
  images: ListingImageResponse[];
}
