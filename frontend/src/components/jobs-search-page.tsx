import { getCategories, getListings } from '@/lib/api/server';
import { getListingPublicPath } from '@/lib/listing-url';
import type { Listing, ListingJobType } from '@/types/listing';
import { JobCategoryIcon } from '@/components/job-category-icon';
import { LocalizedLink } from '@/components/localized-link';
import { getRequestLocale } from '@/lib/server-locale';
import { getDictionary } from '@/i18n/dictionaries';
import { getCategoryName } from '@/lib/category-i18n';
import type { SiteLocale } from '@/lib/locale-path';

interface JobsSearchPageProps {
  jobType: ListingJobType;
  categoryId?: string;
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

export async function JobsSearchPage({
  jobType,
  categoryId,
}: JobsSearchPageProps) {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const text = dictionary.jobsSearch;
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
      <div className="jobs-search-container">
        <nav className="transport-breadcrumbs" aria-label={text.breadcrumbs}>
          <LocalizedLink href="/">{text.home}</LocalizedLink>
          <span aria-hidden="true">→</span>
          <LocalizedLink href="/category/jobs">{text.work}</LocalizedLink>
          <span aria-hidden="true">→</span>
          <span>{isVacancy ? text.vacancies : text.resumes}</span>
        </nav>

        <header className="jobs-search-heading">
          <p className="transport-eyebrow">{text.eyebrow}</p>
          <h1>
            {isVacancy
              ? text.vacancyTitle
              : text.resumeTitle}
          </h1>
          <p>
            {isVacancy
              ? text.vacancySubtitle
              : text.resumeSubtitle}
          </p>
        </header>

        <nav className="jobs-mode-tabs" aria-label={text.tabs}>
          <LocalizedLink
            href="/rabota/vakansii"
            aria-current={isVacancy ? 'page' : undefined}
          >
            {text.findJob}
          </LocalizedLink>
          <LocalizedLink
            href="/rabota/rezume"
            aria-current={!isVacancy ? 'page' : undefined}
          >
            {text.findEmployee}
          </LocalizedLink>
        </nav>

        <div className="jobs-content-layout">
          <section
            className="jobs-direction-panel"
            aria-label={text.directions}
          >
            <h2>{text.chooseDirection}</h2>
            <div className="jobs-direction-grid">
              <LocalizedLink
                href={activePath}
                className={!selectedCategoryId ? 'is-active' : undefined}
              >
                <span className="jobs-all-directions-icon" aria-hidden="true">
                  ⠿
                </span>
                <span>{text.allDirections}</span>
                <span className="jobs-direction-arrow" aria-hidden="true">›</span>
              </LocalizedLink>
              {jobCategories.map((category) => (
                <LocalizedLink
                  key={category.id}
                  href={`${activePath}?categoryId=${encodeURIComponent(category.id)}`}
                  className={
                    selectedCategoryId === category.id ? 'is-active' : undefined
                  }
                >
                  <JobCategoryIcon slug={category.slug} />
                  <span>{getCategoryName(category, locale)}</span>
                  <span className="jobs-direction-arrow" aria-hidden="true">›</span>
                </LocalizedLink>
              ))}
            </div>
          </section>

          <section className="jobs-results">
            <div className="jobs-filters-preview" aria-label={text.futureFilters}>
              <div className="jobs-filters-note">
                <strong>{text.filtersLater}</strong>
                <span>
                  {text.filtersHelp}
                </span>
              </div>
              <div className="jobs-filter-placeholders" aria-hidden="true">
                <span>{text.location}</span>
                <span>{text.profession}</span>
                <span>{text.salary}</span>
                <span>{text.schedule}</span>
              </div>
            </div>

            <div className="jobs-results-header">
              <div>
                <h2>{isVacancy ? text.vacancies : text.resumes}</h2>
                <span>{result.total} {text.listings}</span>
              </div>
            </div>

            {result.items.length === 0 ? (
              <div className="jobs-empty-state">
                <div className="jobs-empty-icon" aria-hidden="true">⌕</div>
                <h2>
                  {isVacancy
                    ? text.noVacancies
                    : text.noResumes}
                </h2>
                <p>
                  {isVacancy
                    ? text.vacancyEmpty
                    : text.resumeEmpty}
                </p>
                <LocalizedLink href="/create-listing">
                  {isVacancy ? text.postVacancy : text.postResume}
                </LocalizedLink>
              </div>
            ) : (
              <div className="jobs-listing-grid">
                {result.items.map((listing) => {
                  const image = listing.images[0];

                  return (
                    <LocalizedLink
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
                          <span>{dictionary.common.noPhoto}</span>
                        )}
                      </div>
                      <div className="catalog-card-content">
                        <h2>{listing.title}</h2>
                        <p className="catalog-card-price">
                          {formatPrice(listing, locale)}
                        </p>
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
        </div>
      </div>
    </main>
  );
}
