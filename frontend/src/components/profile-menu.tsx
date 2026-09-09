'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { logoutAction } from '@/app/profile/actions';
import type { AuthUser } from '@/types/listing';

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
        <Link href="/profile">Личный кабинет</Link>
        <Link href="/my-listings">Мои объявления</Link>
        <Link href="/profile/reviews">Отзывы и рейтинг</Link>
        <Link href="/profile">Настройки профиля</Link>
        <form action={logoutAction}>
          <button type="submit">Выйти</button>
        </form>
      </nav>
    </details>
  );
}
