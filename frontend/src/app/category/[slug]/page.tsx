import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ApiError,
  getCategoryBySlug,
  getListings,
} from '@/lib/api/server';
import type { Listing } from '@/types/listing';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
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

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  let category;

  try {
    category = await getCategoryBySlug(slug);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const listings = await getListings({
    categoryId: category.id,
    page: 1,
    limit: 20,
  });

  return (
    <main className="catalog-page">
      <section className="catalog-container">
        <header className="catalog-header">
          <div>
            <p className="catalog-category-label">
              Категория
            </p>

            <h1>{category.name}</h1>
          </div>

          <Link href="/listings">
            Все объявления
          </Link>
        </header>

        {listings.items.length === 0 ? (
          <div className="empty-state">
            <h2>Объявлений пока нет</h2>
            <p>
              В этой категории пока нет активных объявлений.
            </p>
          </div>
        ) : (
          <div className="catalog-grid">
            {listings.items.map((listing) => {
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
                      {listing.location ?? 'Узбекистан'}
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
