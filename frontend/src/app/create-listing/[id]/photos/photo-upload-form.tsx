'use client';

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { useRouter } from 'next/navigation';

interface PhotoUploadFormProps {
  listingId?: string;
  imageCount: number;
  onFilesSelected?: (files: File[]) => void;
}

interface SelectedPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

interface UploadErrorBody {
  message?: string;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_PHOTOS = 10;

function cameraIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M8.5 5.5 10 3.5h4l1.5 2H19A2.5 2.5 0 0 1 21.5 8v9A2.5 2.5 0 0 1 19 19.5H5A2.5 2.5 0 0 1 2.5 17V8A2.5 2.5 0 0 1 5 5.5h3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12.5"
        r="3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function rotateFile(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const sourceUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalHeight;
      canvas.height = image.naturalWidth;
      const context = canvas.getContext('2d');

      if (!context) {
        URL.revokeObjectURL(sourceUrl);
        reject(new Error('Не удалось повернуть фотографию.'));
        return;
      }

      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(Math.PI / 2);
      context.drawImage(
        image,
        -image.naturalWidth / 2,
        -image.naturalHeight / 2,
      );

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(sourceUrl);

          if (!blob) {
            reject(new Error('Не удалось повернуть фотографию.'));
            return;
          }

          resolve(
            new File([blob], file.name, {
              type: blob.type || file.type,
              lastModified: Date.now(),
            }),
          );
        },
        file.type,
        0.92,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error('Не удалось открыть фотографию.'));
    };

    image.src = sourceUrl;
  });
}

