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
  rotation: 0 | 90 | 180 | 270;
}

function rotatePhoto(
  photo: SelectedPhoto,
): Promise<File> {
  if (photo.rotation === 0) {
    return Promise.resolve(photo.file);
  }

  return createImageBitmap(photo.file).then((bitmap) => {
    const swapSides =
      photo.rotation === 90 || photo.rotation === 270;
    const canvas = document.createElement('canvas');

    canvas.width = swapSides ? bitmap.height : bitmap.width;
    canvas.height = swapSides ? bitmap.width : bitmap.height;

    const context = canvas.getContext('2d');

    if (!context) {
      bitmap.close();
      throw new Error('Не удалось повернуть фотографию.');
    }

    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((photo.rotation * Math.PI) / 180);
    context.drawImage(
      bitmap,
      -bitmap.width / 2,
      -bitmap.height / 2,
    );
    bitmap.close();

    return new Promise<File>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error('Не удалось подготовить фотографию.'),
            );
            return;
          }

          resolve(
            new File([blob], photo.file.name, {
              type: blob.type || photo.file.type,
              lastModified: Date.now(),
            }),
          );
        },
        photo.file.type,
        0.92,
      );
    });
  });
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

  function rotateSelectedPhoto(id: string) {
    setSelectedPhotos((current) =>
      current.map((photo) =>
        photo.id === id
          ? {
              ...photo,
              rotation: ((photo.rotation + 90) % 360) as
                | 0
                | 90
                | 180
                | 270,
            }
          : photo,
      ),
    );
  }

  async function submitSelectedPhotos() {
    if (selectedPhotos.length === 0) {
      setClientError('Выберите хотя бы одну фотографию.');
      return;
    }

    setClientError(null);

    try {
      const files = await Promise.all(
        selectedPhotos.map(rotatePhoto),
      );
      const formData = new FormData();

      files.forEach((file) => formData.append('files', file));

      startTransition(() => {
        formAction(formData);
      });
    } catch (error: unknown) {
      setClientError(
        error instanceof Error
          ? error.message
          : 'Не удалось подготовить фотографии.',
      );
    }
  }

  return (
    <div className="photo-upload-form">
      <label className="photo-upload-box">
        <span className="photo-upload-title">
          {limitReached
            ? 'Добавлено 10 фотографий'
            : 'Выбрать фотографии'}
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
                rotation: 0 as const,
              };
            });

            setSelectedPhotos((current) => [
              ...current,
              ...newPhotos,
            ]);

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
              Проверьте фотографии перед загрузкой
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
                    style={{
                      transform: `rotate(${photo.rotation}deg)`,
                    }}
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
                    onClick={() =>
                      rotateSelectedPhoto(photo.id)
                    }
                    disabled={pending}
                    aria-label="Повернуть фотографию на 90 градусов"
                  >
                    ↻ Повернуть
                  </button>
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

      <button
        type="button"
        className="photo-upload-submit"
        disabled={pending || selectedPhotos.length === 0}
        onClick={submitSelectedPhotos}
      >
        {pending
          ? 'Загружаем…'
          : `Загрузить фотографии (${selectedPhotos.length})`}
      </button>
    </div>
  );
}
