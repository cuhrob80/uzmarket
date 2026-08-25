import Link from 'next/link';
import { getCategories, getListings } from '@/lib/api/server';
import type { Listing } from '@/types/listing';

export const dynamic = 'force-dynamic';

interface ListingsPageProps {
  searchParams: Promise<{
    page?: string;
    categoryId?: string;
    search?: string;
  }>;
}

function formatPrice(listing: Listing): string {
  const value = Number(listing.price);

  if (!Number.isFinite(value)) {
    return `${listing.price} ${listing.currency}`;
  }

  return `${new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
  }).format(value)} ${listing.currency}`;
}

export default async function ListingsPage({
  searchParams,
}: ListingsPageProps) {
  const params = await searchParams;

  const parsedPage = Number(params.page);
  const page =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  const search = params.search?.trim() || '';
  const categoryId = params.categoryId || '';

  const [result, categories] = await Promise.all([
    getListings({
      page,
      limit: 20,
      search: search || undefined,
      categoryId: categoryId || undefined,
    }),
    getCategories(),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(result.total / result.limit),
  );

  function createPageHref(targetPage: number): string {
    const query = new URLSearchParams();

    query.set('page', String(targetPage));

    if (search) {
      query.set('search', search);
    }

    if (categoryId) {
      query.set('categoryId', categoryId);
    }

    return `/listings?${query.toString()}`;
  }

  return (
    <main className="catalog-page">
      <section className="catalog-container">
        <header className="catalog-header">
          <h1>Объявления</h1>

          <p>
            Найдено: {result.total}
          </p>
        </header>

        <form
          action="/listings"
          method="get"
          className="catalog-filters"
        >
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Поиск объявлений"
          />

          <select
            name="categoryId"
            defaultValue={categoryId}
          >
            <option value="">
              Все категории
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          <button type="submit">
            Найти
          </button>
        </form>

        {result.items.length === 0 ? (
          <div className="empty-state">
            <h2>Объявления не найдены</h2>
            <p>
              Попробуйте изменить параметры поиска.
            </p>
          </div>
        ) : (
          <div className="catalog-grid">
            {result.items.map((listing) => {
              const image = listing.images[0];

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
                    <h2>{listing.title}</h2>

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

        {totalPages > 1 ? (
          <nav
            className="catalog-pagination"
            aria-label="Навигация по страницам"
          >
            {page > 1 ? (
              <Link href={createPageHref(page - 1)}>
                ← Назад
              </Link>
            ) : (
              <span />
            )}

            <span>
              Страница {page} из {totalPages}
            </span>

            {page < totalPages ? (
              <Link href={createPageHref(page + 1)}>
                Вперёд →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </section>
    </main>
  );
}
