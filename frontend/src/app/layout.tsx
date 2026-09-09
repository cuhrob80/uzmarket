import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { MarketplaceHeader } from '@/components/marketplace-header';
import { siteUrl } from '@/lib/seo';
import { MarketplaceHeader } from '@/components/marketplace-header';
import './styles.css';

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: 'UzMarket — объявления в Узбекистане',
    template: '%s | UzMarket',
  },
  description:
    'Покупайте и продавайте товары, транспорт и недвижимость по всему Узбекистану на UzMarket.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'UzMarket',
    locale: 'ru_RU',
    url: '/',
    title: 'UzMarket — объявления в Узбекистане',
    description:
      'Покупайте и продавайте товары, транспорт и недвижимость по всему Узбекистану на UzMarket.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <MarketplaceHeader />
        {children}
      </body>
    </html>
  );
}
