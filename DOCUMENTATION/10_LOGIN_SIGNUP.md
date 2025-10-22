# Authentication Documentation (Better Auth)

This document outlines the authentication system implementation for the Saku AI application using **Better Auth**.

## Overview

The application uses **Better Auth** with Google OAuth 2.0 for user authentication. Better Auth is a modern, type-safe authentication library that provides a better developer experience compared to NextAuth.js. Users can sign in or sign up using their Google accounts, and their profile information is stored in a PostgreSQL database using Prisma ORM.

## Authentication Flow

### 1. User Access Flow
```
Home Page (/) → Login Page (/auth/login) → Google OAuth → Onboarding (/onboarding) → Dashboard (/dashboard)
```

### 2. Authentication Components

#### Login Page (`/auth/login`)
- **Purpose**: Main entry point for user authentication
- **Features**:
  - Email input field with validation
  - Google Sign-In button
  - Password reset functionality
  - Responsive design with shadcn/ui components
  - Automatic redirect to onboarding after successful login

#### Signup Page (`/auth/signup`)
- **Purpose**: User registration with email/password or Google OAuth
- **Features**:
  - Email and password registration
  - Google OAuth registration
  - Email verification (optional)
  - Automatic redirect to onboarding after successful registration

#### Onboarding Page (`/onboarding`)
- **Purpose**: First-time user setup and profile completion
- **Features**:
  - Profile information collection
  - Preferences setup
  - Welcome tour
  - Redirect to dashboard after completion

#### Settings Page (`/settings`)
- **Purpose**: Profile management for authenticated users
- **Features**:
  - Profile photo upload/change
  - Display name editing
  - Email display and management
  - Password change functionality
  - Account deletion
  - Sign out functionality

## Technical Implementation

### Dependencies

```json
{
  "better-auth": "^0.7.0",
  "@prisma/client": "^6.17.1",
  "prisma": "^6.17.1",
  "@auth/prisma-adapter": "^1.0.0"
}
```

### Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  accounts Account[]
  sessions Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
```

### Configuration Files

#### Better Auth Configuration (`src/lib/auth.ts`)
```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(prisma),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle user creation/update logic
      return true;
    },
    async session({ session, user }) {
      // Add user ID to session
      session.user.id = user.id;
      return session;
    },
  },
});

export const authClient = auth.createAuthClient();
```

#### Client-Side Auth Configuration (`src/lib/auth-client.ts`)
```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});
```

#### API Routes
- `/api/auth/[...all]` - Better Auth handlers
- `/api/user/profile` - User profile management

### Environment Variables

```env
# Better Auth Configuration
BETTER_AUTH_SECRET="your-super-secret-key-here-minimum-32-characters"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## User Experience

### Login/Signup Process
1. User visits the application homepage
2. Clicks "Get Started" to go to login page
3. Can either:
   - Enter email/password for existing account
   - Click "Sign in with Google" for OAuth
   - Click "Sign up" to create new account
4. After authentication, redirected to onboarding page
5. Profile information is automatically saved to database

### Profile Management
1. User navigates to Settings page
2. Can update display name and profile photo
3. Can change password (for email/password accounts)
4. Email is managed through the provider (Google or local)
5. Changes are saved to database
6. User can sign out to end session

## Security Features

### Authentication Security
- JWT-based session management with Better Auth
- Secure OAuth 2.0 flow with Google
- CSRF protection via Better Auth
- Secure cookie handling with httpOnly flags
- Session expiration and refresh tokens

### Data Protection
- User passwords are hashed using bcrypt (for email/password accounts)
- OAuth tokens are encrypted in database
- Sensitive data encrypted in database
- Session tokens have expiration
- HTTPS required for production

## Middleware Protection

The application uses Better Auth middleware to protect routes:

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico' ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }
  
  // Check authentication for protected routes
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

## Client-Side Usage

### Using Better Auth in Components
```typescript
// Example: Dashboard component
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    
    if (!session) {
      router.replace("/auth/login");
      return;
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### Authentication Actions
```typescript
// Sign in with email/password
const { signIn } = authClient.useSignIn();
await signIn.email({
  email: "user@example.com",
  password: "password",
  callbackURL: "/dashboard"
});

