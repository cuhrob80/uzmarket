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

export async function uploadPhotoAction(
  listingId: string,
  _previousState: PhotoActionState,
  formData: FormData,
): Promise<PhotoActionState> {
  const file = formData.get('file');

  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Выберите фотографию' };
  }

  try {
    await uploadListingImage(listingId, file);
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

  revalidatePath(`/create-listing/${listingId}/photos`);

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

  revalidatePath(`/create-listing/${listingId}/photos`);
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

  revalidatePath(`/create-listing/${listingId}/photos`);
}

