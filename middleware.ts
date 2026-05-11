import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'vi'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the URL already has a language (e.g., /en/dashboard or /vi)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If it already has a language, let them pass
  if (pathnameHasLocale) return;

  // If no language is found, redirect them to the default (English)
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

// This tells Next.js NOT to run middleware on images, API routes, etc.
export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};