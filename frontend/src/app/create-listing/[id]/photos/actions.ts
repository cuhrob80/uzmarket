'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  ApiError,
  deleteListingImage,
  reorderListingImages,
  uploadListingImage,
} from '@/lib/api/server';

export interface PhotoActionState {
  error: string | null;
}

function revalidateListingPages(listingId: string): void {
  revalidatePath(`/create-listing/${listingId}`);
  revalidatePath(`/create-listing/${listingId}/photos`);
}

export async function uploadPhotoAction(
  listingId: string,
  _previousState: PhotoActionState,
  formData: FormData,
): Promise<PhotoActionState> {
  const files = formData
    .getAll('files')
    .filter(
      (file): file is File =>
        file instanceof File && file.size > 0,
    );

  if (files.length === 0) {
    return { error: 'Выберите хотя бы одну фотографию' };
  }

  if (files.length > 10) {
    return { error: 'Можно загрузить не более 10 фотографий' };
  }

  try {
    for (const file of files) {
      await uploadListingImage(listingId, file);
    }
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      redirect('/login');
    }

    console.error('Upload listing image failed:', error);

    return {
      error:
        error instanceof ApiError
          ? error.message
          : 'Не удалось загрузить фотографию.',
    };
  }

  revalidateListingPages(listingId);

  return { error: null };
}

export async function deletePhotoAction(
  listingId: string,
  imageId: string,
): Promise<void> {
  try {
    await deleteListingImage(listingId, imageId);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      redirect('/login');
    }

    throw error;
  }

  revalidateListingPages(listingId);
}

export async function reorderPhotosAction(
  listingId: string,
  imageIds: string[],
): Promise<void> {
  try {
    await reorderListingImages(listingId, imageIds);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      redirect('/login');
    }

    throw error;
  }

  revalidateListingPages(listingId);
}
