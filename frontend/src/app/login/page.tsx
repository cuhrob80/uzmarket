import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <main>
      <section aria-labelledby="login-title">
        <h1 id="login-title">Вход в UzMarket</h1>
        <p className="page-description">
          Войдите, чтобы управлять своими объявлениями.
        </p>

        <LoginForm />
      </section>
    </main>
  );
}
