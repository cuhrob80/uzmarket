import type { MetadataRoute } from 'next';
import { absoluteUrl, siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const hasPublicSiteUrl =
    Boolean(process.env.SITE_URL) &&
    siteUrl.hostname !== 'localhost' &&
    siteUrl.hostname !== '127.0.0.1';

  if (!hasPublicSiteUrl) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

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
