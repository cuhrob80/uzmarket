import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMyListings } from '@/lib/api/server';
import type { Listing, ListingStatus } from '@/types/listing';

export const dynamic = 'force-dynamic';

const statusLabels: Record<ListingStatus, string> = {
  draft: 'Черновик',
  active: 'Активно',
  sold: 'Продано',
  archived: 'В архиве',
};

function formatPrice(listing: Listing): string {
  const value = Number(listing.price);

  if (!Number.isFinite(value)) {
    return `${listing.price} ${listing.currency}`;
  }

  return `${new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
  }).format(value)} ${listing.currency}`;
}

export default async function MyListingsPage() {
  const result = await getMyListings(1, 20);

  if (!result) {
    redirect('/login');
  }

  return (
    <main className="my-listings-page">
      <section
        className="my-listings-container"
        aria-labelledby="my-listings-title"
      >
        <header className="my-listings-header">
          <div>
            <h1 id="my-listings-title">Мои объявления</h1>
            <p className="page-description">
              Всего объявлений: {result.total}
            </p>
          </div>
        </header>

        {result.items.length === 0 ? (
          <div className="empty-state">
            <h2>Объявлений пока нет</h2>
            <p>Здесь появятся ваши объявления.</p>
          </div>
        ) : (
          <div className="listing-list">
            {result.items.map((listing) => {
              const image = listing.images[0];

              return (
                <article className="listing-card" key={listing.id}>
                  <div className="listing-image">
                    {image ? (
                      <img
                        src={image.url}
                        alt=""
                        width={160}
                        height={120}
                      />
                    ) : (
                      <span>Нет фото</span>
                    )}
                  </div>

                  <div className="listing-content">
                    <div className="listing-title-row">
                      <h2>{listing.title}</h2>

                      <span
                        className={`listing-status status-${listing.status}`}
                      >
                        {statusLabels[listing.status]}
                      </span>
                    </div>

                    <p className="listing-price">
                      {formatPrice(listing)}
                    </p>

                    <p className="listing-meta">
                      {listing.category.name}
                      {listing.location
                        ? ` · ${listing.location}`
                        : ''}
                    </p>

                    {listing.status === 'draft' ||
                    listing.status === 'active' ? (
                      <div className="listing-actions">
                        <Link
                          href={`/my-listings/${listing.id}/edit`}
                          className="listing-edit-link"
                        >
                          Редактировать
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
