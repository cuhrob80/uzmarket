import { notFound, redirect } from 'next/navigation';
import { ApiError, getMyListing } from '@/lib/api/server';
import type { Listing } from '@/types/listing';
import { PublishButton } from './publish-button';

export const dynamic = 'force-dynamic';

interface ListingReviewPageProps {
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

export default async function ListingReviewPage({
  params,
}: ListingReviewPageProps) {
  const { id } = await params;

  let listing;

  try {
    listing = await getMyListing(id);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  if (!listing) {
    redirect('/login');
  }

  if (listing.status !== 'draft') {
    redirect('/my-listings');
  }

  const images = [...listing.images].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <main className="listing-review-page">
      <section className="listing-review-container">
        <header className="listing-review-header">
          <p>Шаг 3</p>
          <h1>Проверьте объявление</h1>
          <p>
            Убедитесь, что всё указано правильно перед публикацией.
          </p>
        </header>

        <div className="listing-review-card">
          {images[0] ? (
            <img
              src={images[0].url}
              alt=""
              width={320}
              height={240}
            />
          ) : null}

          <div>
            <h2>{listing.title}</h2>

            <p>
              <strong>{formatPrice(listing)}</strong>
            </p>

            <p>{listing.category.name}</p>

            {listing.location ? (
              <p>{listing.location}</p>
            ) : null}

            <p>{listing.description}</p>

            <p>
              Фотографий: {images.length}
            </p>
          </div>
        </div>

        <div className="listing-review-actions">
          <a
            href={`/create-listing/${encodeURIComponent(
              listing.id,
            )}/photos`}
          >
            Назад к фотографиям
          </a>

          <PublishButton listingId={listing.id} />
        </div>
      </section>
    </main>
  );
}