// Sign in with Google
const { signIn } = authClient.useSignIn();
await signIn.social({
  provider: "google",
  callbackURL: "/dashboard"
});

// Sign up
const { signUp } = authClient.useSignUp();
await signUp.email({
  email: "user@example.com",
  password: "password",
  name: "User Name",
  callbackURL: "/onboarding"
});

// Sign out
const { signOut } = authClient.useSignOut();
await signOut();
```

## Error Handling

### Common Error Scenarios
1. **OAuth Errors**: Redirect URI mismatch, invalid credentials
2. **Database Errors**: Connection issues, schema mismatches
3. **Session Errors**: Expired tokens, invalid sessions
4. **Validation Errors**: Invalid email format, weak passwords

### Error Recovery
- Automatic redirect to login page for unauthenticated users
- Clear error messages for user feedback
- Fallback to Google OAuth for authentication issues
- Graceful handling of network errors

## Testing

### Manual Testing Checklist
- [ ] User can access login page without authentication
- [ ] Email/password authentication works correctly
- [ ] Google OAuth flow works correctly
- [ ] New users are created in database
- [ ] Existing users are logged in successfully
- [ ] Profile updates work correctly
- [ ] Password change functionality works
- [ ] Sign out functionality works
- [ ] Protected routes redirect to login
- [ ] Session persists across page reloads
- [ ] Onboarding flow works correctly

### Test Users
For development, you can:
1. Create test accounts with email/password
2. Use Google OAuth with test accounts
3. Add test users in Google Cloud Console

## Deployment Considerations

### Production Setup
1. Update `BETTER_AUTH_URL` to production domain
2. Use HTTPS for all redirect URIs
3. Set secure `BETTER_AUTH_SECRET`
4. Configure production database
5. Update Google Cloud Console with production URLs

### Environment Variables for Production
```env
BETTER_AUTH_URL="https://yourdomain.com"
BETTER_AUTH_SECRET="your-production-secret"
DATABASE_URL="your-production-database-url"
GOOGLE_CLIENT_ID="your-production-client-id"
GOOGLE_CLIENT_SECRET="your-production-client-secret"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" Error**
   - Ensure redirect URI in Google Cloud Console matches exactly
   - Check for trailing slashes or protocol mismatches
   - Verify BETTER_AUTH_URL is set correctly

2. **Session Not Persisting**
   - Verify `BETTER_AUTH_SECRET` is set
   - Check database connection
   - Ensure cookies are enabled
   - Verify BETTER_AUTH_URL matches your domain

3. **Profile Updates Not Saving**
   - Check database permissions
   - Verify API route is working
   - Check for validation errors
   - Ensure user is authenticated

4. **OAuth Not Working**
   - Verify Google Cloud Console configuration
   - Check Client ID and Secret
   - Ensure redirect URIs are correct
   - Check network connectivity

### Debug Steps
1. Check browser console for errors
2. Verify environment variables
3. Test database connection
4. Check Google Cloud Console logs
5. Verify Better Auth configuration
6. Test with different browsers
7. Check network requests in DevTools

## Migration from NextAuth.js

### Key Differences
- **Better Type Safety**: Better Auth provides better TypeScript support
- **Simpler Configuration**: Less boilerplate code required
- **Better Performance**: Optimized for modern React applications
- **Modern API**: Uses React hooks and modern patterns

### Migration Checklist
- [ ] Remove NextAuth.js dependencies
- [ ] Install Better Auth dependencies
- [ ] Update authentication configuration
- [ ] Update client-side authentication code
- [ ] Update middleware configuration
- [ ] Test all authentication flows
- [ ] Update environment variables
- [ ] Update documentation

## Future Enhancements

### Planned Features
- Email verification for new accounts
- Password reset functionality
- Two-factor authentication
- Multiple OAuth providers (GitHub, Discord, etc.)
- User role management
- Advanced profile customization
- Account deletion functionality
- Session management dashboard

### Integration Opportunities
- User preferences storage
- Activity tracking
- Notification preferences
- Team/organization management
- Advanced security features

## Support

For issues related to authentication:
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Prisma Documentation](https://www.prisma.io/docs)
- Application-specific issues: Check application logs and error messages

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Authentication**: Better Auth  
**Migration from**: NextAuth.js