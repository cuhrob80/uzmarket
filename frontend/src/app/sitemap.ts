import type { MetadataRoute } from 'next';
import { getCategories } from '@/lib/api/server';
import { absoluteUrl, getCategoryUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategories();
  const now = new Date();

  return [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl('/listings'),
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/rabota/vakansii'),
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/rabota/rezume'),
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    ...categories.map((category) => ({
      url: getCategoryUrl(category.slug),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: category.parentId === null ? 0.9 : 0.8,
    })),
  ];
}
