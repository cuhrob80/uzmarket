import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FavoriteButton } from '@/components/favorite-button';
import { getFavoriteListings } from '@/lib/api/server';
import { getListingPublicPath } from '@/lib/listing-url';
import type { Listing } from '@/types/listing';

export const dynamic = 'force-dynamic';

function formatPrice(listing: Listing): string {
  const value = Number(listing.price);
  const price = Number.isFinite(value)
    ? new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 2,
      }).format(value)
    : listing.price;

  return `${price} ${listing.currency === 'UZS' ? 'сум' : listing.currency}`;
}

export default async function FavoritesPage() {
  const listings = await getFavoriteListings();

  if (!listings) {
    redirect('/login?returnTo=/favorites');
  }

  return (
    <main className="favorites-page">
      <section className="favorites-container">
        <header className="favorites-heading">
          <h1>Избранное</h1>
          <span>{listings.length}</span>
        </header>

        {listings.length === 0 ? (
          <div className="favorites-empty">
            <span aria-hidden="true">♡</span>
            <h2>В избранном пока пусто</h2>
            <p>Нажимайте на сердечко, чтобы сохранить объявления.</p>
            <Link href="/listings">Посмотреть объявления</Link>
          </div>
        ) : (
          <div className="favorites-list">
            {listings.map((listing) => {
              const image = listing.images[0];

              return (
                <article className="favorite-card" key={listing.id}>
                  <Link
                    href={getListingPublicPath(listing)}
                    className="favorite-card-main"
                  >
                    <div className="favorite-card-image">
                      {image ? (
                        <img
                          src={image.url}
                          alt={listing.title}
                          width={240}
                          height={180}
                        />
                      ) : (
                        <span>Нет фото</span>
                      )}
                    </div>
                    <div>
                      <h2>{listing.title}</h2>
                      <strong>{formatPrice(listing)}</strong>
                      <p>{listing.location || listing.category.name}</p>
                    </div>
                  </Link>
                  <FavoriteButton
                    listingId={listing.id}
                    initialFavorite
                    isAuthenticated
                  />
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
