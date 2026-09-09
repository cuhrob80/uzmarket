'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import type { Category } from '@/types/listing';

export function CategoriesMenu({
  categories,
}: {
  categories: Category[];
}) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const activeCategories = useMemo(
    () =>
      categories
        .filter((category) => category.isActive)
        .sort(
          (left, right) =>
            left.sortOrder - right.sortOrder ||
            left.name.localeCompare(right.name, 'ru'),
        ),
    [categories],
  );
  const rootCategories = activeCategories.filter(
    (category) => category.parentId === null,
  );

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
    <details ref={menuRef} className="marketplace-categories-menu">
      <summary className="marketplace-categories-button">
        <span className="marketplace-menu-icon" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        Все категории
      </summary>

      <nav aria-label="Все категории" onClick={closeMenu}>
        {rootCategories.map((category) => {
          const children = activeCategories.filter(
            (item) => item.parentId === category.id,
          );

          return (
            <section key={category.id}>
              <Link
                href={'/category/' + encodeURIComponent(category.slug)}
                className="marketplace-category-root"
              >
                {category.name}
              </Link>
              {children.length > 0 ? (
                <div>
                  {children.map((child) => (
                    <Link
                      key={child.id}
                      href={'/category/' + encodeURIComponent(child.slug)}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
        {rootCategories.length === 0 ? (
          <Link href="/listings">Смотреть все объявления</Link>
        ) : null}
      </nav>
    </details>
  );
}
