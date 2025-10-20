import {withAuth} from 'next-auth/middleware';
import {NextResponse} from 'next/server';

export default withAuth(function middleware(req) {
  // Add any additional middleware logic here if needed
  return NextResponse.next();
}, {
  callbacks: {
    authorized: ({token, req}) => {
      const {pathname} = req.nextUrl;

      // Allow public paths
      if (pathname.startsWith('/login') || pathname.startsWith('/signup') ||
          pathname.startsWith('/_next') || pathname.startsWith('/api') ||
          pathname === '/favicon.ico' || pathname === '/') {
        return true;
      }

      // Require authentication for protected routes
      return !!token;
    },
  },
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
