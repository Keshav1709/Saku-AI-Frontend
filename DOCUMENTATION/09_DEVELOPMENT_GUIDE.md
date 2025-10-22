# Development Guide

## Overview
This guide provides comprehensive information for developers working on the Saku-AI Frontend application. The application now uses **Better Auth** for authentication and **shadcn/ui** for the user interface.

## Project Structure

```
Saku-AI-Frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Home page
│   │   ├── (auth)/            # Authentication pages
│   │   │   └── auth/          # Login/signup pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── chat/              # Chat page
│   │   ├── meetings/          # Meetings page
│   │   ├── docs/              # Documents page
│   │   ├── upload/            # Upload page
│   │   ├── settings/          # Settings page
│   │   ├── api/               # API routes
│   │   │   └── auth/          # Better Auth API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── MainSidebar.tsx    # Main navigation
│   │   └── Providers.tsx      # App providers
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts           # Better Auth configuration
│   │   ├── auth-client.ts    # Better Auth client
│   │   └── db.ts             # Database connection
│   └── middleware.ts          # Next.js middleware
├── prisma/                    # Database schema
│   └── schema.prisma         # Prisma schema
├── public/                    # Static assets
├── package.json              # Dependencies
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── tailwind.config.js        # Tailwind CSS configuration
```

## Technology Stack

### Frontend
- **Next.js 15**: React framework with app router
- **React 18**: UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern component library

### Authentication
- **Better Auth**: Modern authentication library
- **Google OAuth 2.0**: Third-party service authentication
- **Prisma**: Database ORM
- **PostgreSQL**: Database

### Backend Integration
- **REST APIs**: HTTP-based API communication
- **Server-Sent Events**: Real-time streaming
- **OAuth 2.0**: Third-party service authentication

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Next.js Dev Server**: Development server
- **Prisma Studio**: Database management

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- PostgreSQL

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Saku-AI-Frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### Environment Variables
```bash
# .env.local
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
NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
```

## Development Workflow

### 1. Feature Development
1. Create feature branch from main
2. Implement feature with tests
3. Test locally with authentication
4. Create pull request
5. Code review
6. Merge to main

### 2. Code Standards
- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow ESLint rules
- **Prettier**: Use Prettier for formatting
- **shadcn/ui**: Use shadcn/ui components when possible
- **Better Auth**: Follow Better Auth best practices
- **Conventional Commits**: Use conventional commit messages

### 3. Testing
- **Unit Tests**: Test individual components
- **Integration Tests**: Test component interactions
- **Authentication Tests**: Test authentication flows
- **E2E Tests**: Test complete user flows

## Component Development

### Creating New Components with shadcn/ui
```typescript
// components/NewComponent.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NewComponentProps {
  title: string;
  onAction?: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({
  title,
  onAction
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onAction}>
          Action
        </Button>
      </CardContent>
    </Card>
  );
};
```

### Component Guidelines
- **Single Responsibility**: One purpose per component
- **shadcn/ui Components**: Use shadcn/ui components when possible
- **Props Interface**: Define clear prop interfaces
- **Default Props**: Provide sensible defaults
- **Error Handling**: Handle errors gracefully
- **Accessibility**: Follow accessibility guidelines
- **TypeScript**: Use proper TypeScript types

## Page Development

### Creating New Pages with Authentication
```typescript
// app/new-page/page.tsx
"use client";

import { MainSidebar } from "@/components/MainSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authentication check
  useEffect(() => {
    if (isPending) return;
    
    if (!session) {
      router.replace("/auth/login");
      return;
    }
  }, [session, isPending, router]);

  useEffect(() => {
    // Fetch data
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  // Show loading while checking authentication
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex">
        <MainSidebar />
        <main className="flex-1 p-6">
          <Card>
            <CardContent className="p-6">
              <p>Loading...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      <MainSidebar />
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>New Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Welcome, {session.user.name}!</p>
            {/* Page content */}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
```

### Page Guidelines
- **Layout Consistency**: Use consistent layout structure
- **Authentication**: Always check authentication
- **Loading States**: Show loading indicators
- **Error Handling**: Handle errors gracefully
- **Responsive Design**: Make pages responsive
- **shadcn/ui Components**: Use shadcn/ui components
- **Accessibility**: Follow accessibility guidelines

## Authentication Integration

### Using Better Auth in Components
```typescript
// Example: Using authentication in a component
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

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
      {/* Protected content */}
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

## API Integration

### Creating API Routes with Better Auth
```typescript
// app/api/protected-route/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Your API logic here
    const data = { message: 'Hello, authenticated user!' };
    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Required field is missing' },
        { status: 400 }
      );
    }

    // Your API logic here
    const result = { success: true, data: body };
    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### API Guidelines
- **Authentication**: Always check authentication for protected routes
- **Error Handling**: Handle all error cases
- **Validation**: Validate input parameters
- **Type Safety**: Use TypeScript interfaces
- **Documentation**: Document all endpoints
- **Testing**: Test all API routes

## State Management

