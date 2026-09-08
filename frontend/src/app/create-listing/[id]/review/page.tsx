import { redirect } from 'next/navigation';

interface ListingReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingReviewPage({
  params,
}: ListingReviewPageProps) {
  const { id } = await params;
  redirect(`/create-listing/${encodeURIComponent(id)}`);
}
