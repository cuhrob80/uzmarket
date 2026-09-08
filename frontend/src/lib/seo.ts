import type { Category } from '@/types/listing';

const fallbackSiteUrl = 'http://localhost:3000';

export const siteUrl = new URL(process.env.SITE_URL ?? fallbackSiteUrl);

interface CategorySeo {
  title: string;
  description: string;
}

const categorySeo: Record<string, CategorySeo> = {
  'jobs': {
    title: 'Работа в Узбекистане — вакансии и резюме',
    description:
      'Вакансии и резюме по всему Узбекистану. Находите работу и сотрудников в торговле, строительстве, логистике, IT, медицине и других сферах на UzMarket.',
  },
  'real-estate': {
    title: 'Недвижимость в Узбекистане',
    description:
      'Объявления о продаже и аренде недвижимости по всему Узбекистану: квартиры, дома, участки, коммерческие помещения, гаражи и машиноместа.',
  },
  'real-estate-apartments': {
    title: 'Квартиры в Узбекистане',
    description:
      'Объявления о продаже и аренде квартир в Узбекистане. Сравнивайте предложения собственников и агентств на UzMarket.',
  },
  'real-estate-rooms-bed-spaces': {
    title: 'Комнаты и койко-места в Узбекистане',
    description:
      'Комнаты и койко-места для продажи и аренды в Узбекистане. Актуальные предложения на UzMarket.',
  },
  'real-estate-houses-cottages': {
    title: 'Дома, дачи и коттеджи в Узбекистане',
    description:
      'Продажа и аренда домов, дач и коттеджей по всему Узбекистану. Находите подходящие предложения на UzMarket.',
  },
  'real-estate-land-plots': {
    title: 'Земельные участки в Узбекистане',
    description:
      'Объявления о земельных участках в Узбекистане для строительства, сада, сельского хозяйства и коммерческих целей.',
  },
  'real-estate-commercial': {
    title: 'Коммерческая недвижимость в Узбекистане',
    description:
      'Офисы, магазины, склады, производственные помещения и здания для продажи и аренды в Узбекистане.',
  },
  'real-estate-garages-parking': {
    title: 'Гаражи и машиноместа в Узбекистане',
    description:
      'Продажа и аренда гаражей, боксов и машиномест в Узбекистане. Объявления на UzMarket.',
  },
  'real-estate-commercial-offices': {
    title: 'Офисы в Узбекистане',
    description:
      'Офисы для продажи и аренды в Узбекистане. Сравнивайте актуальные предложения коммерческой недвижимости.',
  },
  'real-estate-commercial-retail-premises': {
    title: 'Торговые помещения в Узбекистане',
    description:
      'Магазины и торговые помещения для продажи и аренды по всему Узбекистану на UzMarket.',
  },
  'real-estate-commercial-warehouses': {
    title: 'Склады в Узбекистане',
    description:
      'Складские помещения и комплексы для продажи и аренды в Узбекистане. Актуальные объявления на UzMarket.',
  },
  'real-estate-commercial-industrial-premises': {
    title: 'Производственные помещения в Узбекистане',
    description:
      'Производственные помещения и объекты для продажи и аренды в Узбекистане на UzMarket.',
  },
  'real-estate-commercial-food-service-premises': {
    title: 'Помещения общественного питания в Узбекистане',
    description:
      'Помещения для кафе, ресторанов и других заведений общественного питания в Узбекистане.',
  },
  'real-estate-commercial-multipurpose-premises': {
    title: 'Помещения свободного назначения в Узбекистане',
    description:
      'Универсальные коммерческие помещения свободного назначения для продажи и аренды в Узбекистане.',
  },
  'real-estate-commercial-buildings-complexes': {
    title: 'Коммерческие здания и комплексы в Узбекистане',
    description:
      'Отдельные здания и коммерческие комплексы для продажи и аренды по всему Узбекистану.',
  },
  'real-estate-commercial-other': {
    title: 'Другая коммерческая недвижимость в Узбекистане',
    description:
      'Другие виды коммерческой недвижимости для продажи и аренды в Узбекистане на UzMarket.',
  },
};

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}

export function getCategoryUrl(slug: string): string {
  return absoluteUrl(`/category/${encodeURIComponent(slug)}`);
}

export function getCategorySeo(category: Category): CategorySeo {
  return (
    categorySeo[category.slug] ?? {
      title: `${category.name} в Узбекистане`,
      description: `Актуальные объявления в категории «${category.name}» по всему Узбекистану на UzMarket.`,
    }
  );
}
