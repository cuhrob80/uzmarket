import Link from 'next/link';
import { getCurrentUser } from '@/lib/api/server';
import { logoutAction } from '@/app/profile/actions';
import type { AuthUser } from '@/types/listing';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
      <path d="M10 21h4" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-6a3 3 0 0 1-1-2V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z" />
    </svg>
  );
}

export async function MarketplaceHeader() {
  let user: AuthUser | null = null;

  try {
    user = await getCurrentUser();
  } catch (error: unknown) {
    console.error('Failed to load header profile:', error);
  }

  const initials =
    user?.displayName.trim().slice(0, 2).toUpperCase() || 'UZ';

  return (
    <header className="marketplace-header">
      <div className="marketplace-header-top">
        <div className="marketplace-header-row">
          <nav
            className="marketplace-service-links"
            aria-label="Служебная навигация"
          >
            <Link href="/listings">Для бизнеса</Link>
            <Link href="/rabota/vakansii">Работа</Link>
            <Link href="/listings">Помощь</Link>
            <Link href="/listings">Каталоги</Link>
          </nav>

          <nav
            className="marketplace-account-links"
            aria-label="Меню пользователя"
          >
            <Link
              href="/create-listing"
              className="marketplace-top-create"
            >
              <span aria-hidden="true">＋</span>
              Разместить объявление
            </Link>
            <Link href="/my-listings">Мои объявления</Link>
            <Link
              href="/my-listings"
              className="marketplace-header-icon"
              aria-label="Избранное"
            >
              <HeartIcon />
            </Link>
            <button
              type="button"
              className="marketplace-header-icon"
              aria-label="Уведомления"
            >
              <BellIcon />
            </button>
            <button
              type="button"
              className="marketplace-header-icon"
              aria-label="Сообщения"
            >
              <MessageIcon />
            </button>
            {user ? (
              <details className="marketplace-profile-menu">
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
                <nav aria-label="Личный кабинет">
                  <Link href="/profile">Личный кабинет</Link>
                  <Link href="/my-listings">Мои объявления</Link>
                  <Link href="/profile/reviews">Отзывы и рейтинг</Link>
                  <Link href="/profile">Настройки профиля</Link>
                  <form action={logoutAction}>
                    <button type="submit">Выйти</button>
                  </form>
                </nav>
              </details>
            ) : (
              <Link href="/login" className="marketplace-login-link">
                Войти
              </Link>
            )}
          </nav>
        </div>
      </div>

      <div className="marketplace-header-main">
        <div className="marketplace-header-row marketplace-header-main-row">
          <Link href="/" className="marketplace-logo" aria-label="UzMarket">
            <span className="marketplace-logo-mark" aria-hidden="true">
              <i />
              <i />
            </span>
            <span className="marketplace-logo-word">
              <strong>Uz</strong>Market
            </span>
          </Link>

          <Link href="/listings" className="marketplace-categories-button">
            <span className="marketplace-menu-icon" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            Все категории
          </Link>

          <form
            action="/listings"
            method="get"
            className="marketplace-header-search"
          >
            <span className="marketplace-search-icon">
              <SearchIcon />
            </span>
            <input
              type="search"
              name="search"
              placeholder="Поиск по объявлениям"
              aria-label="Поиск по объявлениям"
            />
            <button type="submit">Найти</button>
          </form>

          <Link href="/listings" className="marketplace-location">
            <PinIcon />
            <span>Ташкент</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
