'use server';

import { redirect } from 'next/navigation';
import { ApiError, publishListing } from '@/lib/api/server';

export interface PublishListingState {
  error: string | null;
}

export async function publishListingAction(
  listingId: string,
  _previousState: PublishListingState,
): Promise<PublishListingState> {
  void _previousState;

  try {
    await publishListing(listingId);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      redirect('/login');
    }

    console.error('Publish listing failed:', error);

    return {
      error:
        error instanceof ApiError
          ? error.message
          : 'Не удалось опубликовать объявление. Попробуйте ещё раз.',
    };
  }

  redirect(`/my-listings?published=${encodeURIComponent(listingId)}`);
}
