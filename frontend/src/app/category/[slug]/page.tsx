import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ApiError,
  getCategories,
  getCategoryBySlug,
  getListings,
} from '@/lib/api/server';
import type { Category, Listing } from '@/types/listing';
import { TransportCategoryIcon } from '@/components/transport-category-icon';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}


const categoryAccentClasses = [
  'category-accent-green',
  'category-accent-coral',
  'category-accent-blue',
  'category-accent-lime',
  'category-accent-orange',
];

function formatPrice(listing: Listing): string {
  const value = Number(listing.price);

  if (!Number.isFinite(value)) {
    return `${listing.price} ${listing.currency}`;
  }

  return `${new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
  }).format(value)} ${listing.currency}`;
}

function MarketplaceHeader() {
  return (
    <header className="marketplace-header">
      <div className="marketplace-header-inner">
        <Link href="/" className="marketplace-logo" aria-label="UzMarket">
          <span>UZ</span>MARKET
          <small>Покупай. Продавай. Ближе к людям.</small>
        </Link>

        <form action="/listings" method="get" className="marketplace-header-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            name="search"
            placeholder="Что ищете?"
            aria-label="Поиск объявлений"
          />
        </form>

        <button type="button" className="marketplace-location">
          <span aria-hidden="true">⌖</span>
          Весь Узбекистан
        </button>

        <Link href="/create-listing" className="marketplace-create-button">
          <span aria-hidden="true">＋</span>
          Подать объявление
        </Link>

        <nav className="marketplace-quick-links" aria-label="Пользовательское меню">
          <Link href="/my-listings" aria-label="Избранное">♡</Link>
          <Link href="/login" aria-label="Профиль">♙</Link>
        </nav>
      </div>
    </header>
  );
}

function CategoryHub({
  category,
  children,
}: {
  category: Category;
  children: Category[];
}) {
  return (
    <main className="transport-page">
      <MarketplaceHeader />

      <div className="transport-container">
        <nav className="transport-breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span aria-hidden="true">→</span>
          <span>{category.name}</span>
        </nav>

        <div className="transport-title-row">
          <div>
            <p className="transport-eyebrow">Категории UzMarket</p>
            <h1>{category.name}</h1>
            <p className="transport-subtitle">
              Выберите нужный раздел, чтобы посмотреть объявления
            </p>
          </div>

          <span className="transport-category-count">
            {children.length} категорий
          </span>
        </div>

        <section className="transport-category-grid" aria-label="Разделы категории">
          {children.map((child, index) => (
            <Link
              key={child.id}
              href={`/category/${encodeURIComponent(child.slug)}`}
              className={`transport-category-card ${
                categoryAccentClasses[index % categoryAccentClasses.length]
              }`}
            >
              <span className="transport-category-icon" aria-hidden="true">
                <TransportCategoryIcon slug={child.slug} />
              </span>

              <span className="transport-category-name">{child.name}</span>
              <span className="transport-category-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  let category: Category;

  try {
    category = await getCategoryBySlug(slug);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const categories = await getCategories();
  const childCategories = categories
    .filter((item) => item.parentId === category.id)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ru'));

  if (childCategories.length > 0) {
    return <CategoryHub category={category} children={childCategories} />;
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
            <p className="catalog-category-label">Категория</p>
            <h1>{category.name}</h1>
          </div>

          <Link href="/listings">Все объявления</Link>
        </header>

        {listings.items.length === 0 ? (
          <div className="empty-state">
            <h2>Объявлений пока нет</h2>
            <p>В этой категории пока нет активных объявлений.</p>
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
                    <p className="catalog-card-price">{formatPrice(listing)}</p>
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
