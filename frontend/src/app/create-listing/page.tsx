import { redirect } from 'next/navigation';
import {
  ApiError,
  getAccessToken,
  getCategories,
} from '@/lib/api/server';
import { CreateListingForm } from './create-listing-form';

export const dynamic = 'force-dynamic';

export default async function CreateListingPage() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    redirect('/login');
  }

  let categories;

  try {
    categories = await getCategories();
  } catch (error: unknown) {
    console.error('Failed to load categories:', error);

    if (error instanceof ApiError && error.status === 401) {
      redirect('/login');
    }

    throw error;
  }

  return (
    <main className="listing-photos-page">
      <section className="listing-photos-container unified-listing-container">
        <header className="listing-photos-header">
          <p className="listing-editor-back" aria-hidden="true">←</p>
          <div>
            <h1>Новое объявление</h1>
            <p>
              Заполните данные, добавьте фотографии и разместите объявление.
            </p>
          </div>
        </header>

        {categories.length > 0 ? (
          <CreateListingForm categories={categories} />
        ) : (
          <div className="empty-state">
            <h2>Категории пока недоступны</h2>
            <p>Создать объявление сейчас нельзя.</p>
          </div>
        )}
      </section>
    </main>
  );
}
