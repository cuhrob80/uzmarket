'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const TERRITORIES = [
  'Республика Каракалпакстан',
  'Андижанская область',
  'Бухарская область',
  'Джизакская область',
  'Кашкадарьинская область',
  'Навоийская область',
  'Наманганская область',
  'Самаркандская область',
  'Сурхандарьинская область',
  'Сырдарьинская область',
  'Ташкентская область',
  'Ферганская область',
  'Хорезмская область',
  'Город Ташкент',
] as const;

export function MarketplaceHeader() {
  const [location, setLocation] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);
  const filteredTerritories = useMemo(() => {
    const query = location.trim().toLocaleLowerCase('ru');

    return query
      ? TERRITORIES.filter((territory) =>
          territory.toLocaleLowerCase('ru').includes(query),
        )
      : TERRITORIES;
  }, [location]);

  function selectLocation(value: string) {
    setLocation(value);
    setLocationOpen(false);
  }

  return (
    <header className="marketplace-header">
      <div className="marketplace-header-inner">
        <Link href="/" className="marketplace-logo" aria-label="UzMarket">
          <span className="marketplace-logo-word"><strong>UZ</strong>MARKET</span>
          <small>Покупай. Продавай. Ближе к людям.</small>
        </Link>

        <form action="/listings" method="get" className="marketplace-header-search">
          <label className="marketplace-query-field">
            <svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input type="search" name="search" placeholder="Что ищете?" aria-label="Что вы ищете?" />
          </label>

          <div
            className="marketplace-location-picker"
            onFocus={() => setLocationOpen(true)}
            onBlur={() => window.setTimeout(() => setLocationOpen(false), 120)}
          >
            <label className="marketplace-location-field">
              <svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <input
                type="text"
                name="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Весь Узбекистан"
                aria-label="Город или регион"
                aria-expanded={locationOpen}
                aria-controls="marketplace-location-options"
                autoComplete="off"
              />
              {location ? (
                <button
                  type="button"
                  className="marketplace-location-clear"
                  aria-label="Очистить местоположение"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setLocation('');
                    setLocationOpen(true);
                  }}
                >
                  ×
                </button>
              ) : null}
            </label>

            {locationOpen ? (
              <div
                id="marketplace-location-options"
                className="marketplace-location-options"
                role="listbox"
                aria-label="Выберите территорию"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={location === ''}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectLocation('')}
                >
                  <span>
                    <strong>Весь Узбекистан</strong>
                    <small>Искать объявления по всей стране</small>
                  </span>
                </button>

                <p>Выберите территорию</p>

                {filteredTerritories.length ? (
                  filteredTerritories.map((territory) => (
                    <button
                      key={territory}
                      type="button"
                      role="option"
                      aria-selected={location === territory}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectLocation(territory)}
                    >
                      <span>{territory}</span>
                      <span aria-hidden="true">›</span>
                    </button>
                  ))
                ) : (
                  <div className="marketplace-location-empty">
                    Местоположение не найдено
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <button type="submit" className="marketplace-search-button">
            <span>Поиск</span>
            <svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </button>
        </form>

        <Link href="/create-listing" className="marketplace-create-button">
          <span aria-hidden="true">＋</span>
          Подать объявление
        </Link>

        <nav className="marketplace-quick-links" aria-label="Пользовательское меню">
          <Link href="/my-listings" aria-label="Избранное">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
            </svg>
          </Link>
          <button type="button" aria-label="Уведомления">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
              <path d="M10 21h4" />
            </svg>
          </button>
          <Link href="/login" aria-label="Войти или зарегистрироваться">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4.5 21a7.5 7.5 0 0 1 15 0Z" />
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  );
}
