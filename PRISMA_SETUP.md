# Prisma Setup Documentation

This document outlines how to set up and configure Prisma for the Saku AI Frontend application.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or pnpm package manager

## Database Schema

The application uses the following models:

### User Model
- `id`: Unique identifier (CUID)
- `email`: User's email address (unique)
- `name`: User's display name (optional)
- `avatar`: User's profile picture URL (optional)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

### Account Model (NextAuth.js)
- Stores OAuth provider account information
- Links to User model via userId
- Supports Google OAuth provider

### Session Model (NextAuth.js)
- Manages user sessions
- Links to User model via userId
- Handles session expiration

### VerificationToken Model (NextAuth.js)
- Handles email verification tokens
- Used for password reset and email verification

## Setup Instructions

### 1. Install Dependencies

```bash
cd Saku-AI-Frontend
npm install @prisma/client next-auth
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/saku_ai_db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:5000"
NEXTAUTH_SECRET=secret

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a database named `saku_ai_db`
3. Update the `DATABASE_URL` in your `.env.local` file

#### Option B: Cloud Database (Recommended)
1. Use services like Supabase, Railway, or Neon
2. Copy the connection string to your `DATABASE_URL`

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run Database Migrations

```bash
npx prisma db push
```

### 6. Optional: View Database in Prisma Studio

```bash
npx prisma studio
```

## Database Commands

### Reset Database
```bash
npx prisma db push --force-reset
```

### Generate Client After Schema Changes
```bash
npx prisma generate
```

### Deploy Migrations
```bash
npx prisma db push
```

## Troubleshooting

### Common Issues

1. **Connection Issues**: Verify your `DATABASE_URL` is correct
2. **Schema Sync Issues**: Run `npx prisma db push` to sync schema
3. **Client Generation**: Run `npx prisma generate` after schema changes

### Database Connection Test

You can test your database connection with:

```bash
npx prisma db pull
```

## Production Considerations

1. **Security**: Use environment variables for all sensitive data
2. **Performance**: Consider connection pooling for production
3. **Backups**: Set up regular database backups
4. **Monitoring**: Monitor database performance and connection limits

## Schema Updates

When making changes to the Prisma schema:

1. Update the `schema.prisma` file
2. Run `npx prisma generate` to update the client
3. Run `npx prisma db push` to apply changes to the database
4. Update any affected application code

## Support

For issues related to Prisma setup, refer to:
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
