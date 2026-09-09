'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  manageListingAction,
  type ListingMenuOperation,
} from './actions';
import type { ListingStatus } from '@/types/listing';

interface ListingActionsMenuProps {
  listingId: string;
  status: ListingStatus;
}

export function ListingActionsMenu({
  listingId,
  status,
}: ListingActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const runAction = (
    operation: ListingMenuOperation,
    needsConfirmation = false,
  ) => {
    if (
      needsConfirmation &&
      !window.confirm(
        'Удалить объявление навсегда? Это действие нельзя отменить.',
      )
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await manageListingAction(listingId, operation);

      if (result.error) {
        setError(result.error);
        return;
      }

      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="listing-actions-menu" ref={containerRef}>
      <button
        type="button"
        className="listing-actions-trigger"
        aria-label="Другие действия"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          setError(null);
          setIsOpen((value) => !value);
        }}
      >
        •••
      </button>

      {isOpen ? (
        <div className="listing-actions-popover" role="menu">
          {status === 'active' || status === 'pending' ? (
            <>
              {status === 'pending' ? (
                <button
                  type="button"
                  role="menuitem"
                  disabled={isPending}
                  onClick={() => runAction('unpublish')}
                >
                  Отменить проверку
                </button>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  disabled={isPending}
                  onClick={() => runAction('unpublish')}
                >
                  Снять с публикации
                </button>
              )}
              {status === 'active' ? (
                <button
                  type="button"
                  role="menuitem"
                  disabled={isPending}
                  onClick={() => runAction('sold')}
                >
                  Продать / завершить
                </button>
              ) : null}
            </>
          ) : null}

          {status === 'active' ||
          status === 'draft' ||
          status === 'rejected' ? (
            <button
              type="button"
              role="menuitem"
              disabled={isPending}
              onClick={() => runAction('archive')}
            >
              Переместить в архив
            </button>
          ) : null}

          {status === 'archived' || status === 'deleted' ? (
            <button
              type="button"
              role="menuitem"
              disabled={isPending}
              onClick={() => runAction('restore')}
            >
              Восстановить
            </button>
          ) : null}

          {status === 'deleted' ? (
            <button
              type="button"
              role="menuitem"
              className="is-danger"
              disabled={isPending}
              onClick={() => runAction('permanentDelete', true)}
            >
              Удалить навсегда
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              className="is-danger"
              disabled={isPending}
              onClick={() => runAction('delete')}
            >
              Удалить
            </button>
          )}

          {isPending ? (
            <span className="listing-actions-progress">Выполняется…</span>
          ) : null}
          {error ? (
            <span className="listing-actions-error" role="alert">
              {error}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
