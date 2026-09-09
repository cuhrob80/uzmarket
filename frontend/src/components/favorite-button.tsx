'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { usePathname } from 'next/navigation';
import { toggleFavoriteAction } from '@/app/favorites/actions';

interface FavoriteButtonProps {
  listingId: string;
  initialFavorite: boolean;
  isAuthenticated: boolean;
  className?: string;
}

export function FavoriteButton({
  listingId,
  initialFavorite,
  isAuthenticated,
  className = '',
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [showAuth, setShowAuth] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const toggle = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    const next = !isFavorite;
    setIsFavorite(next);
    startTransition(async () => {
      const result = await toggleFavoriteAction(listingId, next);

      if (result.requiresAuth) {
        setIsFavorite(!next);
        setShowAuth(true);
      } else if (result.error) {
        setIsFavorite(!next);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        className={
          `favorite-button ${isFavorite ? 'is-favorite' : ''} ${className}`
        }
        aria-label={
          isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'
        }
        aria-pressed={isFavorite}
        disabled={isPending}
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
        </svg>
      </button>

      {showAuth ? (
        <div className="favorite-auth-backdrop" role="presentation">
          <section
            className="favorite-auth-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="favorite-auth-title"
          >
            <button
              type="button"
              className="favorite-auth-close"
              aria-label="Закрыть"
              onClick={() => setShowAuth(false)}
            >
              ×
            </button>
            <h2 id="favorite-auth-title">Сохраните объявление</h2>
            <p>
              Войдите или зарегистрируйтесь, чтобы добавить объявление
              в избранное.
            </p>
            <Link href={`/login?returnTo=${encodeURIComponent(pathname)}`}>
              Войти
            </Link>
            <button type="button" onClick={() => setShowAuth(false)}>
              Отмена
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}
