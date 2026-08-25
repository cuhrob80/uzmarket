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
    <main className="create-listing-page">
      <section className="create-listing-container">
        <header className="create-listing-header">
          <h1>Подать объявление</h1>
          <p>
            Заполните основные данные. Фотографии добавим на
            следующем шаге.
          </p>
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
