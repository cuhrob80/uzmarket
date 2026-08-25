'use client';

import { useTransition } from 'react';
import { deletePhotoAction } from './actions';

interface DeletePhotoButtonProps {
  listingId: string;
  imageId: string;
}

export function DeletePhotoButton({
  listingId,
  imageId,
}: DeletePhotoButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="photo-delete-button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await deletePhotoAction(listingId, imageId);
        });
      }}
    >
      {pending ? 'Удаляем…' : 'Удалить'}
    </button>
  );
}
