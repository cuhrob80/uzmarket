import Link from 'next/link';
import { getCategories, getListings } from '@/lib/api/server';
import type { Listing } from '@/types/listing';
import { MarketplaceHeader } from '@/components/marketplace-header';

export const dynamic = 'force-dynamic';

function formatPrice(listing: Listing): string {
  const value = Number(listing.price);

  if (!Number.isFinite(value)) {
    return `${listing.price} ${listing.currency}`;
  }

  return `${new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
  }).format(value)} ${listing.currency}`;
}

export default async function Home() {
  const [categories, listings] = await Promise.all([
    getCategories(),
    getListings({
      page: 1,
      limit: 8,
    }),
  ]);

  return (
    <main className="marketplace-home">
      <MarketplaceHeader />
      <section className="home-hero">
        <div className="home-container">
          <h1>UzMarket</h1>

          <p className="home-hero-text">
            Покупайте и продавайте товары и услуги по всему Узбекистану
          </p>

          <form
            action="/listings"
            method="get"
            className="home-search"
          >
            <input
              type="search"
              name="search"
              placeholder="Что вы ищете?"
              aria-label="Поиск объявлений"
            />

            <button type="submit">
              Найти
            </button>
          </form>
        </div>
      </section>

      <section className="home-section home-container">
        <div className="home-section-header">
          <h2>Категории</h2>

          <Link href="/listings">
            Все объявления
          </Link>
        </div>

        <div className="home-categories">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${encodeURIComponent(
                category.slug,
              )}`}
              className="home-category-card"
            >
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section home-container">
        <div className="home-section-header">
          <h2>Свежие объявления</h2>

          <Link href="/listings">
            Смотреть все
          </Link>
        </div>

        {listings.items.length === 0 ? (
          <div className="empty-state">
            <h3>Пока нет объявлений</h3>
            <p>
              Новые объявления появятся здесь.
            </p>
          </div>
        ) : (
          <div className="catalog-grid">
            {listings.items.map((listing) => {
              const image = [...listing.images].sort(
                (a, b) => a.sortOrder - b.sortOrder,
              )[0];

              return (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="catalog-card"
                >
                  <div className="catalog-card-image">
                    {image ? (
                      <img
                        src={image.url}
                        alt={listing.title}
                        width={320}
                        height={240}
                      />
                    ) : (
                      <span>Нет фото</span>
                    )}
                  </div>

                  <div className="catalog-card-content">
                    <h3>{listing.title}</h3>

                    <p className="catalog-card-price">
                      {formatPrice(listing)}
                    </p>

                    <p className="catalog-card-meta">
                      {listing.category.name}
                      {listing.location
                        ? ` · ${listing.location}`
                        : ''}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
