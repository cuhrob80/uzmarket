import { notFound, redirect } from 'next/navigation';
import { ApiError, getCategories, getMyListing } from '@/lib/api/server';
import { EditListingForm } from '@/app/my-listings/[id]/edit/edit-listing-form';
import { DeletePhotoButton } from './photos/delete-photo-button';
import { DraggablePhotoCard } from './photos/draggable-photo-card';
import { PhotoUploadForm } from './photos/photo-upload-form';
import { RotatePhotoButton } from './photos/rotate-photo-button';

export const dynamic = 'force-dynamic';

interface UnifiedListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function UnifiedListingPage({
  params,
}: UnifiedListingPageProps) {
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

  const categories = await getCategories();
  const images = [...listing.images].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const imageIds = images.map((image) => image.id);
  const isJobListing =
    listing.jobType === 'vacancy' || listing.jobType === 'resume';
  const canPublish = images.length > 0 || isJobListing;
  const listingFormId = 'unified-listing-form';

  return (
    <main className="listing-photos-page">
      <section className="listing-photos-container unified-listing-container">
        <header className="listing-photos-header">
          <p className="listing-editor-back" aria-hidden="true">←</p>
          <div>
            <h1>
              {listing.status === 'draft'
                ? 'Новое объявление'
                : 'Редактирование объявления'}
            </h1>
            <p>
              {listing.category.name} › {listing.title}
            </p>
          </div>
        </header>

        <div className="unified-listing-section">
          <div className="unified-listing-section-heading">
            <div>
              <p className="listing-photos-step">1. Основная информация</p>
              <h2>Данные объявления</h2>
            </div>
          </div>

          <EditListingForm
            listing={listing}
            categories={categories}
            formId={listingFormId}
            publishAfterSave={listing.status === 'draft'}
          />
        </div>

        <div className="unified-listing-section">
          <div className="unified-listing-section-heading">
            <div>
              <p className="listing-photos-step">2. Внешний вид</p>
              <h2>Фотографии</h2>
            </div>
            <strong>{images.length} из 10</strong>
          </div>

          <p className="unified-listing-help">
            {isJobListing
              ? 'Фотографии необязательны. Можно показать рабочее место, логотип или примеры работ.'
              : 'Первое фото будет обложкой объявления.'}
          </p>

          <div className="listing-photo-grid" aria-label="Фотографии объявления">
            {images.map((image, index) => (
              <DraggablePhotoCard
                key={image.id}
                listingId={listing.id}
                imageIds={imageIds}
                imageId={image.id}
              >
                <div className="listing-photo-preview">
                  <RotatePhotoButton
                    listingId={listing.id}
                    imageId={image.id}
                  />
                  <img
                    src={image.url}
                    alt={`Фотография ${index + 1}`}
                    width={320}
                    height={240}
                  />
                  <DeletePhotoButton
                    listingId={listing.id}
                    imageId={image.id}
                  />
                  <span
                    className="photo-drag-handle saved-photo-drag-handle"
                    aria-hidden="true"
                  >
                    ⠿
                  </span>
                </div>
                {index === 0 ? (
                  <span className="photo-cover-label">Основное фото</span>
                ) : null}
              </DraggablePhotoCard>
            ))}

            {images.length < 10 ? (
              <PhotoUploadForm
                key={images.length}
                listingId={listing.id}
                imageCount={images.length}
              />
            ) : null}
          </div>

          {images.length === 0 ? (
            <p className="unified-listing-help">
              {isJobListing
                ? 'Фотография необязательна — можно сразу публиковать.'
                : 'Добавьте хотя бы одну фотографию.'}
            </p>
          ) : null}
        </div>

        <div className="unified-listing-section unified-listing-publish">
          <p className="listing-photos-step">3. Публикация</p>
          <h2>Всё готово?</h2>
          <p>
            После публикации объявление станет доступно посетителям UzMarket.
          </p>

          {listing.status === 'draft' && !canPublish ? (
            <p className="form-error">
              Для обычного объявления добавьте хотя бы одну фотографию.
            </p>
          ) : null}

          <button
            type="submit"
            form={listingFormId}
            disabled={listing.status === 'draft' && !canPublish}
          >
            {listing.status === 'draft'
              ? 'Разместить объявление'
              : 'Сохранить изменения'}
          </button>
        </div>
      </section>
    </main>
  );
}
