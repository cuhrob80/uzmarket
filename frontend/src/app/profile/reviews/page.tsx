import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/api/server';
import { AccountShell } from '@/components/account-shell';

export const dynamic = 'force-dynamic';

interface ReviewsPageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function ReviewsPage({
  searchParams,
}: ReviewsPageProps) {
  const [user, params] = await Promise.all([
    getCurrentUser(),
    searchParams,
  ]);

  if (!user) {
    redirect('/login');
  }

  const view = params.view === 'written' ? 'written' : 'received';

  return (
    <AccountShell active="reviews">
      <main className="profile-page account-content-page">
        <section className="profile-container reviews-container">
        <div className="reviews-heading">
          <div>
            <Link href="/profile" className="reviews-back">
              ← Личный кабинет
            </Link>
            <h1>Отзывы и рейтинг</h1>
          </div>
          <div className="account-rating" aria-label="Рейтинг пока отсутствует">
            <strong>—</strong>
            <span>★</span>
            <small>Пока нет оценок</small>
          </div>
        </div>

        <nav className="reviews-tabs" aria-label="Разделы отзывов">
          <Link
            href="/profile/reviews?view=received"
            className={view === 'received' ? 'is-active' : undefined}
          >
            Отзывы обо мне
          </Link>
          <Link
            href="/profile/reviews?view=written"
            className={view === 'written' ? 'is-active' : undefined}
          >
            Мои отзывы
          </Link>
        </nav>

        <div className="reviews-empty">
          <span aria-hidden="true">★</span>
          <h2>
            {view === 'received'
              ? 'У вас пока нет отзывов'
              : 'Вы пока не оставляли отзывов'}
          </h2>
          <p>
            {view === 'received'
              ? 'Здесь появятся оценки и отзывы других пользователей.'
              : 'Здесь будут отзывы, которые вы оставите другим пользователям.'}
          </p>
        </div>
        </section>
      </main>
    </AccountShell>
  );
}
