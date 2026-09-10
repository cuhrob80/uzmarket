import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ApiError,
  getCategories,
  getCategoryBySlug,
  getListings,
} from '@/lib/api/server';
import { getListingPublicPath } from '@/lib/listing-url';
import type { Category, Listing } from '@/types/listing';
import { TransportCategoryIcon } from '@/components/transport-category-icon';
import { JobCategoryIcon } from '@/components/job-category-icon';
import { absoluteUrl, getCategorySeo, getCategoryUrl } from '@/lib/seo';
import { LocalizedLink } from '@/components/localized-link';
import { getRequestLocale } from '@/lib/server-locale';
import { getDictionary } from '@/i18n/dictionaries';
import { getCategoryName } from '@/lib/category-i18n';
import type { SiteLocale } from '@/lib/locale-path';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const category = await getCategoryBySlug(slug);
    const seo = getCategorySeo(category);
    const canonical = getCategoryUrl(category.slug);

    return {
      title: seo.title,
      description: seo.description,
      alternates: { canonical },
      openGraph: {
        type: 'website',
        url: canonical,
        title: seo.title,
        description: seo.description,
        siteName: 'UzMarket',
        locale: 'ru_RU',
      },
      twitter: {
        card: 'summary_large_image',
        title: seo.title,
        description: seo.description,
      },
    };
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        title: 'Категория не найдена',
        robots: { index: false, follow: false },
      };
    }

    throw error;
  }
}

const categoryAccentClasses = [
  'category-accent-green',
  'category-accent-coral',
  'category-accent-blue',
  'category-accent-lime',
  'category-accent-orange',
];

const categoryImages: Record<string, string> = {
  'transport-passenger-cars': '/images/categories/transport/passenger-cars.webp',
  'transport-car-parts-accessories': '/images/categories/transport/car-parts.webp',
  'transport-tires-rims-wheels': '/images/categories/transport/tires-wheels.webp',
  'transport-motorcycles': '/images/categories/transport/motorcycles.webp',
  'transport-motorcycle-parts-accessories': '/images/categories/transport/motorcycle-parts.webp',
  'transport-personal-mobility': '/images/categories/transport/personal-mobility.webp',
  'transport-trucks': '/images/categories/transport/trucks.webp',
  'transport-buses': '/images/categories/transport/buses.webp',
  'transport-special-machinery': '/images/categories/transport/special-machinery.webp',
  'transport-agricultural-machinery': '/images/categories/transport/agricultural-machinery.webp',
  'transport-trailers': '/images/categories/transport/trailers.webp',
  'transport-heavy-machinery-parts': '/images/categories/transport/heavy-machinery-parts.webp',
  'transport-watercraft': '/images/categories/transport/watercraft.webp',
  'real-estate-apartments': '/images/categories/real-estate/apartments.webp',
  'real-estate-rooms-bed-spaces': '/images/categories/real-estate/rooms-bed-spaces.webp',
  'real-estate-houses-cottages': '/images/categories/real-estate/houses-cottages.webp',
  'real-estate-land-plots': '/images/categories/real-estate/land-plots.webp',
  'real-estate-commercial': '/images/categories/real-estate/commercial.webp',
  'real-estate-garages-parking': '/images/categories/real-estate/garages-parking.webp',
};

function formatPrice(listing: Listing, locale: SiteLocale): string {
  const value = Number(listing.price);

  if (!Number.isFinite(value)) {
    return `${listing.price} ${listing.currency}`;
  }

  return `${new Intl.NumberFormat(locale === 'uz' ? 'uz-UZ' : 'ru-RU', {
    maximumFractionDigits: 2,
  }).format(value)} ${listing.currency}`;
}

function CategoryStructuredData({
  category,
  parentCategory,
}: {
  category: Category;
  parentCategory: Category | null;
}) {
  const seo = getCategorySeo(category);
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Главная',
      item: absoluteUrl('/'),
    },
    ...(parentCategory
      ? [
          {
            '@type': 'ListItem',
            position: 2,
            name: parentCategory.name,
            item: getCategoryUrl(parentCategory.slug),
          },
        ]
      : []),
    {
      '@type': 'ListItem',
      position: parentCategory ? 3 : 2,
      name: category.name,
      item: getCategoryUrl(category.slug),
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems,
      },
      {
        '@type': 'CollectionPage',
        name: seo.title,
        description: seo.description,
        url: getCategoryUrl(category.slug),
        isPartOf: {
          '@type': 'WebSite',
          name: 'UzMarket',
          url: absoluteUrl('/'),
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }}
    />
  );
}

