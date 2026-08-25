'use server';

import { redirect } from 'next/navigation';
import { ApiError, createListing } from '@/lib/api/server';
import type { ListingCurrency } from '@/types/listing';

export interface CreateListingState {
  error: string | null;
}

export async function createListingAction(
  _previousState: CreateListingState,
  formData: FormData,
): Promise<CreateListingState> {
  const categoryId = formData.get('categoryId');
  const title = formData.get('title');
  const description = formData.get('description');
  const price = formData.get('price');
  const currency = formData.get('currency');
  const location = formData.get('location');

  if (
    typeof categoryId !== 'string' ||
    typeof title !== 'string' ||
    typeof description !== 'string' ||
    typeof price !== 'string' ||
    typeof currency !== 'string' ||
    typeof location !== 'string'
  ) {
    return { error: 'Заполните обязательные поля' };
  }

  if (!categoryId || !title.trim() || !description.trim() || !price.trim()) {
    return { error: 'Заполните обязательные поля' };
  }

  if (currency !== 'UZS' && currency !== 'USD') {
    return { error: 'Выберите валюту: сум или доллар' };
  }

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return { error: 'Укажите правильную цену' };
  }

  let listingId: string;

  try {
    const listing = await createListing({
      categoryId,
      title: title.trim(),
      description: description.trim(),
      price: price.trim(),
      currency: currency as ListingCurrency,
      location: location.trim() || undefined,
    });

    listingId = listing.id;
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      redirect('/login');
    }

    console.error('Create listing failed:', error);

    return {
      error:
        error instanceof ApiError
          ? error.message
          : 'Не удалось создать объявление. Попробуйте ещё раз.',
    };
  }

  redirect(`/my-listings?created=${encodeURIComponent(listingId)}`);
}
