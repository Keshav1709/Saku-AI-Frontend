# Login/Signup Documentation

This document outlines the authentication system implementation for the Saku AI application.

## Overview

The application uses NextAuth.js with Google OAuth 2.0 for user authentication. Users can sign in or sign up using their Google accounts, and their profile information is stored in a PostgreSQL database using Prisma ORM.

## Authentication Flow

### 1. User Access Flow
```
Home Page (/) → Login Page (/login) → Google OAuth → Onboarding (/onboarding)
```

### 2. Authentication Components

#### Login Page (`/login`)
- **Purpose**: Main entry point for user authentication
- **Features**:
  - Email input field (redirects to Google OAuth)
  - Google Sign-In button
  - Marketing section with app features
  - Responsive design matching the provided mockup

#### Signup Page (`/signup`)
- **Purpose**: Alternative entry point for new users
- **Features**:
  - Same interface as login page
  - Automatically handles new user registration
  - Redirects to onboarding after successful authentication

#### Settings Page (`/settings`)
- **Purpose**: Profile management for authenticated users
- **Features**:
  - Profile photo upload/change
  - Display name editing
  - Email display (read-only from Google)
  - Sign out functionality

## Technical Implementation

### Dependencies

```json
{
  "next-auth": "^4.24.8",
  "@next-auth/prisma-adapter": "^1.0.7",
  "@prisma/client": "^6.17.1",
  "prisma": "^6.17.1"
}
```

### Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  avatar    String?
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

#### NextAuth Configuration (`src/lib/auth.ts`)
```typescript
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle user creation/update logic
    },
    async jwt({ token, user }) {
      // Add user ID to token
    },
    async session({ session, token }) {
      // Add user ID to session
    },
  },
  pages: {
    signIn: "/login",
  },
};
```

#### API Routes
- `/api/auth/[...nextauth]` - NextAuth.js handlers
- `/api/user/profile` - User profile management

### Environment Variables

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# NextAuth.js
NEXTAUTH_URL="http://localhost:5000"
NEXTAUTH_SECRET="your-random-secret-key"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

## User Experience

### Login/Signup Process
1. User visits the application homepage
2. Clicks "Get Started" to go to login page
3. Enters email or clicks "Sign in with Google"
4. Redirected to Google OAuth consent screen
5. After authorization, redirected to onboarding page
6. Profile information is automatically saved to database

### Profile Management
1. User navigates to Settings page
2. Can update display name and profile photo
3. Email is read-only (managed by Google)
4. Changes are saved to database
5. User can sign out to end session

## Security Features

### Authentication Security
- JWT-based session management
- Secure OAuth 2.0 flow with Google
- CSRF protection via NextAuth.js
- Secure cookie handling

### Data Protection
- User passwords are not stored (handled by Google)
- Sensitive data encrypted in database
- Session tokens have expiration
- HTTPS required for production

## Middleware Protection

The application uses NextAuth middleware to protect routes:

```typescript
export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow public paths
        if (
          pathname.startsWith('/login') ||
          pathname.startsWith('/signup') ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/api') ||
          pathname === '/favicon.ico' ||
          pathname === '/'
        ) {
          return true;
        }
        
        // Require authentication for protected routes
        return !!token;
      },
    },
  }
);
```

## Error Handling

### Common Error Scenarios
1. **OAuth Errors**: Redirect URI mismatch, invalid credentials
2. **Database Errors**: Connection issues, schema mismatches
3. **Session Errors**: Expired tokens, invalid sessions

### Error Recovery
- Automatic redirect to login page for unauthenticated users
- Clear error messages for user feedback
- Fallback to Google OAuth for authentication issues

## Testing

### Manual Testing Checklist
- [ ] User can access login page without authentication
- [ ] Google OAuth flow works correctly
- [ ] New users are created in database
- [ ] Existing users are logged in successfully
- [ ] Profile updates work correctly
- [ ] Sign out functionality works
- [ ] Protected routes redirect to login
- [ ] Session persists across page reloads

### Test Users
For development, add test users in Google Cloud Console:
1. Go to OAuth consent screen
2. Add test users section
3. Add email addresses for testing

## Deployment Considerations

### Production Setup
1. Update `NEXTAUTH_URL` to production domain
2. Use HTTPS for all redirect URIs
3. Set secure `NEXTAUTH_SECRET`
4. Configure production database
5. Update Google Cloud Console with production URLs

### Environment Variables for Production
```env
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"
DATABASE_URL="your-production-database-url"
GOOGLE_CLIENT_ID="your-production-client-id"
GOOGLE_CLIENT_SECRET="your-production-client-secret"
```

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" Error**
   - Ensure redirect URI in Google Cloud Console matches exactly
   - Check for trailing slashes or protocol mismatches

2. **Session Not Persisting**
   - Verify `NEXTAUTH_SECRET` is set
   - Check database connection
   - Ensure cookies are enabled

3. **Profile Updates Not Saving**
   - Check database permissions
   - Verify API route is working
   - Check for validation errors

### Debug Steps
1. Check browser console for errors
2. Verify environment variables
3. Test database connection
4. Check Google Cloud Console logs
5. Verify NextAuth.js configuration

## Future Enhancements

### Planned Features
- Email verification
- Password reset functionality
- Multiple OAuth providers
- User role management
- Advanced profile customization
- Account deletion functionality

### Integration Opportunities
- User preferences storage
- Activity tracking
- Notification preferences
- Team/organization management

## Support

For issues related to authentication:
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Prisma Documentation](https://www.prisma.io/docs)
- Application-specific issues: Check application logs and error messages
