import {
  getCategories,
  getFavoriteListingIds,
  getListings,
} from '@/lib/api/server';
import { FavoriteButton } from '@/components/favorite-button';
import { LocalizedLink } from '@/components/localized-link';
import { getRequestLocale } from '@/lib/server-locale';
import { getCategoryName } from '@/lib/category-i18n';
import type { SiteLocale } from '@/lib/locale-path';
import { getDictionary } from '@/i18n/dictionaries';
import { getListingPublicPath } from '@/lib/listing-url';
import type { Listing } from '@/types/listing';

export const dynamic = 'force-dynamic';

interface ListingsPageProps {
  searchParams: Promise<{
    page?: string;
    categoryId?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    currency?: string;
    location?: string;
  }>;
}

function formatPrice(listing: Listing, locale: SiteLocale): string {
  const value = Number(listing.price);

  if (!Number.isFinite(value)) {
    return `${listing.price} ${listing.currency}`;
  }

  return `${new Intl.NumberFormat(locale === 'uz' ? 'uz-UZ' : 'ru-RU', {
    maximumFractionDigits: 2,
  }).format(value)} ${listing.currency}`;
}

export default async function ListingsPage({
  searchParams,
}: ListingsPageProps) {
  const [params, locale] = await Promise.all([searchParams, getRequestLocale()]);
  const dictionary = getDictionary(locale);
  const text = dictionary.catalog;
  const parsedPage = Number(params.page);
  const page =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  const search = params.search?.trim() || '';
  const categoryId = params.categoryId || '';
  const location = params.location?.trim() || '';

  const minPriceValue = params.minPrice?.trim() || '';
  const maxPriceValue = params.maxPrice?.trim() || '';

  const parsedMinPrice = Number(minPriceValue);
  const parsedMaxPrice = Number(maxPriceValue);

  const minPrice =
    minPriceValue &&
    Number.isFinite(parsedMinPrice) &&
    parsedMinPrice >= 0
      ? parsedMinPrice
      : undefined;

  const maxPrice =
    maxPriceValue &&
    Number.isFinite(parsedMaxPrice) &&
    parsedMaxPrice >= 0
      ? parsedMaxPrice
      : undefined;

  const currency =
    params.currency === 'UZS' || params.currency === 'USD'
      ? params.currency
      : '';

  const [result, categories, favoriteIds] = await Promise.all([
    getListings({
      page,
      limit: 20,
      search: search || undefined,
      categoryId: categoryId || undefined,
      minPrice,
      maxPrice,
      currency: currency || undefined,
      location: location || undefined,
    }),
    getCategories(),
    getFavoriteListingIds(),
  ]);

  const favoriteIdSet = new Set(favoriteIds ?? []);

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

    if (minPriceValue) {
      query.set('minPrice', minPriceValue);
    }

    if (maxPriceValue) {
      query.set('maxPrice', maxPriceValue);
    }

    if (currency) {
      query.set('currency', currency);
    }

    if (location) {
      query.set('location', location);
    }

    return `/listings?${query.toString()}`;
  }

  return (
    <main className="catalog-page">
      <section className="catalog-container">
        <header className="catalog-header">
          <h1>{text.title}</h1>

          <p>
            {text.found}: {result.total}
          </p>
        </header>

        <form
          action={`/${locale}/listings`}
          method="get"
          className="catalog-filters"
        >
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder={text.search}
          />

          <select
            name="categoryId"
            defaultValue={categoryId}
          >
            <option value="">
              {text.allCategories}
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {getCategoryName(category, locale)}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="minPrice"
            min="0"
            step="any"
            defaultValue={minPriceValue}
            placeholder={text.minPrice}
          />

          <input
            type="number"
            name="maxPrice"
            min="0"
            step="any"
            defaultValue={maxPriceValue}
            placeholder={text.maxPrice}
          />

          <select
            name="currency"
            defaultValue={currency}
          >
            <option value="">
              {text.currency}
            </option>
            <option value="UZS">
              UZS
            </option>
            <option value="USD">
              USD
            </option>
          </select>

          <input
            type="search"
            name="location"
            defaultValue={location}
            placeholder={text.location}
          />

          <button type="submit">
            {dictionary.common.find}
          </button>
        </form>

        {result.items.length === 0 ? (
          <div className="empty-state">
            <h2>{text.empty}</h2>
            <p>
              {text.emptyHelp}
            </p>
          </div>
        ) : (
          <div className="catalog-grid">
            {result.items.map((listing) => {
              const image = listing.images[0];

              return (
                <article className="catalog-card" key={listing.id}>
                  <LocalizedLink
                    href={getListingPublicPath(listing)}
                    className="catalog-card-link"
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
                        <span>{dictionary.common.noPhoto}</span>
                      )}
                    </div>

                    <div className="catalog-card-content">
                      <h2>{listing.title}</h2>

                      <p className="catalog-card-price">
                        {formatPrice(listing, locale)}
                      </p>

                      <p className="catalog-card-meta">
                        {getCategoryName(listing.category, locale)}
                        {listing.location
                          ? ` · ${listing.location}`
                          : ''}
                      </p>
                    </div>
                  </LocalizedLink>
                  <FavoriteButton
                    listingId={listing.id}
                    initialFavorite={favoriteIdSet.has(listing.id)}
                    isAuthenticated={favoriteIds !== null}
                    className="catalog-favorite-button"
                  />
                </article>
              );
            })}
          </div>
        )}

        {totalPages > 1 ? (
          <nav
            className="catalog-pagination"
            aria-label={text.pagination}
          >
            {page > 1 ? (
              <LocalizedLink href={createPageHref(page - 1)}>
                ← {text.back}
              </LocalizedLink>
            ) : (
              <span />
            )}

            <span>
              {text.page} {page} {text.of} {totalPages}
            </span>

            {page < totalPages ? (
              <LocalizedLink href={createPageHref(page + 1)}>
                {text.next} →
              </LocalizedLink>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </section>
    </main>
  );
}
