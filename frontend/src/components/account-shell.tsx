'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { localeFromPathname, withLocale } from '@/lib/locale-path';

export type AccountSection =
  | 'listings'
  | 'messages'
  | 'reviews'
  | 'profile';

interface AccountShellProps {
  active: AccountSection;
  children: ReactNode;
}

const items = [
  { key: 'home', href: '/', icon: '⌂', ru: 'Главное', uz: 'Bosh sahifa' },
  { key: 'listings', href: '/my-listings', icon: '▣', ru: 'Мои объявления', uz: 'Mening e’lonlarim' },
  { key: 'messages', href: '/messages', icon: '◯', ru: 'Сообщения', uz: 'Xabarlar' },
  { key: 'reviews', href: '/profile/reviews', icon: '☆', ru: 'Отзывы и рейтинг', uz: 'Sharhlar va reyting' },
  { key: 'profile', href: '/profile', icon: '⚙', ru: 'Профиль и настройки', uz: 'Profil va sozlamalar' },
] as const;

export function AccountShell({ active, children }: AccountShellProps) {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);

  return (
    <div className="account-dashboard">
      <aside
        className="account-sidebar"
        aria-label={locale === 'uz' ? 'Shaxsiy kabinet' : 'Личный кабинет'}
      >
        {items.map((item) => (
          <Link
            key={item.key}
            href={withLocale(item.href, locale)}
            className={item.key === active ? 'is-active' : undefined}
            aria-current={item.key === active ? 'page' : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item[locale]}</span>
          </Link>
        ))}
      </aside>
      {children}
    </div>
  );
}
