import type { Listing } from '@/types/listing';
import { FavoriteButton } from './favorite-button';

interface PublicListingViewProps {
  listing: Listing;
  initialFavorite: boolean;
  isAuthenticated: boolean;
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

export function PublicListingView({
  listing,
  initialFavorite,
  isAuthenticated,
}: PublicListingViewProps) {
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

          <div className="public-listing-price-row">
            <p className="public-listing-price">
              {formatPrice(listing)}
            </p>
            <FavoriteButton
              listingId={listing.id}
              initialFavorite={initialFavorite}
              isAuthenticated={isAuthenticated}
              className="public-listing-favorite"
            />
          </div>

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
