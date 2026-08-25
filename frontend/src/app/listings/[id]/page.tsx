import { notFound } from 'next/navigation';
import { ApiError, getListing } from '@/lib/api/server';
import type { Listing } from '@/types/listing';

export const dynamic = 'force-dynamic';

interface ListingPageProps {
  params: Promise<{
    id: string;
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

export default async function ListingPage({
  params,
}: ListingPageProps) {
  const { id } = await params;

  let listing: Listing;

  try {
    listing = await getListing(id);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const images = [...listing.images].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <main className="public-listing-page">
      <section className="public-listing-container">
        <div className="public-listing-gallery">
          {images.length > 0 ? (
            images.map((image, index) => (
              <img
                key={image.id}
                src={image.url}
                alt={`${listing.title}, фото ${index + 1}`}
                width={960}
                height={720}
              />
            ))
          ) : (
            <div className="empty-state">
              <p>Нет фотографий</p>
            </div>
          )}
        </div>

        <div className="public-listing-details">
          <p className="public-listing-category">
            {listing.category.name}
          </p>

          <h1>{listing.title}</h1>

          <p className="public-listing-price">
            {formatPrice(listing)}
          </p>

          {listing.location ? (
            <p className="public-listing-location">
              {listing.location}
            </p>
          ) : null}

          <section className="public-listing-description">
            <h2>Описание</h2>
            <p>{listing.description}</p>
          </section>

          <section className="public-listing-seller">
            <h2>Продавец</h2>
            <p>{listing.seller.displayName}</p>
          </section>
        </div>
      </section>
    </main>
  );
}
