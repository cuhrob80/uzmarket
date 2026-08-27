import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  ApiError,
  getCategories,
  getMyListing,
} from '@/lib/api/server';
import { EditListingForm } from './edit-listing-form';

export const dynamic = 'force-dynamic';

interface EditListingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditListingPage({
  params,
}: EditListingPageProps) {
  const { id } = await params;

  try {
    const [listing, categories] = await Promise.all([
      getMyListing(id),
      getCategories(),
    ]);

    if (!listing) {
      redirect('/login');
    }

    if (
      listing.status === 'sold' ||
      listing.status === 'archived'
    ) {
      redirect('/my-listings');
    }

    return (
      <main className="create-listing-page">
        <section className="create-listing-container">
          <div className="create-listing-header">
            <div>
              <p className="create-listing-eyebrow">
                Редактирование объявления
              </p>

              <h1>{listing.title}</h1>

              <p>
                Измените данные объявления и сохраните изменения.
              </p>
            </div>

            <Link href="/my-listings">
              Назад к объявлениям
            </Link>
          </div>

          <EditListingForm
            listing={listing}
            categories={categories}
          />
        </section>
      </main>
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        redirect('/login');
      }

      if (error.status === 404) {
        notFound();
      }
    }

    throw error;
  }
}
