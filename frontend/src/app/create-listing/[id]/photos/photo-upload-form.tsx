'use client';

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  uploadPhotoAction,
  type PhotoActionState,
} from './actions';

const initialState: PhotoActionState = {
  error: null,
};

interface PhotoUploadFormProps {
  listingId: string;
  imageCount: number;
}

interface SelectedPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

export function PhotoUploadForm({
  listingId,
  imageCount,
}: PhotoUploadFormProps) {
  const action = uploadPhotoAction.bind(null, listingId);
  const [state, formAction, actionPending] = useActionState(
    action,
    initialState,
  );
  const [selectedPhotos, setSelectedPhotos] = useState<
    SelectedPhoto[]
  >([]);
  const [clientError, setClientError] = useState<string | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const remainingSlots = Math.max(0, 10 - imageCount);
  const pending = actionPending;
  const limitReached = remainingSlots === 0;

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;

    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function removePhoto(id: string) {
    setSelectedPhotos((current) => {
      const photo = current.find((item) => item.id === id);

      if (photo) {
        URL.revokeObjectURL(photo.previewUrl);
        previewUrlsRef.current = previewUrlsRef.current.filter(
          (url) => url !== photo.previewUrl,
        );
      }

      return current.filter((item) => item.id !== id);
    });
  }


  return (
    <div className="photo-upload-form">
      <label className="photo-upload-box">
        <span className="photo-upload-title">
          <span className="photo-camera-icon" aria-hidden="true">▣</span>
          {limitReached
            ? 'Добавлено 10 фотографий'
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
          disabled={pending || limitReached}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            const available =
              remainingSlots - selectedPhotos.length;
            const acceptedFiles = files.slice(0, available);

            if (files.length > available) {
              setClientError(
                `Можно добавить ещё только ${available} фото.`,
              );
            } else {
              setClientError(null);
            }

            const newPhotos = acceptedFiles.map((file) => {
              const previewUrl = URL.createObjectURL(file);
              previewUrlsRef.current.push(previewUrl);

              return {
                id: crypto.randomUUID(),
                file,
                previewUrl,
              };
            });

            setSelectedPhotos(newPhotos);

            const formData = new FormData();
            acceptedFiles.forEach((file) =>
              formData.append('files', file),
            );

            startTransition(() => {
              formAction(formData);
            });

            if (inputRef.current) {
              inputRef.current.value = '';
            }
          }}
        />
      </label>

      {selectedPhotos.length > 0 ? (
        <>
          <div className="photo-selection-header">
            <strong>
              Выбрано: {selectedPhotos.length}
            </strong>
            <span>
              Фотографии загружаются автоматически
            </span>
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

                <p title={photo.file.name}>
                  {photo.file.name}
                </p>

                <div className="photo-selection-actions">
                  <button
                    type="button"
                    className="photo-preview-remove"
                    onClick={() => removePhoto(photo.id)}
                    disabled={pending}
                  >
                    Удалить
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}

      {clientError || state.error ? (
        <p className="form-error" role="alert">
          {clientError || state.error}
        </p>
      ) : null}
    </div>
  );
}
