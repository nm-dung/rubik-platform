import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'vi'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ============================================================================
  // LOCALE ROUTING
  // ============================================================================
  
  // Check if the URL already has a language (e.g., /en/dashboard or /vi)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If it already has a language, let them pass
  if (pathnameHasLocale) {
    // ============================================================================
    // ADMIN ROUTE PROTECTION
    // ============================================================================
    
    const locale = locales.find((l) => pathname.startsWith(`/${l}`)) || defaultLocale;
    const isAdminRoute = pathname.includes('/admin');
    const isAdminLoginRoute = pathname.includes('/admin/login');

    if (isAdminRoute && !isAdminLoginRoute) {
      const token = request.cookies.get('rubik-admin-token')?.value;

      if (!token) {
        request.nextUrl.pathname = `/${locale}/admin/login`;
        return NextResponse.redirect(request.nextUrl);
      }
    }

    if (isAdminLoginRoute) {
      const token = request.cookies.get('rubik-admin-token')?.value;

      if (token) {
        request.nextUrl.pathname = `/${locale}/admin`;
        return NextResponse.redirect(request.nextUrl);
      }
    }

    return NextResponse.next();
  }

  // If no language is found, redirect them to the default (English)
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};