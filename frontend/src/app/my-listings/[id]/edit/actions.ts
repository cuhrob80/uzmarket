'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  ApiError,
  publishListing,
  updateListing,
} from '@/lib/api/server';
import type { ListingCurrency } from '@/types/listing';

export interface EditListingState {
  error: string | null;
  success?: string | null;
}

export async function editListingAction(
  listingId: string,
  _previousState: EditListingState,
  formData: FormData,
): Promise<EditListingState> {
  const categoryId = String(formData.get('categoryId') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const price = String(formData.get('price') ?? '').trim();
  const currency = String(
    formData.get('currency') ?? 'UZS',
  ) as ListingCurrency;
  const location = String(formData.get('location') ?? '').trim();
  const publishAfterSave =
    formData.get('publishAfterSave') === 'true';

  try {
    await updateListing(listingId, {
      categoryId,
      title,
      description,
      price,
      currency,
      location,
    });

    if (publishAfterSave) {
      await publishListing(listingId);
    }
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      redirect('/login');
    }

    return {
      error:
        error instanceof ApiError
          ? error.message
          : publishAfterSave
            ? 'Не удалось разместить объявление'
            : 'Не удалось сохранить объявление',
      success: null,
    };
  }

  revalidatePath(`/create-listing/${listingId}`);
  revalidatePath(`/my-listings/${listingId}/edit`);
  revalidatePath('/my-listings');

  if (publishAfterSave) {
    redirect(
      `/my-listings?published=${encodeURIComponent(listingId)}`,
    );
  }

  return {
    error: null,
    success: 'Изменения сохранены',
  };
}
