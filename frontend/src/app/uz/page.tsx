import type { Metadata } from 'next';
import { LocalizedHome } from '@/components/localized-home';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'UzMarket — O‘zbekistondagi e’lonlar',
  description: 'Butun O‘zbekiston bo‘ylab mahsulotlar, transport, ko‘chmas mulk va xizmatlarni sotib oling va soting.',
  alternates: {
    canonical: '/uz/',
    languages: {
      ru: '/ru/',
      uz: '/uz/',
      'x-default': '/ru/',
    },
  },
};

export default function UzbekHomePage() {
  return <LocalizedHome locale="uz" />;
}
