'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { localeFromPathname, withLocale } from '@/lib/locale-path';
import { getDictionary } from '@/i18n/dictionaries';

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
  { key: 'home', href: '/', icon: '⌂' },
  { key: 'listings', href: '/my-listings', icon: '▣' },
  { key: 'messages', href: '/messages', icon: '◯' },
  { key: 'reviews', href: '/profile/reviews', icon: '☆' },
  { key: 'profile', href: '/profile', icon: '⚙' },
] as const;

export function AccountShell({ active, children }: AccountShellProps) {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const text = getDictionary(locale).account;

  return (
    <div className="account-dashboard">
      <aside
        className="account-sidebar"
        aria-label={text.navigation}
      >
        {items.map((item) => (
          <Link
            key={item.key}
            href={withLocale(item.href, locale)}
            className={item.key === active ? 'is-active' : undefined}
            aria-current={item.key === active ? 'page' : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{text[item.key]}</span>
          </Link>
        ))}
      </aside>
      {children}
    </div>
  );
}
