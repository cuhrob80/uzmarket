import { notFound, redirect } from 'next/navigation';
import { ApiError, getListingByPublicId } from '@/lib/api/server';
import type { Listing } from '@/types/listing';
import { PublicListingView } from '@/components/public-listing-view';
import { getListingPublicPath } from '@/lib/listing-url';

export const dynamic = 'force-dynamic';

interface ListingSeoPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function getPublicIdFromSlug(slug: string): string | null {
  const match = slug.match(/-(\d+)$/);

  return match?.[1] ?? null;
}

export default async function ListingSeoPage({
  params,
}: ListingSeoPageProps) {
  const { slug } = await params;
  const publicId = getPublicIdFromSlug(slug);

  if (!publicId) {
    notFound();
  }

  let listing: Listing;

  try {
    listing = await getListingByPublicId(publicId);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const expectedPath = getListingPublicPath(listing);
  const expectedSlug = expectedPath.split("/").pop();

  if (slug !== expectedSlug) {
    redirect(expectedPath);
  }

  return <PublicListingView listing={listing} />;
}
