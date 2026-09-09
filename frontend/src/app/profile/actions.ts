'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  ApiError,
  clearAuthCookie,
  updateProfile,
  uploadProfileAvatar,
} from '@/lib/api/server';

export interface ProfileActionState {
  error: string | null;
  success: string | null;
}

export async function updateProfileAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const displayName = String(formData.get('displayName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const avatar = formData.get('avatar');

  if (!displayName || !email) {
    return {
      error: 'Введите имя и электронную почту.',
      success: null,
    };
  }

  try {
    await updateProfile({ displayName, email, phone });

    if (avatar instanceof File && avatar.size > 0) {
      if (avatar.size > 5 * 1024 * 1024) {
        return {
          error: 'Фотография должна быть не больше 5 МБ.',
          success: null,
        };
      }

      await uploadProfileAvatar(avatar);
    }
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      redirect('/login');
    }

    return {
      error:
        error instanceof ApiError
          ? error.message
          : 'Не удалось сохранить профиль.',
      success: null,
    };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/profile');

  return {
    error: null,
    success: 'Изменения сохранены',
  };
}

export async function logoutAction(): Promise<void> {
  await clearAuthCookie();
  redirect('/login');
}
