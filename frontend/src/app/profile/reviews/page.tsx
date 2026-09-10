import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/api/server';
import { AccountShell } from '@/components/account-shell';
import { LocalizedLink } from '@/components/localized-link';
import { getRequestLocale } from '@/lib/server-locale';

export const dynamic = 'force-dynamic';

interface ReviewsPageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function ReviewsPage({
  searchParams,
}: ReviewsPageProps) {
  const [user, params, locale] = await Promise.all([
    getCurrentUser(),
    searchParams,
    getRequestLocale(),
  ]);

  if (!user) {
    redirect('/login');
  }

  const view = params.view === 'written' ? 'written' : 'received';
  const text = locale === 'uz'
    ? { back: 'Shaxsiy kabinet', title: 'Sharhlar va reyting', ratingLabel: 'Hozircha reyting yo‘q', noRatings: 'Hozircha baholar yo‘q', received: 'Men haqimdagi sharhlar', written: 'Men yozgan sharhlar' }
    : { back: 'Личный кабинет', title: 'Отзывы и рейтинг', ratingLabel: 'Рейтинг пока отсутствует', noRatings: 'Пока нет оценок', received: 'Отзывы обо мне', written: 'Мои отзывы' };

  return (
    <AccountShell active="reviews">
      <main className="profile-page account-content-page">
        <section className="profile-container reviews-container">
        <div className="reviews-heading">
          <div>
            <LocalizedLink href="/profile" className="reviews-back">
              ← {text.back}
            </LocalizedLink>
            <h1>{text.title}</h1>
          </div>
          <div className="account-rating" aria-label={text.ratingLabel}>
            <strong>—</strong>
            <span>★</span>
            <small>{text.noRatings}</small>
          </div>
        </div>

        <nav className="reviews-tabs" aria-label="Разделы отзывов">
          <LocalizedLink
            href="/profile/reviews?view=received"
            className={view === 'received' ? 'is-active' : undefined}
          >
            {text.received}
          </LocalizedLink>
          <LocalizedLink
            href="/profile/reviews?view=written"
            className={view === 'written' ? 'is-active' : undefined}
          >
            {text.written}
          </LocalizedLink>
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
