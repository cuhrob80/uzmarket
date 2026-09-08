import { redirect } from 'next/navigation';

interface ListingPhotosPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingPhotosPage({
  params,
}: ListingPhotosPageProps) {
  const { id } = await params;
  redirect(`/create-listing/${encodeURIComponent(id)}`);
}
