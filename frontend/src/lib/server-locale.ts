import { headers } from 'next/headers';
import type { SiteLocale } from './locale-path';

export async function getRequestLocale(): Promise<SiteLocale> {
  const value = (await headers()).get('x-ui-locale');
  return value === 'uz' ? 'uz' : 'ru';
}
