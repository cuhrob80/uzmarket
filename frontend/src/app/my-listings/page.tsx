import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMyListings } from '@/lib/api/server';
import { ListingActionsMenu } from './listing-actions-menu';
import type { Listing, ListingStatus } from '@/types/listing';

export const dynamic = 'force-dynamic';

const statusLabels: Record<ListingStatus, string> = {
  draft: 'Черновик',
  pending: 'На проверке',
  active: 'Активно',
  rejected: 'Требует исправления',
  sold: 'Завершено',
  archived: 'В архиве',
};

const statusTabs: Array<{
  value: ListingStatus;
  label: string;
}> = [
  { value: 'active', label: 'Активные' },
  { value: 'pending', label: 'На проверке' },
  { value: 'rejected', label: 'С ошибками' },
  { value: 'draft', label: 'Черновики' },
  { value: 'archived', label: 'Архив' },
  { value: 'sold', label: 'Завершённые' },
];

function formatPrice(listing: Listing): string {
  const value = Number(listing.price);

  if (!Number.isFinite(value)) {
    return `${listing.price} ${listing.currency}`;
  }

  const currencyLabel =
    listing.currency === 'UZS' ? 'сум' : listing.currency;

  return `${new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
  }).format(value)} ${currencyLabel}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

interface MyListingsPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
  }>;
}

export default async function MyListingsPage({
  searchParams,
}: MyListingsPageProps) {
  const params = await searchParams;
  const activeStatus = statusTabs.some(
    (tab) => tab.value === params.status,
  )
    ? (params.status as ListingStatus)
    : 'active';
  const search = params.search?.trim() ?? '';

  const [result, ...countResults] = await Promise.all([
    getMyListings(1, 20, {
      status: activeStatus,
      search,
    }),
    ...statusTabs.map((tab) =>
      getMyListings(1, 1, { status: tab.value }),
    ),
  ]);

  if (!result || countResults.some((item) => item === null)) {
    redirect('/login');
  }

  const counts = Object.fromEntries(
    statusTabs.map((tab, index) => [
      tab.value,
      countResults[index]?.total ?? 0,
    ]),
  ) as Record<ListingStatus, number>;

  return (
    <div className="account-dashboard">
      <aside className="account-sidebar" aria-label="Личный кабинет">
        <Link href="/profile">⌂ <span>Главное</span></Link>
        <Link href="/my-listings" className="is-active">
          ▣ <span>Мои объявления</span>
        </Link>
        <span className="is-disabled">◯ <span>Сообщения</span></span>
        <Link href="/profile/reviews">
          ☆ <span>Отзывы и рейтинг</span>
        </Link>
        <Link href="/profile">
          ⚙ <span>Профиль и настройки</span>
        </Link>
      </aside>

      <main className="account-listings">
        <header className="account-listings-heading">
          <h1>Мои объявления</h1>
          <Link href="/create-listing">Подать объявление</Link>
        </header>

        <nav className="account-status-tabs" aria-label="Статусы объявлений">
          {statusTabs.map((tab) => (
            <Link
              key={tab.value}
              href={
                '/my-listings?status=' +
                tab.value +
                (search
                  ? '&search=' + encodeURIComponent(search)
                  : '')
              }
              className={
                activeStatus === tab.value ? 'is-active' : undefined
              }
            >
              {tab.label} <sup>{counts[tab.value]}</sup>
            </Link>
          ))}
        </nav>

        <form action="/my-listings" className="account-listings-search">
          <input type="hidden" name="status" value={activeStatus} />
          <label>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Поиск по своим объявлениям"
            />
          </label>
          <button type="submit">Найти</button>
        </form>

        {result.items.length === 0 ? (
          <section className="account-listings-empty">
            <span aria-hidden="true">＋</span>
            <h2>В этом разделе объявлений нет</h2>
            <p>
              {search
                ? 'Попробуйте изменить поисковый запрос.'
                : 'Создайте новое объявление или выберите другой раздел.'}
            </p>
            <Link href="/create-listing">Подать объявление</Link>
          </section>
        ) : (
          <div className="account-listing-list">
            {result.items.map((listing) => {
              const image = listing.images[0];

              return (
                <article className="account-listing-card" key={listing.id}>
                  <div className="account-listing-image">
                    {image ? (
                      <img
                        src={image.url}
                        alt={listing.title}
                        width={180}
                        height={135}
                      />
                    ) : (
                      <span>Нет фото</span>
                    )}
                  </div>

                  <div className="account-listing-info">
                    <div>
                      <h2>{listing.title}</h2>
                      <strong>{formatPrice(listing)}</strong>
                    </div>
                    {listing.location ? (
                      <p>⌖ {listing.location}</p>
                    ) : null}
                    <span
                      className={
                        'account-listing-status status-' +
                        listing.status
                      }
                    >
                      {statusLabels[listing.status]}
                    </span>
                    {listing.status === 'pending' ? (
                      <p className="account-moderation-message">
                        Ваше объявление проверяется
                      </p>
                    ) : null}
                    {listing.status === 'rejected' ? (
                      <p className="account-moderation-message is-error">
                        {listing.moderationNote ||
                          'Исправьте объявление и отправьте его повторно'}
                      </p>
                    ) : null}
                    <small>
                      Размещено {formatDate(listing.createdAt)}
                      {listing.updatedAt !== listing.createdAt
                        ? ` · Обновлено ${formatDate(listing.updatedAt)}`
                        : ''}
                    </small>
                  </div>

                  <dl className="account-listing-stats">
                    <div>
                      <dt>◉ Просмотры</dt>
                      <dd>0</dd>
                    </div>
                    <div>
                      <dt>♡ В избранном</dt>
                      <dd>0</dd>
                    </div>
                  </dl>

                  <div className="account-listing-actions">
                    {(listing.status === 'draft' ||
                      listing.status === 'active' ||
                      listing.status === 'rejected') && (
                      <Link
                        href={`/my-listings/${listing.id}/edit`}
                      >
                        Редактировать
                      </Link>
                    )}
                    <ListingActionsMenu
                      listingId={listing.id}
                      status={listing.status}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
