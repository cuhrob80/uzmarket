import { notFound, redirect } from 'next/navigation';
import { ApiError, getMyListing } from '@/lib/api/server';
import { DeletePhotoButton } from './delete-photo-button';
import { PhotoOrderControls } from './photo-order-controls';
import { PhotoUploadForm } from './photo-upload-form';

export const dynamic = 'force-dynamic';

interface ListingPhotosPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ListingPhotosPage({
  params,
}: ListingPhotosPageProps) {
  const { id } = await params;

  let listing;

  try {
    listing = await getMyListing(id);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  if (!listing) {
    redirect('/login');
  }

  const images = [...listing.images].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  const imageIds = images.map((image) => image.id);

  return (
    <main className="listing-photos-page">
      <section className="listing-photos-container">
        <header className="listing-photos-header">
          <p className="listing-photos-step">Шаг 2</p>
          <h1>Добавьте фотографии</h1>
          <p>{listing.title}</p>
        </header>

        <div className="listing-photos-info">
          <strong>
            {images.length} из 10
          </strong>
          <span>
            Первое фото будет обложкой объявления.
          </span>
        </div>

        <PhotoUploadForm
          listingId={listing.id}
          imageCount={images.length}
        />

        {images.length > 0 ? (
          <div
            className="listing-photo-grid"
            aria-label="Фотографии объявления"
          >
            {images.map((image, index) => (
              <article
                className="listing-photo-card"
                key={image.id}
              >
                <div className="listing-photo-preview">
                  <img
                    src={image.url}
                    alt={`Фотография ${index + 1}`}
                    width={320}
                    height={240}
                  />

                  {index === 0 ? (
                    <span className="listing-cover-badge">
                      Обложка
                    </span>
                  ) : null}
                </div>

                <div className="listing-photo-actions">
                  <PhotoOrderControls
                    listingId={listing.id}
                    imageIds={imageIds}
                    index={index}
                  />

                  <DeletePhotoButton
                    listingId={listing.id}
                    imageId={image.id}
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>Фотографий пока нет</h2>
            <p>
              Добавьте хотя бы одну фотографию товара.
            </p>
          </div>
        )}

        <div className="listing-photos-footer">
          <a href="/my-listings">
            Сохранить и продолжить позже
          </a>

          {images.length > 0 ? (
            <a
              href={`/create-listing/${encodeURIComponent(
                listing.id,
              )}/review`}
            >
              Продолжить
            </a>
          ) : null}
        </div>
      </section>
    </main>
  );
}
