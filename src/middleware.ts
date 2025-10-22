import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  // Allow public paths - no authentication check needed for these
  if (pathname.startsWith('/auth/login') ||
      pathname.startsWith('/auth/signup') || pathname.startsWith('/_next') ||
      pathname.startsWith('/api') || pathname === '/favicon.ico' ||
      pathname === '/') {
    return NextResponse.next();
  }

  // For protected routes, we'll handle authentication in the page components
  // This avoids the Prisma Edge Runtime issue
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
