import type { Metadata } from 'next';
import { JobsSearchPage } from '@/components/jobs-search-page';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Резюме в Узбекистане — найти сотрудника',
  description:
    'База резюме специалистов по всему Узбекистану. Найдите сотрудника по профессии и направлению на UzMarket.',
  alternates: { canonical: absoluteUrl('/rabota/rezume') },
};

interface ResumesPageProps {
  searchParams: Promise<{ categoryId?: string }>;
}

export default async function ResumesPage({
  searchParams,
}: ResumesPageProps) {
  const { categoryId } = await searchParams;

  return (
    <JobsSearchPage jobType="resume" categoryId={categoryId} />
  );
}
