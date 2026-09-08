'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
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

export function PhotoUploadForm({
  listingId,
  imageCount,
}: PhotoUploadFormProps) {
  const action = uploadPhotoAction.bind(null, listingId);

  const [state, formAction, pending] = useActionState(
    action,
    initialState,
  );

  const limitReached = imageCount >= 10;
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function clearSelection() {
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    setPreviewUrl(null);
    setSelectedName(null);
  }

  return (
    <form
      action={formAction}
      className="photo-upload-form"
    >
      <label className="photo-upload-box">
        <span className="photo-upload-title">
          {limitReached
            ? 'Добавлено 10 фотографий'
            : 'Добавить фотографию'}
        </span>

        <span className="photo-upload-description">
          JPG, JPEG, PNG или WEBP · до 20 МБ
        </span>

        <input
          ref={inputRef}
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          disabled={pending || limitReached}
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (!file) {
              clearSelection();
              return;
            }

            setPreviewUrl(URL.createObjectURL(file));
            setSelectedName(file.name);
          }}
        />
      </label>

      {previewUrl ? (
        <div className="photo-selection-preview">
          <img
            src={previewUrl}
            alt="Предпросмотр выбранной фотографии"
          />
          <div className="photo-selection-details">
            <strong>{selectedName}</strong>
            <span>Фото ещё не загружено</span>
            <button
              type="button"
              className="photo-preview-cancel"
              onClick={clearSelection}
              disabled={pending}
            >
              Отменить выбор
            </button>
          </div>
        </div>
      ) : null}

      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        className="photo-upload-submit"
        disabled={pending || limitReached || !previewUrl}
      >
        {pending ? 'Загружаем…' : 'Загрузить'}
      </button>
    </form>
  );
}
