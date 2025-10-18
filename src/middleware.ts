import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  // Allow public paths
  // Public routes: login, static, api, favicon, splash, onboarding, signup
  if (pathname.startsWith('/login') || pathname.startsWith('/_next') ||
      pathname.startsWith('/api') || pathname === '/favicon.ico' ||
      pathname === '/' || pathname.startsWith('/signup')) {
    return NextResponse.next();
  }
  const cookie = request.cookies.get('saku_auth');
  // Prefer cookie if present (future-proof), otherwise allow client-side
  // localStorage guard
  if (!cookie &&
      (pathname.startsWith('/chat') || pathname.startsWith('/connect') ||
       pathname.startsWith('/dashboard') ||
       pathname.startsWith('/onboarding') || pathname.startsWith('/settings') ||
       pathname.startsWith('/upload') || pathname.startsWith('/docs') ||
       pathname.startsWith('/workflows'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
