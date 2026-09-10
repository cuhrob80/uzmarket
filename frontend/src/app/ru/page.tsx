import type { Metadata } from 'next';
import { LocalizedHome } from '@/components/localized-home';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'UzMarket — объявления в Узбекистане',
  description: 'Покупайте и продавайте товары, транспорт, недвижимость и услуги по всему Узбекистану.',
  alternates: {
    canonical: '/ru/',
    languages: {
      ru: '/ru/',
      uz: '/uz/',
      'x-default': '/ru/',
    },
  },
};

export default function RussianHomePage() {
  return <LocalizedHome locale="ru" />;
}
