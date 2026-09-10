import Link from 'next/link';
import { getCategories, getListings } from '@/lib/api/server';
import { getListingPublicPath } from '@/lib/listing-url';
import type { Listing } from '@/types/listing';
import styles from './localized-home.module.css';

export type HomeLocale = 'ru' | 'uz';

const copy = {
  ru: {
    eyebrow: 'Маркетплейс Узбекистана',
    title: 'Покупайте и продавайте с UzMarket',
    subtitle: 'Тысячи объявлений рядом с вами',
    primary: 'Перейти к объявлениям',
    secondaryTitle: 'Всё для вашего дома',
    secondaryText: 'Мебель, техника, декор и многое другое',
    secondaryAction: 'Смотреть категории',
    categories: 'Популярные категории',
    allListings: 'Все объявления',
    recent: 'Свежие объявления',
    viewAll: 'Смотреть все',
    emptyTitle: 'Пока нет объявлений',
    emptyText: 'Новые объявления появятся здесь.',
    noPhoto: 'Нет фото',
  },
  uz: {
    eyebrow: 'O‘zbekiston marketpleysi',
    title: 'UzMarket bilan sotib oling va soting',
    subtitle: 'Yoningizdagi minglab e’lonlar',
    primary: 'E’lonlarga o‘tish',
    secondaryTitle: 'Uyingiz uchun hamma narsa',
    secondaryText: 'Mebel, texnika, bezak va boshqa mahsulotlar',
    secondaryAction: 'Kategoriyalarni ko‘rish',
    categories: 'Ommabop kategoriyalar',
    allListings: 'Barcha e’lonlar',
    recent: 'Yangi e’lonlonlar',
    viewAll: 'Barchasini ko‘rish',
    emptyTitle: 'Hozircha e’lonlar yo‘q',
    emptyText: 'Yangi e’lonlar shu yerda paydo bo‘ladi.',
    noPhoto: 'Rasm yo‘q',
  },
} as const;

function formatPrice(listing: Listing, locale: HomeLocale): string {
  const value = Number(listing.price);
  if (!Number.isFinite(value)) return `${listing.price} ${listing.currency}`;

  return `${new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
    maximumFractionDigits: 2,
  }).format(value)} ${listing.currency}`;
}

export async function LocalizedHome({ locale }: { locale: HomeLocale }) {
  const text = copy[locale];
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
            <Link href="/listings">{text.primary} <b aria-hidden="true">→</b></Link>
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
          <Link href="#home-categories">{text.secondaryAction} →</Link>
          <span className={styles.chair} aria-hidden="true" />
        </div>
      </section>

      <section id="home-categories" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{text.categories}</h2>
          <Link href="/listings">{text.allListings}</Link>
        </div>
        <div className={styles.categories}>
          {rootCategories.map((category, index) => (
            <Link key={category.id} href={`/category/${encodeURIComponent(category.slug)}`}>
              <span className={styles.categoryIcon} aria-hidden="true">
                {['🚙', '🏢', '💼', '🛋️', '📱', '👕', '🛠️', '⚽'][index] ?? '•'}
              </span>
              <strong>{category.name}</strong>
              <span aria-hidden="true">›</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{text.recent}</h2>
          <Link href="/listings">{text.viewAll}</Link>
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
                <Link key={listing.id} href={getListingPublicPath(listing)} className={styles.card}>
                  <div className={styles.cardImage}>
                    {image ? (
                      <img src={image.url} alt={listing.title} width={320} height={240} />
                    ) : (
                      <span>{text.noPhoto}</span>
                    )}
                  </div>
                  <h3>{listing.title}</h3>
                  <strong>{formatPrice(listing, locale)}</strong>
                  <p>{listing.location || listing.category.name}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
