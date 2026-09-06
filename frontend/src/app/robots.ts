import type { MetadataRoute } from 'next';
import { absoluteUrl, siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/create-listing',
        '/login',
        '/my-listings',
        '/api/',
      ],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteUrl.origin,
  };
}
