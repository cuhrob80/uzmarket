'use server';

import { redirect } from 'next/navigation';
import { ApiError, login, setAuthCookie } from '@/lib/api/server';

export interface LoginState {
  error: string | null;
}

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof email !== 'string' || typeof password !== 'string') {
    return { error: 'Введите email и пароль' };
  }

  if (!email.trim() || !password) {
    return { error: 'Введите email и пароль' };
  }

  try {
    const result = await login(email.trim(), password);
    await setAuthCookie(result.accessToken);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      return { error: 'Неверный email или пароль' };
    }

    console.error('Login failed:', error);
    return { error: 'Не удалось выполнить вход. Попробуйте ещё раз.' };
  }

  redirect('/my-listings');
}
