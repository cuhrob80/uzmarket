export type SiteLocale = 'ru' | 'uz';

export function localeFromPathname(pathname: string): SiteLocale {
  return pathname === '/uz' || pathname.startsWith('/uz/') ? 'uz' : 'ru';
}

export function withLocale(pathname: string, locale: SiteLocale): string {
  if (!pathname.startsWith('/')) return pathname;
  if (pathname === '/') return `/${locale}`;
  if (/^\/(ru|uz)(\/|$)/.test(pathname)) {
    return pathname.replace(/^\/(ru|uz)(?=\/|$)/, `/${locale}`);
  }
  return `/${locale}${pathname}`;
}
