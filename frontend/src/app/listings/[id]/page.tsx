import { notFound, redirect } from 'next/navigation';
import { ApiError, getListing } from '@/lib/api/server';
import { getListingPublicPath } from '@/lib/listing-url';
import type { Listing } from '@/types/listing';

export const dynamic = 'force-dynamic';

interface ListingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ListingPage({
  params,
}: ListingPageProps) {
  const { id } = await params;

  let listing: Listing;

  try {
    listing = await getListing(id);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  redirect(getListingPublicPath(listing));
}