function CategoryHub({
  category,
  parentCategory,
  children,
  locale,
}: {
  category: Category;
  parentCategory: Category | null;
  children: Category[];
  locale: SiteLocale;
}) {
  const text = getDictionary(locale).categoryPage;
  const categoryName = getCategoryName(category, locale);

  return (
    <main className="transport-page">
      <CategoryStructuredData
        category={category}
        parentCategory={parentCategory}
      />
      <div className="transport-container">
        <nav className="transport-breadcrumbs" aria-label={text.breadcrumbs}>
          <LocalizedLink href="/">{text.home}</LocalizedLink>
          <span aria-hidden="true">→</span>
          <span>{categoryName}</span>
        </nav>

        <div className="transport-title-row">
          <div>
            <p className="transport-eyebrow">{text.eyebrow}</p>
            <h1>{categoryName}</h1>
            <p className="transport-subtitle">
              {category.slug === 'jobs'
                ? text.jobsSubtitle
                : text.subtitle}
            </p>
          </div>

          <span className="transport-category-count">
            {children.length} {text.categoriesCount}
          </span>
        </div>

        {category.slug === 'jobs' ? (
          <nav className="jobs-audience-cards" aria-label={text.jobsNavigation}>
            <LocalizedLink href="/rabota/vakansii">
              <span>
                <strong>{text.findJob}</strong>
                <small>{text.findJobHelp}</small>
              </span>
              <span aria-hidden="true">→</span>
            </LocalizedLink>
            <LocalizedLink href="/rabota/rezume">
              <span>
                <strong>{text.findEmployee}</strong>
                <small>{text.findEmployeeHelp}</small>
              </span>
              <span aria-hidden="true">→</span>
            </LocalizedLink>
          </nav>
        ) : null}

        <section
          id={category.slug === 'jobs' ? 'job-categories' : undefined}
          className="transport-category-grid"
          aria-label={text.sections}
        >
          {children.map((child, index) => (
            <Link
              key={child.id}
              href={`/category/${encodeURIComponent(child.slug)}`}
              className={`transport-category-card ${
                categoryAccentClasses[index % categoryAccentClasses.length]
              }`}
            >
              <span className="transport-category-image">
                <span className="transport-category-icon" aria-hidden="true">
                  {child.slug.startsWith('jobs-') ? (
                    <JobCategoryIcon slug={child.slug} />
                  ) : (
                    <TransportCategoryIcon slug={child.slug} />
                  )}
                </span>
                {categoryImages[child.slug] ? (
                  <Image
                    src={categoryImages[child.slug]}
                    alt={getCategoryName(child, locale)}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, (max-width: 1180px) 25vw, 20vw"
                  />
                ) : null}
              </span>

              <span className="transport-category-name">{getCategoryName(child, locale)}</span>
              <span className="transport-category-arrow" aria-hidden="true">→</span>
            </LocalizedLink>
          ))}
        </section>
      </div>
    </main>
  );
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  const text = getDictionary(locale).categoryPage;

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
  const parentCategory =
    categories.find((item) => item.id === category.parentId) ?? null;
  const childCategories = categories
    .filter((item) => item.parentId === category.id)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ru'));

  if (childCategories.length > 0) {
    return (
      <CategoryHub
        category={category}
        parentCategory={parentCategory}
        children={childCategories}
        locale={locale}
      />
    );
  }

  const listings = await getListings({
    categoryId: category.id,
    page: 1,
    limit: 20,
  });

  return (
    <main className="catalog-page">
      <CategoryStructuredData
        category={category}
        parentCategory={parentCategory}
      />
      <section className="catalog-container">
        <nav className="transport-breadcrumbs" aria-label="Хлебные крошки">
          <LocalizedLink href="/">Главная</LocalizedLink>
          <span aria-hidden="true">→</span>
          {parentCategory ? (
            <>
              <LocalizedLink href={`/category/${encodeURIComponent(parentCategory.slug)}`}>
                {getCategoryName(parentCategory, locale)}
              </LocalizedLink>
              <span aria-hidden="true">→</span>
            </>
          ) : null}
          <span>{categoryName}</span>
        </nav>
        <header className="catalog-header">
          <div>
            <p className="catalog-category-label">{text.category}</p>
            <h1>{categoryName}</h1>
          </div>

          <LocalizedLink href="/listings">{text.allListings}</LocalizedLink>
        </header>

        {listings.items.length === 0 ? (
          <div className="empty-state">
            <h2>{text.empty}</h2>
            <p>{text.emptyHelp}</p>
          </div>
        ) : (
          <div className="catalog-grid">
            {listings.items.map((listing) => {
              const image = listing.images[0];

              return (
                <Link
                  key={listing.id}
                  href={getListingPublicPath(listing)}
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
                      <span>{getDictionary(locale).common.noPhoto}</span>
                    )}
                  </div>

                  <div className="catalog-card-content">
                    <h2>{listing.title}</h2>
                    <p className="catalog-card-price">{formatPrice(listing, locale)}</p>
                    <p className="catalog-card-meta">
                      {listing.location ?? text.country}
                    </p>
                  </div>
                </LocalizedLink>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
