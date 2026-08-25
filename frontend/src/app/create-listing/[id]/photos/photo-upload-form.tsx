'use client';

import { useActionState } from 'react';
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
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          disabled={pending || limitReached}
        />
      </label>

      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || limitReached}
      >
        {pending ? 'Загружаем…' : 'Загрузить'}
      </button>
    </form>
  );
}
