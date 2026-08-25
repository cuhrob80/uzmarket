export type ListingStatus = 'draft' | 'active' | 'sold' | 'archived';

export type ListingCurrency = 'UZS' | 'USD';

export interface ListingSeller {
  id: string;
  displayName: string;
}

export interface ListingCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ListingImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface Listing {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: string;
  currency: ListingCurrency;
  status: ListingStatus;
  location: string | null;
  createdAt: string;
  updatedAt: string;
  seller: ListingSeller;
  category: ListingCategory;
  images: ListingImage[];
}

export interface ListingsPage {
  items: Listing[];
  page: number;
  limit: number;
  total: number;
}

export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  displayName: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface CreateListingInput {
  categoryId: string;
  title: string;
  description: string;
  price: string;
  currency: ListingCurrency;
  location?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
}
