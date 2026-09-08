'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PhotoUploadFormProps {
  listingId: string;
  imageCount: number;
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

export function PhotoUploadForm({
  listingId,
  imageCount,
}: PhotoUploadFormProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<
    SelectedPhoto[]
  >([]);
  const [clientError, setClientError] = useState<string | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const remainingSlots = Math.max(0, 10 - imageCount);
  const limitReached = remainingSlots === 0;

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;

    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function clearPreviews() {
    previewUrlsRef.current.forEach((url) =>
      URL.revokeObjectURL(url),
    );
    previewUrlsRef.current = [];
    setSelectedPhotos([]);
  }

  async function uploadFiles(files: File[]) {
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
            // The fallback message above is shown for invalid responses.
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

  return (
    <div className="photo-upload-form">
      <label className="photo-upload-box">
        <span className="photo-upload-title">
          <span className="photo-camera-icon" aria-hidden="true">
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
          </span>
          {limitReached
            ? 'Добавлено 10 фотографий'
            : uploading
              ? 'Фотографии загружаются'
              : 'Добавить фотографии'}
        </span>

        <span className="photo-upload-description">
          Можно выбрать несколько файлов · JPG, JPEG, PNG или
          WEBP · до 20 МБ каждый
        </span>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={uploading || limitReached}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            const acceptedFiles = files.slice(0, remainingSlots);
            const oversizedFile = acceptedFiles.find(
              (file) => file.size > MAX_FILE_SIZE,
            );

            if (inputRef.current) {
              inputRef.current.value = '';
            }

            if (oversizedFile) {
              setClientError(
                `Файл «${oversizedFile.name}» больше 20 МБ.`,
              );
              return;
            }

            if (acceptedFiles.length === 0) {
              return;
            }

            if (files.length > remainingSlots) {
              setClientError(
                `Можно добавить ещё только ${remainingSlots} фото.`,
              );
            } else {
              setClientError(null);
            }

            const previews = acceptedFiles.map((file) => {
              const previewUrl = URL.createObjectURL(file);
              previewUrlsRef.current.push(previewUrl);

              return {
                id: crypto.randomUUID(),
                file,
                previewUrl,
              };
            });

            setSelectedPhotos(previews);
            void uploadFiles(acceptedFiles);
          }}
        />
      </label>

      {selectedPhotos.length > 0 ? (
        <>
          <div className="photo-selection-header">
            <strong>Выбрано: {selectedPhotos.length}</strong>
            <span>Фотографии загружаются автоматически</span>
          </div>

          <div
            className="photo-selection-grid"
            aria-label="Предпросмотр выбранных фотографий"
          >
            {selectedPhotos.map((photo, index) => (
              <article
                className="photo-selection-card"
                key={photo.id}
              >
                <div className="photo-selection-image">
                  <img
                    src={photo.previewUrl}
                    alt={`Выбранная фотография ${index + 1}`}
                  />
                  {index === 0 && imageCount === 0 ? (
                    <span className="photo-selection-cover">
                      Будет обложкой
                    </span>
                  ) : null}
                </div>

                <p title={photo.file.name}>{photo.file.name}</p>
              </article>
            ))}
          </div>
        </>
      ) : null}

      {clientError ? (
        <p className="form-error" role="alert">
          {clientError}
        </p>
      ) : null}
    </div>
  );
}
