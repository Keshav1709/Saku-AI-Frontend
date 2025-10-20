# Saku AI Frontend

This is the frontend application for Saku AI, a proactive AI assistant that works seamlessly across all your apps and workflows. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Google OAuth 2.0 integration with NextAuth.js
- 👤 **User Management**: Profile management with PostgreSQL database
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 🔒 **Secure**: JWT-based sessions and secure OAuth flow
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Google Cloud Platform account (for OAuth)

### Quick Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd Saku-AI-Frontend
   npm install
   ```

2. **Run the setup script:**
   ```bash
   ./setup-auth.sh
   ```

3. **Configure environment variables:**
   - Copy `env.example` to `.env.local`
   - Update with your Google OAuth credentials
   - Set up your PostgreSQL database URL

4. **Set up the database:**
   ```bash
   npx prisma db push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:5000](http://localhost:5000) with your browser to see the result.

### Manual Setup

If you prefer to set up manually, see the detailed documentation:

- [Prisma Setup](PRISMA_SETUP.md)
- [Google OAuth Setup](GOOGLE_CLOUD_CONSOLE_SETUP.md)
- [Authentication Documentation](DOCUMENTATION/10_LOGIN_SIGNUP.md)

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth.js routes
│   │   └── user/          # User management API
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── settings/          # User settings
│   └── onboarding/        # User onboarding
├── components/            # Reusable components
├── lib/                   # Utility functions
│   └── auth.ts           # NextAuth.js configuration
└── middleware.ts          # Route protection middleware
```

## Authentication Flow

1. User visits homepage and clicks "Get Started"
2. Redirected to login page with Google OAuth option
3. After Google authentication, redirected to onboarding
4. User profile is automatically created/updated in database
5. Session persists across page reloads using JWT tokens

## Available Scripts

- `npm run dev` - Start development server on port 5000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio for database management
- `npx prisma db push` - Push schema changes to database
- `npx prisma generate` - Generate Prisma client

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
