import { notFound, redirect } from 'next/navigation';
import { ApiError, getCategories, getMyListing } from '@/lib/api/server';
import { EditListingForm } from '@/app/my-listings/[id]/edit/edit-listing-form';
import { DeletePhotoButton } from './photos/delete-photo-button';
import { DraggablePhotoCard } from './photos/draggable-photo-card';
import { PhotoUploadForm } from './photos/photo-upload-form';
import { RotatePhotoButton } from './photos/rotate-photo-button';
import { getRequestLocale } from '@/lib/server-locale';
import { getDictionary } from '@/i18n/dictionaries';
import { getCategoryName } from '@/lib/category-i18n';

export const dynamic = 'force-dynamic';

interface UnifiedListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function UnifiedListingPage({
  params,
}: UnifiedListingPageProps) {
  const [{ id }, locale] = await Promise.all([params, getRequestLocale()]);
  const dictionary = getDictionary(locale);
  const text = dictionary.listingEditor;
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
    redirect(`/${locale}/login`);
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
                ? text.newTitle
                : text.editTitle}
            </h1>
            <p>
              {getCategoryName(listing.category, locale)} › {listing.title}
            </p>
          </div>
        </header>

        <div className="unified-listing-section">
          <div className="unified-listing-section-heading">
            <div>
              <p className="listing-photos-step">{text.mainStep}</p>
              <h2>{text.details}</h2>
            </div>
          </div>

          <EditListingForm
            listing={listing}
            categories={categories}
            formId={listingFormId}
            publishAfterSave={listing.status === 'draft'}
            locale={locale}
          />
        </div>

        <div className="unified-listing-section">
          <div className="unified-listing-section-heading">
            <div>
              <p className="listing-photos-step">{text.appearanceStep}</p>
              <h2>{text.photos}</h2>
            </div>
            <strong>{images.length} {text.ofTen}</strong>
          </div>

          <p className="unified-listing-help">
            {isJobListing
              ? text.jobPhotoHelp
              : text.coverHelp}
          </p>

          <div className="listing-photo-grid" aria-label={text.photosLabel}>
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
                    alt={`${text.photoAlt} ${index + 1}`}
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
                  <span className="photo-cover-label">{text.cover}</span>
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
                ? text.jobEmptyHelp
                : text.emptyHelp}
            </p>
          ) : null}
        </div>

        <div className="unified-listing-section unified-listing-publish">
          <p className="listing-photos-step">{text.publishStep}</p>
          <h2>{text.ready}</h2>
          <p>
            {text.publishHelp}
          </p>

          {listing.status === 'draft' && !canPublish ? (
            <p className="form-error">
              {text.photoRequired}
            </p>
          ) : null}

          <button
            type="submit"
            form={listingFormId}
            disabled={listing.status === 'draft' && !canPublish}
          >
            {listing.status === 'draft'
              ? text.publish
              : dictionary.common.save}
          </button>
        </div>
      </section>
    </main>
  );
}
