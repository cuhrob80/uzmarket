'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { localeFromPathname } from '@/lib/locale-path';
import { getDictionary } from '@/i18n/dictionaries';
import { logoutAction } from '@/app/profile/actions';
import type { AuthUser } from '@/types/listing';
import { LocalizedLink } from './localized-link';

export function ProfileMenu({ user }: { user: AuthUser }) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const locale = localeFromPathname(usePathname());
  const text = getDictionary(locale).profileMenu;
  const initials =
    user.displayName.trim().slice(0, 2).toUpperCase() || 'UZ';

  useEffect(() => {
    function closeMenu() {
      menuRef.current?.removeAttribute('open');
    }

    function handlePointerDown(event: PointerEvent) {
      const menu = menuRef.current;

      if (menu?.open && !menu.contains(event.target as Node)) {
        closeMenu();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeMenu();
        menuRef.current
          ?.querySelector<HTMLElement>('summary')
          ?.focus();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function closeMenu() {
    menuRef.current?.removeAttribute('open');
  }

  return (
    <details ref={menuRef} className="marketplace-profile-menu">
      <summary
        className="marketplace-avatar"
        aria-label={text.open}
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" />
        ) : (
          <span>{initials}</span>
        )}
      </summary>
      <nav aria-label={text.navigation} onClick={closeMenu}>
        <LocalizedLink href="/profile">{text.account}</LocalizedLink>
        <LocalizedLink href="/my-listings">{text.listings}</LocalizedLink>
        <LocalizedLink href="/profile/reviews">{text.reviews}</LocalizedLink>
        <LocalizedLink href="/profile">{text.settings}</LocalizedLink>
        <form action={logoutAction}>
          <button type="submit">{text.logout}</button>
        </form>
      </nav>
    </details>
  );
}
