import { redirect } from 'next/navigation';

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({
  params,
}: EditListingPageProps) {
  const { id } = await params;

  redirect(`/create-listing/${encodeURIComponent(id)}`);
}
