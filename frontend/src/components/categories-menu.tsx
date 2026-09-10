'use client';

import { usePathname } from 'next/navigation';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Category } from '@/types/listing';
import { getCategoryName, type UiLocale } from '@/lib/category-i18n';
import { LocalizedLink } from './localized-link';
import { getDictionary } from '@/i18n/dictionaries';

function getCategoryIcon(category: Category): string {
  const value = (category.slug + ' ' + category.name).toLowerCase();

  if (value.includes('transport') || value.includes('транспорт')) return '🚙';
  if (value.includes('real') || value.includes('недвиж')) return '🏢';
  if (value.includes('job') || value.includes('работ')) return '💼';
  if (value.includes('service') || value.includes('услуг')) return '🛠️';
  if (value.includes('electron') || value.includes('электрон')) return '📱';
  if (value.includes('home') || value.includes('дом')) return '🏠';

  return '●';
}

export function CategoriesMenu({
  categories,
}: {
  categories: Category[];
}) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const locale: UiLocale = pathname === '/uz' || pathname.startsWith('/uz/') ? 'uz' : 'ru';
  const text = getDictionary(locale).categoriesMenu;
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
  const rootCategories = useMemo(
    () =>
      activeCategories.filter(
        (category) => category.parentId === null,
      ),
    [activeCategories],
  );
  const [selectedRootId, setSelectedRootId] = useState(
    rootCategories[0]?.id ?? '',
  );

  useEffect(() => {
    if (
      rootCategories.length > 0 &&
      !rootCategories.some(
        (category) => category.id === selectedRootId,
      )
    ) {
      setSelectedRootId(rootCategories[0].id);
    }
  }, [rootCategories, selectedRootId]);

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

  const selectedRoot =
    rootCategories.find(
      (category) => category.id === selectedRootId,
    ) ?? rootCategories[0];
  const groups = selectedRoot
    ? activeCategories.filter(
        (category) => category.parentId === selectedRoot.id,
      )
    : [];

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
        {text.button}
      </summary>

      <div className="marketplace-categories-overlay" aria-hidden="true" />

      <div className="marketplace-megamenu">
        <aside aria-label={text.navigation}>
          {rootCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={
                category.id === selectedRoot?.id
                  ? 'is-active'
                  : undefined
              }
              onClick={() => setSelectedRootId(category.id)}
            >
              <span aria-hidden="true">
                {getCategoryIcon(category)}
              </span>
              <strong>{getCategoryName(category, locale)}</strong>
              <i aria-hidden="true">›</i>
            </button>
          ))}
        </aside>

        <section className="marketplace-megamenu-content">
          {selectedRoot ? (
            <>
              <LocalizedLink
                href={
                  '/category/' +
                  encodeURIComponent(selectedRoot.slug)
                }
                className="marketplace-megamenu-title"
                onClick={closeMenu}
              >
                {getCategoryName(selectedRoot, locale)} ›
              </LocalizedLink>

              <div className="marketplace-megamenu-groups">
                {groups.map((group) => {
                  const children = activeCategories.filter(
                    (category) => category.parentId === group.id,
                  );

                  return (
                    <section key={group.id}>
                      <LocalizedLink
                        href={
                          '/category/' +
                          encodeURIComponent(group.slug)
                        }
                        className="marketplace-megamenu-group"
                        onClick={closeMenu}
                      >
                        {getCategoryName(group, locale)} ›
                      </LocalizedLink>
                      {children.map((child) => (
                        <LocalizedLink
                          key={child.id}
                          href={
                            '/category/' +
                            encodeURIComponent(child.slug)
                          }
                          onClick={closeMenu}
                        >
                          {getCategoryName(child, locale)}
                        </LocalizedLink>
                      ))}
                    </section>
                  );
                })}
              </div>

              {groups.length === 0 ? (
                <div className="marketplace-megamenu-empty">
                  <p>{text.noGroups}</p>
                  <LocalizedLink
                    href={
                      '/category/' +
                      encodeURIComponent(selectedRoot.slug)
                    }
                    onClick={closeMenu}
                  >
                    {text.viewCategory}
                  </LocalizedLink>
                </div>
              ) : null}
            </>
          ) : (
            <div className="marketplace-megamenu-empty">
              <p>{text.noCategories}</p>
              <LocalizedLink href="/listings" onClick={closeMenu}>
                {text.viewAll}
              </LocalizedLink>
            </div>
          )}
        </section>
      </div>
    </details>
  );
}
