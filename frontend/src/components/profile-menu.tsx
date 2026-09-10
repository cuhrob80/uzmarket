'use client';

import { useEffect, useRef } from 'react';
import { logoutAction } from '@/app/profile/actions';
import type { AuthUser } from '@/types/listing';
import { LocalizedLink } from './localized-link';

export function ProfileMenu({ user }: { user: AuthUser }) {
  const menuRef = useRef<HTMLDetailsElement>(null);
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
        aria-label="Открыть личный кабинет"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" />
        ) : (
          <span>{initials}</span>
        )}
      </summary>
      <nav aria-label="Личный кабинет" onClick={closeMenu}>
        <LocalizedLink href="/profile">Личный кабинет</LocalizedLink>
        <LocalizedLink href="/my-listings">Мои объявления</LocalizedLink>
        <LocalizedLink href="/profile/reviews">Отзывы и рейтинг</LocalizedLink>
        <LocalizedLink href="/profile">Настройки профиля</LocalizedLink>
        <form action={logoutAction}>
          <button type="submit">Выйти</button>
        </form>
      </nav>
    </details>
  );
}
