'use client';

import {
  useActionState,
  useEffect,
  useState,
  type ChangeEvent,
} from 'react';
import { usePathname } from 'next/navigation';
import type { AuthUser } from '@/types/listing';
import { localeFromPathname } from '@/lib/locale-path';
import {
  updateProfileAction,
  type ProfileActionState,
} from './actions';

const initialState: ProfileActionState = {
  error: null,
  success: null,
};

export function ProfileForm({ user }: { user: AuthUser }) {
  const locale = localeFromPathname(usePathname());
  const text = locale === 'uz'
    ? {
        avatarAlt: 'Profil rasmi', photo: 'Rasmni o‘zgartirish', format: 'JPG, PNG yoki WEBP · 5 MB gacha',
        name: 'Ism', phone: 'Telefon', email: 'Elektron pochta', saving: 'Saqlanmoqda…', save: 'O‘zgarishlarni saqlash',
      }
    : {
        avatarAlt: 'Аватар профиля', photo: 'Изменить фото', format: 'JPG, PNG или WEBP · до 5 МБ',
        name: 'Имя', phone: 'Телефон', email: 'Электронная почта', saving: 'Сохраняем…', save: 'Сохранить изменения',
      };
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
            <img src={previewUrl} alt={text.avatarAlt} />
          ) : (
            <span>{initials}</span>
          )}
          <span className="profile-avatar-camera" aria-hidden="true">
            📷
          </span>
        </div>

        <label className="profile-avatar-button">
          {text.photo}
          <input
            type="file"
            name="avatar"
            accept="image/jpeg,image/png,image/webp"
            disabled={pending}
            onChange={handleAvatarChange}
          />
        </label>
        <small>{text.format}</small>
      </div>

      <label>
        {text.name}
        <input
          type="text"
          name="displayName"
          defaultValue={user.displayName}
          maxLength={120}
          disabled={pending}
        />
      </label>

      <label>
        {text.phone}
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
        {text.email}
        <input
          type="email"
          name="email"
          defaultValue={user.email}
          maxLength={320}
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
        {pending ? text.saving : text.save}
      </button>
    </form>
  );
}
