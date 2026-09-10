import type { Category } from '@/types/listing';
import type { SiteLocale } from '@/lib/locale-path';
import { categoryNamesUz } from '@/i18n/dictionaries';

export type UiLocale = SiteLocale;

export function getCategoryName(
  category: Pick<Category, 'name'>,
  locale: UiLocale,
): string {
  if (locale === 'ru') return category.name;
  return categoryNamesUz[category.name.trim()] ?? category.name;
}
