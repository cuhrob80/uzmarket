import type { Category } from '@/types/listing';

export type UiLocale = 'ru' | 'uz';

const uzByName: Record<string, string> = {
  'Транспорт': 'Transport',
  'Недвижимость': 'Ko‘chmas mulk',
  'Работа': 'Ish',
  'Услуги': 'Xizmatlar',
  'Личные вещи': 'Shaxsiy buyumlar',
  'Для дома и дачи': 'Uy va dala hovli uchun',
  'Запчасти и аксессуары': 'Ehtiyot qismlar va aksessuarlar',
  'Электроника': 'Elektronika',
  'Хобби и отдых': 'Xobbi va dam olish',
  'Животные': 'Hayvonlar',
  'Бизнес и оборудование': 'Biznes va uskunalar',
  'Легковые автомобили': 'Yengil avtomobillar',
  'Автомобили': 'Avtomobillar',
  'Мотоциклы и мототехника': 'Mototsikllar va mototexnika',
  'Грузовики и спецтехника': 'Yuk mashinalari va maxsus texnika',
  'Водный транспорт': 'Suv transporti',
  'Прицепы и полуприцепы': 'Tirkamalar va yarim tirkamalar',
  'Автозапчасти и аксессуары': 'Avto ehtiyot qismlar va aksessuarlar',
  'Шины, диски и колёса': 'Shinalar, disklar va g‘ildiraklar',
  'Квартиры': 'Kvartiralar',
  'Комнаты и койко-места': 'Xonalar va yotoq joylari',
  'Дома, дачи, коттеджи': 'Uylar, dala hovlilar va kottejlar',
  'Земельные участки': 'Yer uchastkalari',
  'Коммерческая недвижимость': 'Tijorat ko‘chmas mulki',
  'Гаражи и машиноместа': 'Garajlar va avtomobil joylari',
  'Новостройки': 'Yangi qurilgan uylar',
  'Вторичное жильё': 'Ikkilamchi uy-joy',
  'Офисы': 'Ofislar',
  'Торговые помещения': 'Savdo binolari',
  'Склады': 'Omborlar',
  'Производственные помещения': 'Ishlab chiqarish binolari',
  'Вакансии': 'Bo‘sh ish o‘rinlari',
  'Резюме': 'Rezyumelar',
  'Продажи': 'Savdo',
  'Транспорт и логистика': 'Transport va logistika',
  'Строительство': 'Qurilish',
  'Образование': 'Ta’lim',
  'Красота и здоровье': 'Go‘zallik va salomatlik',
  'Ремонт и строительство': 'Ta’mirlash va qurilish',
  'Телефоны': 'Telefonlar',
  'Ноутбуки': 'Noutbuklar',
  'Компьютеры': 'Kompyuterlar',
  'Бытовая техника': 'Maishiy texnika',
  'Мебель и интерьер': 'Mebel va interyer',
  'Одежда, обувь, аксессуары': 'Kiyim, poyabzal va aksessuarlar',
};

export function getCategoryName(category: Pick<Category, 'name'>, locale: UiLocale): string {
  if (locale === 'ru') return category.name;
  return uzByName[category.name.trim()] ?? category.name;
}
