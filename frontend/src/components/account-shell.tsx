import Link from 'next/link';
import type { ReactNode } from 'react';

export type AccountSection =
  | 'listings'
  | 'messages'
  | 'reviews'
  | 'profile';

interface AccountShellProps {
  active: AccountSection;
  children: ReactNode;
}

const items: Array<{
  key: AccountSection | 'home';
  href: string;
  icon: string;
  label: string;
}> = [
  { key: 'home', href: '/', icon: '⌂', label: 'Главное' },
  {
    key: 'listings',
    href: '/my-listings',
    icon: '▣',
    label: 'Мои объявления',
  },
  {
    key: 'messages',
    href: '/messages',
    icon: '◯',
    label: 'Сообщения',
  },
  {
    key: 'reviews',
    href: '/profile/reviews',
    icon: '☆',
    label: 'Отзывы и рейтинг',
  },
  {
    key: 'profile',
    href: '/profile',
    icon: '⚙',
    label: 'Профиль и настройки',
  },
];

export function AccountShell({ active, children }: AccountShellProps) {
  return (
    <div className="account-dashboard">
      <aside className="account-sidebar" aria-label="Личный кабинет">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={item.key === active ? 'is-active' : undefined}
            aria-current={item.key === active ? 'page' : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </aside>
      {children}
    </div>
  );
}
