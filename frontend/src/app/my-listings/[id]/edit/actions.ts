'use server';

import { redirect } from 'next/navigation';
import { ApiError, updateListing } from '@/lib/api/server';
import type { ListingCurrency } from '@/types/listing';

export interface EditListingState {
  error: string | null;
}

export async function editListingAction(
  listingId: string,
  _previousState: EditListingState,
  formData: FormData,
): Promise<EditListingState> {
  const categoryId = String(
    formData.get('categoryId') ?? '',
  ).trim();

  const title = String(
    formData.get('title') ?? '',
  ).trim();

  const description = String(
    formData.get('description') ?? '',
  ).trim();

  const price = String(
    formData.get('price') ?? '',
  ).trim();

  const currency = String(
    formData.get('currency') ?? 'UZS',
  ) as ListingCurrency;

  const location = String(
    formData.get('location') ?? '',
  ).trim();

  try {
    await updateListing(listingId, {
      categoryId,
      title,
      description,
      price,
      currency,
      location,
    });
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return {
        error: error.message,
      };
    }

    return {
      error: 'Не удалось сохранить объявление',
    };
  }

  redirect('/my-listings');
}
