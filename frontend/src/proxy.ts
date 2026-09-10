import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_FILE = /\.[^/]+$/;
const SUPPORTED_LOCALES = new Set(['ru', 'uz']);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0];

  if (SUPPORTED_LOCALES.has(locale)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-ui-locale', locale);

    if (segments.length === 1) {
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    const rewritten = request.nextUrl.clone();
    rewritten.pathname = '/' + segments.slice(1).join('/');

    return NextResponse.rewrite(rewritten, {
      request: { headers: requestHeaders },
    });
  }

  const localized = request.nextUrl.clone();
  localized.pathname = pathname === '/' ? '/ru' : '/ru' + pathname;
  localized.search = search;

  return NextResponse.redirect(localized, 308);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
