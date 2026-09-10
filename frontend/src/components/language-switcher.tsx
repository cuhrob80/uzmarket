'use client';

import { usePathname } from 'next/navigation';
import styles from './language-switcher.module.css';

function localeHref(pathname: string, locale: 'ru' | 'uz'): string {
  if (pathname === '/ru' || pathname.startsWith('/ru/')) {
    return pathname.replace(/^\/ru(?=\/|$)/, `/${locale}`);
  }
  if (pathname === '/uz' || pathname.startsWith('/uz/')) {
    return pathname.replace(/^\/uz(?=\/|$)/, `/${locale}`);
  }
  return `/${locale}/`;
}

export function LanguageSwitcher() {
  const pathname = usePathname();
  const active = pathname === '/uz' || pathname.startsWith('/uz/') ? 'uz' : 'ru';

  return (
    <nav className={styles.switcher} aria-label="Выбор языка">
      <a
        href={localeHref(pathname, 'ru')}
        lang="ru"
        hrefLang="ru"
        className={active === 'ru' ? styles.active : undefined}
        aria-current={active === 'ru' ? 'page' : undefined}
      >
        RU
      </a>
      <a
        href={localeHref(pathname, 'uz')}
        lang="uz"
        hrefLang="uz"
        className={active === 'uz' ? styles.active : undefined}
        aria-current={active === 'uz' ? 'page' : undefined}
      >
        UZ
      </a>
    </nav>
  );
}
