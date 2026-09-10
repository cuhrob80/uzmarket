'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { localeFromPathname } from '@/lib/locale-path';
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
  const locale = localeFromPathname(usePathname());
  const text = locale === 'uz'
    ? { confirm: 'E’lon butunlay o‘chirilsinmi? Bu amalni bekor qilib bo‘lmaydi.', other: 'Boshqa amallar', cancelReview: 'Tekshiruvni bekor qilish', unpublish: 'Nashrdan olish', sold: 'Sotildi / yakunlash', archive: 'Arxivga ko‘chirish', restore: 'Tiklash', permanentDelete: 'Butunlay o‘chirish', remove: 'O‘chirish', pending: 'Bajarilmoqda…' }
    : { confirm: 'Удалить объявление навсегда? Это действие нельзя отменить.', other: 'Другие действия', cancelReview: 'Отменить проверку', unpublish: 'Снять с публикации', sold: 'Продать / завершить', archive: 'Переместить в архив', restore: 'Восстановить', permanentDelete: 'Удалить навсегда', remove: 'Удалить', pending: 'Выполняется…' };

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
      !window.confirm(text.confirm)
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
        aria-label={text.other}
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
                  {text.cancelReview}
                </button>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  disabled={isPending}
                  onClick={() => runAction('unpublish')}
                >
                  {text.unpublish}
                </button>
              )}
              {status === 'active' ? (
                <button
                  type="button"
                  role="menuitem"
                  disabled={isPending}
                  onClick={() => runAction('sold')}
                >
                  {text.sold}
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
              {text.archive}
            </button>
          ) : null}

          {status === 'archived' || status === 'deleted' ? (
            <button
              type="button"
              role="menuitem"
              disabled={isPending}
              onClick={() => runAction('restore')}
            >
              {text.restore}
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
              {text.permanentDelete}
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              className="is-danger"
              disabled={isPending}
              onClick={() => runAction('delete')}
            >
              {text.remove}
            </button>
          )}

          {isPending ? (
            <span className="listing-actions-progress">{text.pending}</span>
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
