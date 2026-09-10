import { redirect } from 'next/navigation';
import {
  ApiError,
  getAccessToken,
  getCategories,
} from '@/lib/api/server';
import { CreateListingForm } from './create-listing-form';
import { getRequestLocale } from '@/lib/server-locale';
import { getDictionary } from '@/i18n/dictionaries';
import { LocalizedLink } from '@/components/localized-link';

export const dynamic = 'force-dynamic';

export default async function CreateListingPage() {
  const [accessToken, locale] = await Promise.all([getAccessToken(), getRequestLocale()]);
  const text = getDictionary(locale).listingEditor;

  if (!accessToken) {
    redirect(`/${locale}/login`);
  }

  let categories;

  try {
    categories = await getCategories();
  } catch (error: unknown) {
    console.error('Failed to load categories:', error);

    if (error instanceof ApiError && error.status === 401) {
      redirect(`/${locale}/login`);
    }

    throw error;
  }

  return (
    <main className="listing-photos-page">
      <section className="listing-photos-container unified-listing-container">
        <header className="listing-photos-header">
          <LocalizedLink href="/my-listings" className="listing-editor-back" aria-label={text.back} title={text.back}>←</LocalizedLink>
          <div>
            <h1>{text.newTitle}</h1>
            <p>
              {text.intro}
            </p>
          </div>
        </header>

        {categories.length > 0 ? (
          <CreateListingForm categories={categories} locale={locale} />
        ) : (
          <div className="empty-state">
            <h2>{text.unavailable}</h2>
            <p>{text.unavailableHelp}</p>
          </div>
        )}
      </section>
    </main>
  );
}
