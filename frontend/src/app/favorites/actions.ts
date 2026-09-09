'use server';

import { revalidatePath } from 'next/cache';
import { ApiError, setListingFavorite } from '@/lib/api/server';

export async function toggleFavoriteAction(
  listingId: string,
  favorite: boolean,
): Promise<{ error: string | null; requiresAuth?: boolean }> {
  try {
    await setListingFavorite(listingId, favorite);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      return { error: null, requiresAuth: true };
    }

    return {
      error:
        error instanceof ApiError
          ? error.message
          : 'Не удалось изменить избранное',
    };
  }

  revalidatePath('/favorites');
  revalidatePath('/listings');
  revalidatePath('/my-listings');

  return { error: null };
}
