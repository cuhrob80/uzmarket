import { LocalizedLink } from './localized-link';
import { getDictionary } from '@/i18n/dictionaries';
import { getCategories, getListings } from '@/lib/api/server';
import { getListingPublicPath } from '@/lib/listing-url';
import { getCategoryName } from '@/lib/category-i18n';
import type { Listing } from '@/types/listing';
import styles from './localized-home.module.css';

export type HomeLocale = 'ru' | 'uz';

function formatPrice(listing: Listing, locale: HomeLocale): string {
  const value = Number(listing.price);
  if (!Number.isFinite(value)) return `${listing.price} ${listing.currency}`;

  return `${new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
    maximumFractionDigits: 2,
  }).format(value)} ${listing.currency}`;
}

export async function LocalizedHome({ locale }: { locale: HomeLocale }) {
  const dictionary = getDictionary(locale);
  const text = dictionary.home;
  const [categories, listings] = await Promise.all([
    getCategories(),
    getListings({ page: 1, limit: 8 }),
  ]);
  const rootCategories = categories
    .filter((category) =>
      category.parentId === null
      && !(category.name === 'E2E Category' && category.slug.startsWith('e2e-category-')),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ru'))
    .slice(0, 8);

  return (
    <main className={styles.home}>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroMain}>
          <div className={styles.heroCopy}>
            <p>{text.eyebrow}</p>
            <h1 id="home-title">{text.title}</h1>
            <span>{text.subtitle}</span>
            <LocalizedLink href="/listings">{text.primary} <b aria-hidden="true">→</b></LocalizedLink>
          </div>
          <div className={styles.heroScene} aria-hidden="true">
            <span className={styles.sofa} />
            <span className={styles.table} />
            <span className={styles.plant}>●</span>
          </div>
        </div>

        <div className={styles.heroSide}>
          <h2>{text.secondaryTitle}</h2>
          <p>{text.secondaryText}</p>
          <LocalizedLink href="#home-categories">{text.secondaryAction} →</LocalizedLink>
          <span className={styles.chair} aria-hidden="true" />
        </div>
      </section>

      <section id="home-categories" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{text.categories}</h2>
          <LocalizedLink href="/listings">{text.allListings}</LocalizedLink>
        </div>
        <div className={styles.categories}>
          {rootCategories.map((category, index) => (
            <LocalizedLink key={category.id} href={`/category/${encodeURIComponent(category.slug)}`}>
              <span className={styles.categoryIcon} aria-hidden="true">
                {['🚙', '🏢', '💼', '🛋️', '📱', '👕', '🛠️', '⚽'][index] ?? '•'}
              </span>
              <strong>{getCategoryName(category, locale)}</strong>
              <span aria-hidden="true">›</span>
            </LocalizedLink>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{text.recent}</h2>
          <LocalizedLink href="/listings">{text.viewAll}</LocalizedLink>
        </div>
        {listings.items.length === 0 ? (
          <div className={styles.empty}>
            <h3>{text.emptyTitle}</h3>
            <p>{text.emptyText}</p>
          </div>
        ) : (
          <div className={styles.listings}>
            {listings.items.map((listing) => {
              const image = [...listing.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
              return (
                <LocalizedLink key={listing.id} href={getListingPublicPath(listing)} className={styles.card}>
                  <div className={styles.cardImage}>
                    {image ? (
                      <img src={image.url} alt={listing.title} width={320} height={240} />
                    ) : (
                      <span>{dictionary.common.noPhoto}</span>
                    )}
                  </div>
                  <h3>{listing.title}</h3>
                  <strong>{formatPrice(listing, locale)}</strong>
                  <p>{listing.location || getCategoryName(listing.category, locale)}</p>
                </LocalizedLink>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
