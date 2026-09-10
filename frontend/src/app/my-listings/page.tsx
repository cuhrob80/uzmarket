import { redirect } from 'next/navigation';
import { getMyListings } from '@/lib/api/server';
import { ListingActionsMenu } from './listing-actions-menu';
import { AccountShell } from '@/components/account-shell';
import { LocalizedLink } from '@/components/localized-link';
import { getRequestLocale } from '@/lib/server-locale';
import type { SiteLocale } from '@/lib/locale-path';
import type { Listing, ListingStatus } from '@/types/listing';

export const dynamic = 'force-dynamic';

const statusLabels: Record<SiteLocale, Record<ListingStatus, string>> = {
  ru: {
  draft: 'Черновик',
  pending: 'На проверке',
  active: 'Активно',
  rejected: 'Требует исправления',
  unpublished: 'Не опубликовано',
  sold: 'В архиве',
  archived: 'В архиве',
  deleted: 'Удалено',
  },
  uz: {
    draft: 'Qoralama', pending: 'Tekshiruvda', active: 'Faol', rejected: 'Tuzatish kerak',
    unpublished: 'E’lon qilinmagan', sold: 'Arxivda', archived: 'Arxivda', deleted: 'O‘chirilgan',
  },
};

const statusTabsRu: Array<{
  value: ListingStatus;
  label: string;
}> = [
  { value: 'active', label: 'Активные' },
  { value: 'rejected', label: 'С ошибками' },
  { value: 'unpublished', label: 'Неопубликованные' },
  { value: 'draft', label: 'Черновики' },
  { value: 'archived', label: 'Архив' },
  { value: 'deleted', label: 'Удалённые' },
];

function formatPrice(listing: Listing, locale: SiteLocale): string {
  const value = Number(listing.price);

  if (!Number.isFinite(value)) {
    return `${listing.price} ${listing.currency}`;
  }

  const currencyLabel =
    listing.currency === 'UZS' ? (locale === 'uz' ? 'so‘m' : 'сум') : listing.currency;

  return `${new Intl.NumberFormat(locale === 'uz' ? 'uz-UZ' : 'ru-RU', {
    maximumFractionDigits: 2,
  }).format(value)} ${currencyLabel}`;
}

function formatDate(value: string, locale: SiteLocale): string {
  return new Intl.DateTimeFormat(locale === 'uz' ? 'uz-UZ' : 'ru-RU', {
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
  const [params, locale] = await Promise.all([searchParams, getRequestLocale()]);
  const statusTabs = locale === 'uz'
    ? [
        { value: 'active', label: 'Faol' }, { value: 'rejected', label: 'Xatolar bilan' },
        { value: 'unpublished', label: 'E’lon qilinmagan' }, { value: 'draft', label: 'Qoralamalar' },
        { value: 'archived', label: 'Arxiv' }, { value: 'deleted', label: 'O‘chirilgan' },
      ] satisfies Array<{ value: ListingStatus; label: string }>
    : statusTabsRu;
  const text = locale === 'uz'
    ? { title: 'Mening e’lonlarim', create: 'E’lon joylashtirish', tabs: 'E’lon holatlari', search: 'O‘z e’lonlarimdan qidirish', find: 'Topish', empty: 'Bu bo‘limda e’lonlar yo‘q', changeSearch: 'Qidiruv so‘rovini o‘zgartirib ko‘ring.', createHelp: 'Yangi e’lon yarating yoki boshqa bo‘limni tanlang.', noPhoto: 'Rasm yo‘q', checking: 'E’loningiz tekshirilmoqda', fix: 'E’lonni tuzating va qayta yuboring', placed: 'Joylashtirilgan', updated: 'Yangilangan', views: 'Ko‘rishlar', favorites: 'Sevimlilarda', edit: 'Tahrirlash' }
    : { title: 'Мои объявления', create: 'Подать объявление', tabs: 'Статусы объявлений', search: 'Поиск по своим объявлениям', find: 'Найти', empty: 'В этом разделе объявлений нет', changeSearch: 'Попробуйте изменить поисковый запрос.', createHelp: 'Создайте новое объявление или выберите другой раздел.', noPhoto: 'Нет фото', checking: 'Ваше объявление проверяется', fix: 'Исправьте объявление и отправьте его повторно', placed: 'Размещено', updated: 'Обновлено', views: 'Просмотры', favorites: 'В избранном', edit: 'Редактировать' };
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
    <AccountShell active="listings">
      <main className="account-listings">
        <header className="account-listings-heading">
          <h1>{text.title}</h1>
          <LocalizedLink href="/create-listing">{text.create}</LocalizedLink>
        </header>

        <nav className="account-status-tabs" aria-label={text.tabs}>
          {statusTabs.map((tab) => (
            <LocalizedLink
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
            </LocalizedLink>
          ))}
        </nav>

        <form action={`/${locale}/my-listings`} className="account-listings-search">
          <input type="hidden" name="status" value={activeStatus} />
          <label>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder={text.search}
            />
          </label>
          <button type="submit">{text.find}</button>
        </form>

        {result.items.length === 0 ? (
          <section className="account-listings-empty">
            <span aria-hidden="true">＋</span>
            <h2>{text.empty}</h2>
            <p>
              {search
                ? text.changeSearch
                : text.createHelp}
            </p>
            <LocalizedLink href="/create-listing">{text.create}</LocalizedLink>
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
                      <span>{text.noPhoto}</span>
                    )}
                  </div>

                  <div className="account-listing-info">
                    <div>
                      <h2>{listing.title}</h2>
                      <strong>{formatPrice(listing, locale)}</strong>
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
                      {statusLabels[locale][listing.status]}
                    </span>
                    {listing.status === 'pending' ? (
                      <p className="account-moderation-message">
                        {text.checking}
                      </p>
                    ) : null}
                    {listing.status === 'rejected' ? (
                      <p className="account-moderation-message is-error">
                        {listing.moderationNote || text.fix}
                      </p>
                    ) : null}
                    <small>
                      {text.placed} {formatDate(listing.createdAt, locale)}
                      {listing.updatedAt !== listing.createdAt
                        ? ` · ${text.updated} ${formatDate(listing.updatedAt, locale)}`
                        : ''}
                    </small>
                  </div>

                  <dl className="account-listing-stats">
                    <div>
                      <dt>◉ {text.views}</dt>
                      <dd>0</dd>
                    </div>
                    <div>
                      <dt>♡ {text.favorites}</dt>
                      <dd>{listing.favoriteCount}</dd>
                    </div>
                  </dl>

                  <div className="account-listing-actions">
                    {(listing.status === 'draft' ||
                      listing.status === 'active' ||
                      listing.status === 'rejected' ||
                      listing.status === 'unpublished') && (
                      <LocalizedLink
                        href={`/my-listings/${listing.id}/edit`}
                      >
                        {text.edit}
                      </LocalizedLink>
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
    </AccountShell>
  );
}
