import type { Metadata } from 'next';
import { JobsSearchPage } from '@/components/jobs-search-page';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Вакансии в Узбекистане — найти работу',
  description:
    'Актуальные вакансии по всему Узбекистану. Найдите работу по профессии и направлению на UzMarket.',
  alternates: { canonical: absoluteUrl('/rabota/vakansii') },
};

interface VacanciesPageProps {
  searchParams: Promise<{ categoryId?: string }>;
}

export default async function VacanciesPage({
  searchParams,
}: VacanciesPageProps) {
  const { categoryId } = await searchParams;

  return (
    <JobsSearchPage jobType="vacancy" categoryId={categoryId} />
  );
}
