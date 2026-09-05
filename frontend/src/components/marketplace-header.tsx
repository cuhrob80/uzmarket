import Link from 'next/link';

export function MarketplaceHeader() {
  return (
    <header className="marketplace-header">
      <div className="marketplace-header-inner">
        <Link href="/" className="marketplace-logo" aria-label="UzMarket">
          <span className="marketplace-logo-word"><strong>UZ</strong>MARKET</span>
          <small>Покупай. Продавай. Ближе к людям.</small>
        </Link>

        <form action="/listings" method="get" className="marketplace-header-search">
          <span aria-hidden="true">⌕</span>
          <input type="search" name="search" placeholder="Что ищете?" aria-label="Поиск объявлений" />
        </form>

        <button type="button" className="marketplace-location">
          <span aria-hidden="true">⌖</span>
          Весь Узбекистан
        </button>

        <Link href="/create-listing" className="marketplace-create-button">
          <span aria-hidden="true">＋</span>
          Подать объявление
        </Link>

        <nav className="marketplace-quick-links" aria-label="Пользовательское меню">
          <Link href="/my-listings" aria-label="Избранное">♡</Link>
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
