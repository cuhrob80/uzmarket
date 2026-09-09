'use client';

import {
  useState,
  useTransition,
  type DragEvent,
  type ReactNode,
} from 'react';
import { reorderPhotosAction } from './actions';

interface DraggablePhotoCardProps {
  listingId: string;
  imageIds: string[];
  imageId: string;
  children: ReactNode;
}

export function DraggablePhotoCard({
  listingId,
  imageIds,
  imageId,
  children,
}: DraggablePhotoCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDragStart(event: DragEvent<HTMLElement>) {
    setIsDragging(true);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', imageId);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain');

    if (!sourceId || sourceId === imageId) return;

    const sourceIndex = imageIds.indexOf(sourceId);
    const targetIndex = imageIds.indexOf(imageId);

    if (sourceIndex < 0 || targetIndex < 0) return;

    const nextIds = [...imageIds];
    const [movedId] = nextIds.splice(sourceIndex, 1);
    nextIds.splice(targetIndex, 0, movedId);

    startTransition(async () => {
      await reorderPhotosAction(listingId, nextIds);
    });
  }

  return (
    <article
      className={[
        'listing-photo-card',
        isDragging ? 'is-dragging' : '',
        isPending ? 'is-reordering' : '',
      ].filter(Boolean).join(' ')}
      draggable={!isPending}
      onDragStart={handleDragStart}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      }}
      onDrop={handleDrop}
      onDragEnd={() => setIsDragging(false)}
    >
      {children}
      <span
        className="photo-drag-handle saved-photo-drag-handle"
        aria-label="Перетащите фотографию, чтобы изменить порядок"
        role="img"
      >
        ⠿
      </span>
    </article>
  );
}
