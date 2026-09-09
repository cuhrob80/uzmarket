'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  ApiError,
  archiveListing,
  deleteListing,
  markListingSold,
  unpublishListing,
} from '@/lib/api/server';

export type ListingMenuOperation =
  | 'unpublish'
  | 'sold'
  | 'archive'
  | 'delete';

export interface ListingMenuResult {
  error: string | null;
}

export async function manageListingAction(
  listingId: string,
  operation: ListingMenuOperation,
): Promise<ListingMenuResult> {
  try {
    if (operation === 'unpublish') {
      await unpublishListing(listingId);
    } else if (operation === 'sold') {
      await markListingSold(listingId);
    } else if (operation === 'archive') {
      await archiveListing(listingId);
    } else {
      await deleteListing(listingId);
    }
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      redirect('/login');
    }

    return {
      error:
        error instanceof ApiError
          ? error.message
          : 'Не удалось выполнить действие',
    };
  }

  revalidatePath('/my-listings');
  revalidatePath('/listings');
  revalidatePath('/');

  return { error: null };
}
