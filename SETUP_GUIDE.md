# Saku AI Application Setup Guide

## Overview
This guide provides step-by-step instructions to set up and run the Saku AI application locally. This application uses **better-auth** for authentication and **shadcn/ui** for the user interface.

## Prerequisites

### Required Software
- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn**
- **Git** (Download from [git-scm.com](https://git-scm.com/))
- **PostgreSQL** (Download from [postgresql.org](https://www.postgresql.org/download/))

### Required Accounts
- **Google Cloud Console** account (for OAuth authentication)
- **Database hosting** (local PostgreSQL or cloud service like Supabase/PlanetScale)

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd Saku-AI-Frontend

# Verify you're in the correct directory
ls -la
# You should see: package.json, src/, public/, etc.
```

## Step 2: Install Dependencies

```bash
# Install all required packages
npm install

# Verify installation
npm list --depth=0
```

## Step 3: Environment Configuration

### 3.1 Copy Environment File
```bash
# Copy the example environment file
cp .env.example .env.local

# Open the file in your editor
code .env.local  # or use your preferred editor
```

### 3.2 Configure Environment Variables
Update your `.env.local` file with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/saku_ai_db"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-super-secret-key-here-minimum-32-characters"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"

# Optional: Development settings
NODE_ENV="development"
```

### 3.3 Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3000/api/auth/signin/google`
7. Copy Client ID and Client Secret to your `.env.local`

## Step 4: Database Setup

### 4.1 Install Prisma CLI (if not already installed)
```bash
npm install -g prisma
```

### 4.2 Set up PostgreSQL Database
```bash
# Create database (replace with your credentials)
createdb saku_ai_db

# Or using psql
psql -U postgres
CREATE DATABASE saku_ai_db;
\q
```

### 4.3 Run Database Migrations
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Verify database connection
npx prisma studio
```

## Step 5: Start the Application

### 5.1 Development Server
```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:3000
```

### 5.2 Verify Installation
1. Open your browser and go to `http://localhost:3000`
2. You should see the Saku AI landing page
3. Click "Get Started" to test authentication
4. Try signing in with Google OAuth

## Step 6: Running on Different Ports

### 6.1 Custom Port Configuration
```bash
# Run on port 5000
npm run dev -- -p 5000

# Run on port 8080
npm run dev -- -p 8080

# Or set environment variable
PORT=5000 npm run dev
```

### 6.2 Update Environment Variables for Custom Port
If using a different port, update your `.env.local`:
```env
BETTER_AUTH_URL="http://localhost:5000"
NEXT_PUBLIC_APP_URL="http://localhost:5000"
```

## Step 7: Verify Everything Works

### 7.1 Test Authentication Flow
1. Go to `http://localhost:3000`
2. Click "Get Started" or navigate to `/auth/login`
3. Click "Sign in with Google"
4. Complete Google OAuth flow
5. You should be redirected to `/onboarding`
6. Complete onboarding to reach `/dashboard`

### 7.2 Test Application Features
- **Dashboard**: Profile management, task display
- **Chat**: AI chat interface with streaming
- **Meetings**: Meeting management and scheduling
- **Settings**: Profile and application settings

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_ctl status

# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql

# Start PostgreSQL (Linux)
sudo systemctl start postgresql
```

#### 2. Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use a different port
npm run dev -- -p 5000
```

#### 3. Google OAuth Issues
- Verify redirect URIs in Google Cloud Console
- Check that Client ID and Secret are correct
- Ensure the domain is authorized

#### 4. Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### 5. TypeScript Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Fix type issues
npm run type-check
```

### Debug Commands

#### Check Application Status
```bash
# Check if server is running
curl http://localhost:3000

# Check database connection
npx prisma db pull

# Check environment variables
node -e "console.log(process.env.DATABASE_URL)"
```

#### View Logs
```bash
# View application logs
npm run dev 2>&1 | tee logs.txt

# View database logs
npx prisma studio
```

## Development Workflow

### Daily Development
```bash
# Start development server
npm run dev

# In another terminal, run database studio
npx prisma studio

# Check for type errors
npm run type-check

# Run linting
npm run lint
```

### Making Changes
1. Make your code changes
2. Test locally with `npm run dev`
3. Check for TypeScript errors
4. Run linting and fix issues
5. Test authentication flow
6. Commit your changes

### Database Changes
```bash
# After modifying schema.prisma
npx prisma db push

# Generate new Prisma client
npx prisma generate

# Reset database (development only)
npx prisma db push --force-reset
```

## Production Deployment

### Environment Variables for Production
```env
# Production database
DATABASE_URL="postgresql://user:password@production-host:5432/saku_ai_db"

# Production URLs
BETTER_AUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Production secrets
BETTER_AUTH_SECRET="your-production-secret-key"
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"
```

### Build for Production
```bash
# Build the application
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "saku-ai" -- start
```

## Support and Resources

### Documentation
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

### Getting Help
1. Check this setup guide first
2. Review the application logs
3. Check the browser console for errors
4. Verify all environment variables are set
5. Ensure all services (PostgreSQL, Node.js) are running

### Common Commands Reference
```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript

# Database
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database
npx prisma studio        # Open database studio
npx prisma db pull       # Pull schema from database

# Utilities
npm install             # Install dependencies
npm update              # Update dependencies
npm audit               # Check for vulnerabilities
```

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Authentication**: Better Auth  
**UI Framework**: shadcn/ui + Tailwind CSS
