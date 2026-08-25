'use client';

import { useActionState } from 'react';
import { loginAction, type LoginState } from './actions';

const initialState: LoginState = {
  error: null,
};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="auth-form">
      <label>
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>

      <label>
        Пароль
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
        />
      </label>

      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending}>
        {pending ? 'Входим…' : 'Войти'}
      </button>
    </form>
  );
}