### Local State
```typescript
// Using useState for local state
const [data, setData] = useState<DataType | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Authentication State
```typescript
// Using Better Auth for authentication state
const { data: session, isPending } = authClient.useSession();
const { signIn } = authClient.useSignIn();
const { signOut } = authClient.useSignOut();
```

### Persistent State
```typescript
// Using localStorage for persistent state
const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};
```

## Styling Guidelines

### Tailwind CSS with shadcn/ui
```typescript
// Use Tailwind classes with shadcn/ui components
<Card className="bg-white rounded-lg border p-4 shadow-sm">
  <CardHeader>
    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
      Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-gray-600">Description</p>
  </CardContent>
</Card>
```

### Custom CSS
```css
/* globals.css */
.custom-component {
  @apply bg-white rounded-lg border p-4;
}

.custom-component:hover {
  @apply shadow-md;
}
```

### Responsive Design
```typescript
// Responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Title
</h1>
```

## Testing

### Unit Testing
```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Authentication Testing
```typescript
// __tests__/auth/Authentication.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { authClient } from '@/lib/auth-client';

// Mock Better Auth
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: jest.fn(),
    useSignIn: jest.fn(),
    useSignOut: jest.fn(),
  },
}));

describe('Authentication', () => {
  it('redirects to login when not authenticated', async () => {
    // Mock unauthenticated state
    authClient.useSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    render(<ProtectedComponent />);
    
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/auth/login');
    });
  });
});
```

### Integration Testing
```typescript
// __tests__/pages/Dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '@/app/dashboard/page';

// Mock the API
jest.mock('@/app/api/data', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'test' })
}));

describe('Dashboard', () => {
  it('renders dashboard content', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy load components
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Memoization
```typescript
// Memoize components
import { memo } from 'react';

const ExpensiveComponent = memo(({ data }: { data: any[] }) => {
  // Expensive computation
  const processedData = data.map(item => ({
    ...item,
    processed: true
  }));

  return <div>{/* Render processed data */}</div>;
});

// Memoize callbacks
import { useCallback } from 'react';

const ParentComponent = () => {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return <ChildComponent onClick={handleClick} />;
};
```

### Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image';

export default function ImageComponent() {
  return (
    <Image
      src="/image.jpg"
      alt="Description"
      width={500}
      height={300}
      priority // For above-the-fold images
    />
  );
}
```

## Database Management

### Prisma Schema Updates
```bash
# After modifying schema.prisma
npx prisma db push

# Generate new Prisma client
npx prisma generate

# Reset database (development only)
npx prisma db push --force-reset
```

### Database Studio
```bash
# Open Prisma Studio
npx prisma studio

# This opens a web interface to manage your database
```

## Deployment

### Build Process
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Configuration
```bash
# Production environment variables
BETTER_AUTH_URL="https://yourdomain.com"
BETTER_AUTH_SECRET="your-production-secret"
DATABASE_URL="your-production-database-url"
GOOGLE_CLIENT_ID="your-production-client-id"
GOOGLE_CLIENT_SECRET="your-production-client-secret"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Build passes without errors
- [ ] Tests pass
- [ ] Authentication works
- [ ] Performance optimized
- [ ] Accessibility tested
- [ ] Security reviewed

## Troubleshooting

### Common Issues

#### 1. Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### 2. TypeScript Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

#### 3. ESLint Errors
```bash
# Fix ESLint errors
npm run lint -- --fix
```

#### 4. Authentication Errors
- Check Better Auth configuration
- Verify environment variables
- Check database connection
- Verify Google OAuth setup

#### 5. Database Errors
- Check Prisma configuration
- Verify database connection
- Run database migrations
- Check schema consistency

#### 6. Runtime Errors
- Check browser console for errors
- Verify API endpoints are accessible
- Check network requests in DevTools
- Check authentication state

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

## Best Practices

### Code Quality
- Write clean, readable code
- Use meaningful variable names
- Add comments for complex logic
- Follow TypeScript best practices
- Write tests for new features
- Use shadcn/ui components when possible

### Performance
- Optimize images and assets
- Use code splitting
- Implement lazy loading
- Monitor bundle size
- Use performance profiling
- Optimize database queries

### Security
- Validate all inputs
- Sanitize user content
- Use HTTPS in production
- Implement proper authentication
- Follow OWASP guidelines
- Secure environment variables

### Accessibility
- Use semantic HTML
- Provide alt text for images
- Ensure keyboard navigation
- Test with screen readers
- Follow WCAG guidelines
- Use proper ARIA attributes

## Resources

### Documentation
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Prisma Documentation](https://www.prisma.io/docs)

### Tools
- [VS Code](https://code.visualstudio.com)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Next.js DevTools](https://nextjs.org/docs/app/building-your-application/configuring/devtools)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Prisma Studio](https://www.prisma.io/studio)

### Learning
- [React Learning Path](https://react.dev/learn)
- [Next.js Learning Path](https://nextjs.org/learn)
- [TypeScript Learning Path](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Learning Path](https://tailwindcss.com/docs/utility-first)
- [Better Auth Learning Path](https://www.better-auth.com/docs)

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Authentication**: Better Auth  
**UI Framework**: shadcn/ui + Tailwind CSS