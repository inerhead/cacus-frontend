import { NextRequest, NextResponse } from 'next/server';
import { appSettings } from './src/config/settings';

export function middleware(request: NextRequest) {
  // Get locale from cookie, header, or use default
  const locale =
    request.cookies.get('NEXT_LOCALE')?.value ||
    request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] ||
    appSettings.app.defaultLocale;

  // Validate locale
  const validLocale = appSettings.app.supportedLocales.includes(locale as any)
    ? locale
    : appSettings.app.defaultLocale;

  // Clone the response
  const response = NextResponse.next();

  // Set locale header for server components
  response.headers.set('x-locale', validLocale);

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - _next (Next.js internals)
    // - static files
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};

