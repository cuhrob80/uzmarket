'use client';

import { useTransition } from 'react';
import { reorderPhotosAction } from './actions';

interface PhotoOrderControlsProps {
  listingId: string;
  imageIds: string[];
  index: number;
}

export function PhotoOrderControls({
  listingId,
  imageIds,
  index,
}: PhotoOrderControlsProps) {
  const [pending, startTransition] = useTransition();

  function move(targetIndex: number) {
    if (
      targetIndex < 0 ||
      targetIndex >= imageIds.length ||
      targetIndex === index
    ) {
      return;
    }

    const nextImageIds = [...imageIds];

    [nextImageIds[index], nextImageIds[targetIndex]] = [
      nextImageIds[targetIndex],
      nextImageIds[index],
    ];

    startTransition(async () => {
      await reorderPhotosAction(listingId, nextImageIds);
    });
  }

  return (
    <div
      className="photo-order-controls"
      aria-label={`Позиция фотографии ${index + 1}`}
    >
      <button
        type="button"
        disabled={pending || index === 0}
        onClick={() => move(index - 1)}
        aria-label="Переместить фотографию влево"
      >
        ←
      </button>

      <span>
        {index + 1}
      </span>

      <button
        type="button"
        disabled={pending || index === imageIds.length - 1}
        onClick={() => move(index + 1)}
        aria-label="Переместить фотографию вправо"
      >
        →
      </button>
    </div>
  );
}
