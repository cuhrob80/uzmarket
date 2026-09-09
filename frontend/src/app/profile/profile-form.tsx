'use client';

import {
  useActionState,
  useEffect,
  useState,
  type ChangeEvent,
} from 'react';
import type { AuthUser } from '@/types/listing';
import {
  updateProfileAction,
  type ProfileActionState,
} from './actions';

const initialState: ProfileActionState = {
  error: null,
  success: null,
};

export function ProfileForm({ user }: { user: AuthUser }) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialState,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.avatarUrl,
  );

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  const initials = user.displayName.trim().slice(0, 2).toUpperCase() || 'UZ';

  return (
    <form action={formAction} className="profile-form">
      <div className="profile-avatar-editor">
        <div className="profile-avatar-preview">
          {previewUrl ? (
            <img src={previewUrl} alt="Аватар профиля" />
          ) : (
            <span>{initials}</span>
          )}
          <span className="profile-avatar-camera" aria-hidden="true">
            📷
          </span>
        </div>

        <label className="profile-avatar-button">
          Изменить фото
          <input
            type="file"
            name="avatar"
            accept="image/jpeg,image/png,image/webp"
            disabled={pending}
            onChange={handleAvatarChange}
          />
        </label>
        <small>JPG, PNG или WEBP · до 5 МБ</small>
      </div>

      <label>
        Имя
        <input
          type="text"
          name="displayName"
          defaultValue={user.displayName}
          maxLength={120}
          required
          disabled={pending}
        />
      </label>

      <label>
        Телефон
        <input
          type="tel"
          name="phone"
          defaultValue={user.phone ?? ''}
          placeholder="+998 90 123-45-67"
          maxLength={40}
          disabled={pending}
        />
      </label>

      <label>
        Электронная почта
        <input
          type="email"
          name="email"
          defaultValue={user.email}
          maxLength={320}
          required
          disabled={pending}
        />
      </label>

      {state.error ? (
        <p className="form-error" role="alert">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="form-success" role="status">{state.success}</p>
      ) : null}

      <button type="submit" disabled={pending}>
        {pending ? 'Сохраняем…' : 'Сохранить изменения'}
      </button>
    </form>
  );
}