export function PhotoUploadForm({
  listingId,
  imageCount,
  onFilesSelected,
}: PhotoUploadFormProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const totalCount = imageCount + selectedPhotos.length;
  const remainingSlots = Math.max(0, MAX_PHOTOS - totalCount);
  const limitReached = remainingSlots === 0;

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;

    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function commitPhotos(nextPhotos: SelectedPhoto[]) {
    setSelectedPhotos(nextPhotos);
    onFilesSelected?.(nextPhotos.map((photo) => photo.file));
  }

  function clearPreviews() {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
    setSelectedPhotos([]);
  }

  function removeSelectedPhoto(photoId: string) {
    const removedPhoto = selectedPhotos.find((photo) => photo.id === photoId);
    const nextPhotos = selectedPhotos.filter((photo) => photo.id !== photoId);

    if (removedPhoto) {
      URL.revokeObjectURL(removedPhoto.previewUrl);
      previewUrlsRef.current = previewUrlsRef.current.filter(
        (url) => url !== removedPhoto.previewUrl,
      );
    }

    commitPhotos(nextPhotos);
    setClientError(null);
  }

  async function rotateSelectedPhoto(photoId: string) {
    const photo = selectedPhotos.find((item) => item.id === photoId);
    if (!photo || rotatingId) return;

    setRotatingId(photoId);
    setClientError(null);

    try {
      const rotatedFile = await rotateFile(photo.file);
      const rotatedUrl = URL.createObjectURL(rotatedFile);
      const nextPhotos = selectedPhotos.map((item) =>
        item.id === photoId
          ? { ...item, file: rotatedFile, previewUrl: rotatedUrl }
          : item,
      );

      URL.revokeObjectURL(photo.previewUrl);
      previewUrlsRef.current = previewUrlsRef.current
        .filter((url) => url !== photo.previewUrl)
        .concat(rotatedUrl);
      commitPhotos(nextPhotos);
    } catch (error: unknown) {
      setClientError(
        error instanceof Error
          ? error.message
          : 'Не удалось повернуть фотографию.',
      );
    } finally {
      setRotatingId(null);
    }
  }

  function handleDragStart(
    event: DragEvent<HTMLElement>,
    photoId: string,
  ) {
    setDraggedId(photoId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', photoId);
  }

  function handleDrop(
    event: DragEvent<HTMLElement>,
    targetId: string,
  ) {
    event.preventDefault();
    const sourceId =
      draggedId || event.dataTransfer.getData('text/plain');

    if (!sourceId || sourceId === targetId) {
      setDraggedId(null);
      return;
    }

    const sourceIndex = selectedPhotos.findIndex(
      (photo) => photo.id === sourceId,
    );
    const targetIndex = selectedPhotos.findIndex(
      (photo) => photo.id === targetId,
    );

    if (sourceIndex < 0 || targetIndex < 0) return;

    const nextPhotos = [...selectedPhotos];
    const [movedPhoto] = nextPhotos.splice(sourceIndex, 1);
    nextPhotos.splice(targetIndex, 0, movedPhoto);
    commitPhotos(nextPhotos);
    setDraggedId(null);
  }

  async function uploadFiles(files: File[]) {
    if (!listingId) return;

    setUploading(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.set('file', file);

        const response = await fetch(
          `/api/listings/${encodeURIComponent(listingId)}/images`,
          {
            method: 'POST',
            body: formData,
          },
        );

        if (response.status === 401) {
          window.location.assign('/login');
          return;
        }

        if (!response.ok) {
          let message = 'Не удалось загрузить фотографию.';

          try {
            const body = (await response.json()) as UploadErrorBody;
            message = body.message || message;
          } catch {
            // Keep the fallback message for an invalid response.
          }

          throw new Error(message);
        }
      }

      clearPreviews();
      router.refresh();
    } catch (error: unknown) {
      setClientError(
        error instanceof Error
          ? error.message
          : 'Не удалось загрузить фотографию.',
      );
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelection(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);
    const acceptedFiles = files.slice(0, remainingSlots);
    const oversizedFile = acceptedFiles.find(
      (file) => file.size > MAX_FILE_SIZE,
    );

    if (inputRef.current) inputRef.current.value = '';

    if (oversizedFile) {
      setClientError(`Файл «${oversizedFile.name}» больше 20 МБ.`);
      return;
    }

    if (acceptedFiles.length === 0) return;

    setClientError(
      files.length > remainingSlots
        ? `Можно добавить ещё только ${remainingSlots} фото.`
        : null,
    );

    const newPhotos = acceptedFiles.map((file, index) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.push(previewUrl);

      return {
        id: `${Date.now()}-${index}-${file.name}`,
        file,
        previewUrl,
      };
    });
    const nextPhotos = [...selectedPhotos, ...newPhotos];

    commitPhotos(nextPhotos);

    if (listingId) void uploadFiles(acceptedFiles);
  }

  const cameraTile = !limitReached ? (
    <label className="photo-upload-box">
      <span className="photo-upload-title">
        <span className="photo-camera-icon" aria-hidden="true">
          {cameraIcon()}
        </span>
        {uploading ? 'Загружаем' : 'Добавить фото'}
      </span>
      <span className="photo-upload-description">
        JPG, PNG или WEBP · до 20 МБ
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={uploading}
        onChange={handleFileSelection}
      />
    </label>
  ) : null;

  const previewCards = selectedPhotos.map((photo, index) => (
    <article
      className={
        draggedId === photo.id
          ? 'photo-selection-card is-dragging'
          : 'photo-selection-card'
      }
      key={photo.id}
      draggable={!listingId}
      onDragStart={(event) => handleDragStart(event, photo.id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => handleDrop(event, photo.id)}
      onDragEnd={() => setDraggedId(null)}
    >
      <div className="photo-selection-image">
        <img
          src={photo.previewUrl}
          alt={`Выбранная фотография ${imageCount + index + 1}`}
        />
        {!listingId ? (
          <>
            <button
              type="button"
              className="photo-preview-rotate"
              aria-label="Повернуть фотографию на 90 градусов"
              disabled={rotatingId === photo.id}
              onClick={() => void rotateSelectedPhoto(photo.id)}
            >
              ↻
            </button>
            <button
              type="button"
              className="photo-preview-remove"
              aria-label="Удалить фотографию"
              onClick={() => removeSelectedPhoto(photo.id)}
            >
              ×
            </button>
            <span className="photo-drag-handle" aria-hidden="true">
              ⠿
            </span>
          </>
        ) : null}
      </div>
      {imageCount === 0 && index === 0 ? (
        <span className="photo-cover-label">Основное фото</span>
      ) : null}
    </article>
  ));

  return (
    <div
      className={
        listingId
          ? 'photo-upload-form'
          : 'photo-upload-form photo-upload-form-staged'
      }
    >
      {!listingId ? (
        <div className="photo-staging-grid" aria-label="Выбранные фотографии">
          {previewCards}
          {cameraTile}
        </div>
      ) : (
        <>
          {cameraTile}
          {selectedPhotos.length > 0 ? (
            <div
              className="photo-selection-grid"
              aria-label="Предпросмотр выбранных фотографий"
            >
              {previewCards}
            </div>
          ) : null}
        </>
      )}

      {selectedPhotos.length > 0 ? (
        <div className="photo-selection-header">
          <strong>Выбрано: {selectedPhotos.length}</strong>
          <span>
            {listingId
              ? 'Фотографии загружаются автоматически'
              : 'Перетащите фото на первое место, чтобы сделать обложкой'}
          </span>
        </div>
      ) : null}

      {clientError ? (
        <p className="form-error" role="alert">
          {clientError}
        </p>
      ) : null}
    </div>
  );
}
