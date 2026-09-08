'use client';

import { useTransition } from 'react';
import { rotatePhotoAction } from './actions';

interface RotatePhotoButtonProps {
  listingId: string;
  imageId: string;
}

export function RotatePhotoButton({
  listingId,
  imageId,
}: RotatePhotoButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="photo-rotate-button"
      disabled={pending}
      aria-label="Повернуть фотографию на 90 градусов"
      title="Повернуть на 90°"
      onClick={() => {
        startTransition(async () => {
          await rotatePhotoAction(listingId, imageId);
        });
      }}
    >
      {pending ? '…' : '↻'}
    </button>
  );
}
