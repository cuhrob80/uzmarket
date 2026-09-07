import Link from 'next/link';
import { getCategories, getListings } from '@/lib/api/server';
import { getListingPublicPath } from '@/lib/listing-url';
import type { Listing, ListingJobType } from '@/types/listing';
import { MarketplaceHeader } from '@/components/marketplace-header';
import { JobCategoryIcon } from '@/components/job-category-icon';

interface JobsSearchPageProps {
  jobType: ListingJobType;
  categoryId?: string;
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

export async function JobsSearchPage({
  jobType,
  categoryId,
}: JobsSearchPageProps) {
  const categories = await getCategories();
  const jobsRoot = categories.find((category) => category.slug === 'jobs');
  const jobCategories = categories
    .filter((category) => category.parentId === jobsRoot?.id)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ru'));
  const selectedCategoryId = jobCategories.some(
    (category) => category.id === categoryId,
  )
    ? categoryId
    : undefined;
  const result = await getListings({
    jobType,
    categoryId: selectedCategoryId,
    page: 1,
    limit: 20,
  });
  const isVacancy = jobType === 'vacancy';
  const activePath = isVacancy ? '/rabota/vakansii' : '/rabota/rezume';

  return (
    <main className="jobs-search-page">
      <MarketplaceHeader />

      <div className="jobs-search-container">
        <nav className="transport-breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span aria-hidden="true">→</span>
          <Link href="/category/jobs">Работа</Link>
          <span aria-hidden="true">→</span>
          <span>{isVacancy ? 'Вакансии' : 'Резюме'}</span>
        </nav>

        <header className="jobs-search-heading">
          <p className="transport-eyebrow">Работа в Узбекистане</p>
          <h1>
            {isVacancy
              ? 'Найдите подходящую работу'
              : 'Найдите подходящего сотрудника'}
          </h1>
          <p>
            {isVacancy
              ? 'Выберите направление и посмотрите вакансии работодателей.'
              : 'Выберите направление и посмотрите резюме специалистов.'}
          </p>
        </header>

        <nav className="jobs-mode-tabs" aria-label="Вакансии и резюме">
          <Link
            href="/rabota/vakansii"
            aria-current={isVacancy ? 'page' : undefined}
          >
            Найти работу
          </Link>
          <Link
            href="/rabota/rezume"
            aria-current={!isVacancy ? 'page' : undefined}
          >
            Найти сотрудника
          </Link>
        </nav>

        <section className="jobs-direction-panel" aria-label="Направления работы">
          <h2>Выберите направление</h2>
          <div className="jobs-direction-grid">
            <Link
              href={activePath}
              className={!selectedCategoryId ? 'is-active' : undefined}
            >
              Все направления
            </Link>
            {jobCategories.map((category) => (
              <Link
                key={category.id}
                href={`${activePath}?categoryId=${encodeURIComponent(category.id)}`}
                className={
                  selectedCategoryId === category.id ? 'is-active' : undefined
                }
              >
                <JobCategoryIcon slug={category.slug} />
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="jobs-results">
          <div className="home-section-header">
            <h2>{isVacancy ? 'Вакансии' : 'Резюме'}</h2>
            <span>Найдено: {result.total}</span>
          </div>

          {result.items.length === 0 ? (
            <div className="empty-state">
              <h2>
                {isVacancy
                  ? 'Вакансий пока нет'
                  : 'Резюме пока нет'}
              </h2>
              <p>
                Новые объявления появятся здесь после публикации.
              </p>
            </div>
          ) : (
            <div className="catalog-grid">
              {result.items.map((listing) => {
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
      </div>
    </main>
  );
}
