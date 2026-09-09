import { LoginForm } from './login-form';

interface LoginPageProps {
  searchParams: Promise<{ returnTo?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { returnTo } = await searchParams;

  return (
    <main>
      <section aria-labelledby="login-title">
        <h1 id="login-title">Вход в UzMarket</h1>
        <p className="page-description">
          Войдите, чтобы управлять объявлениями и избранным.
        </p>

        <LoginForm returnTo={returnTo} />
      </section>
    </main>
  );
}
