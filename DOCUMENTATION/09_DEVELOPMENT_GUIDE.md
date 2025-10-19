# Development Guide

## Overview
This guide provides comprehensive information for developers working on the Saku-AI Frontend application.

## Project Structure

```
Saku-AI-Frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Home page
│   │   ├── dashboard/         # Dashboard page
│   │   ├── chat/              # Chat page
│   │   ├── docs/              # Documents page
│   │   ├── upload/            # Upload page
│   │   ├── settings/          # Settings page
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── MainSidebar.tsx    # Main navigation
│   │   ├── Sidebar.tsx        # Chat sidebar
│   │   └── TopNav.tsx         # Top navigation
│   └── middleware.ts          # Next.js middleware
├── public/                    # Static assets
├── package.json              # Dependencies
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── tailwind.config.js        # Tailwind CSS configuration
```

## Technology Stack

### Frontend
- **Next.js 14**: React framework with app router
- **React 18**: UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework

### Backend Integration
- **REST APIs**: HTTP-based API communication
- **Server-Sent Events**: Real-time streaming
- **OAuth 2.0**: Third-party service authentication

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Next.js Dev Server**: Development server

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

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

# Start development server
npm run dev
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## Development Workflow

### 1. Feature Development
1. Create feature branch from main
2. Implement feature with tests
3. Test locally
4. Create pull request
5. Code review
6. Merge to main

### 2. Code Standards
- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow ESLint rules
- **Prettier**: Use Prettier for formatting
- **Conventional Commits**: Use conventional commit messages

### 3. Testing
- **Unit Tests**: Test individual components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user flows

## Component Development

### Creating New Components
```typescript
// components/NewComponent.tsx
import React from 'react';

interface NewComponentProps {
  title: string;
  onAction?: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({
  title,
  onAction
}) => {
  return (
    <div className="p-4 bg-white rounded-lg border">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <button
        onClick={onAction}
        className="px-4 py-2 bg-black text-white rounded hover:bg-black/90"
      >
        Action
      </button>
    </div>
  );
};
```

### Component Guidelines
- **Single Responsibility**: One purpose per component
- **Props Interface**: Define clear prop interfaces
- **Default Props**: Provide sensible defaults
- **Error Handling**: Handle errors gracefully
- **Accessibility**: Follow accessibility guidelines

## Page Development

### Creating New Pages
```typescript
// app/new-page/page.tsx
"use client";

import { MainSidebar } from "@/components/MainSidebar";
import { useState, useEffect } from "react";

export default function NewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8f9] flex">
        <MainSidebar />
        <main className="flex-1 p-6">
          <div className="bg-white rounded-2xl border p-6">
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8f9] flex">
      <MainSidebar />
      <main className="flex-1 p-6">
        <div className="bg-white rounded-2xl border p-6">
          <h1 className="text-xl font-semibold mb-4">New Page</h1>
          {/* Page content */}
        </div>
      </main>
    </div>
  );
}
```

### Page Guidelines
- **Layout Consistency**: Use consistent layout structure
- **Loading States**: Show loading indicators
- **Error Handling**: Handle errors gracefully
- **Responsive Design**: Make pages responsive
- **Accessibility**: Follow accessibility guidelines

## API Integration

### Creating API Routes
```typescript
// app/api/new-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const param = searchParams.get('param');

    // Validate parameters
    if (!param) {
      return NextResponse.json(
        { error: 'Parameter is required' },
        { status: 400 }
      );
    }

    // Call backend API
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${backend}/api/endpoint?param=${param}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
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
    const body = await request.json();
    
    // Validate request body
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Required field is missing' },
        { status: 400 }
      );
    }

    // Call backend API
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${backend}/api/endpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
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

### Global State
```typescript
// Using Context for global state
import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
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

### Tailwind CSS
```typescript
// Use Tailwind classes for styling
<div className="bg-white rounded-lg border p-4 shadow-sm">
  <h2 className="text-lg font-semibold text-gray-900 mb-2">Title</h2>
  <p className="text-gray-600">Description</p>
</div>
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
import { Button } from '@/components/Button';

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

### E2E Testing
```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('dashboard loads correctly', async ({ page }) => {
  await page.goto('/dashboard');
  
  await expect(page.getByText('Dashboard')).toBeVisible();
  await expect(page.getByText('Hello, User')).toBeVisible();
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
NEXT_PUBLIC_BACKEND_URL=https://api.saku-ai.com
NEXT_PUBLIC_FRONTEND_URL=https://saku-ai.com
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Build passes without errors
- [ ] Tests pass
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

#### 4. Runtime Errors
- Check browser console for errors
- Verify API endpoints are accessible
- Check network requests in DevTools

### Debugging Tools
- **React DevTools**: Browser extension
- **Next.js DevTools**: Built-in debugging
- **Browser DevTools**: Network, Console, Sources
- **VS Code**: Debugging configuration

## Best Practices

### Code Quality
- Write clean, readable code
- Use meaningful variable names
- Add comments for complex logic
- Follow TypeScript best practices
- Write tests for new features

### Performance
- Optimize images and assets
- Use code splitting
- Implement lazy loading
- Monitor bundle size
- Use performance profiling

### Security
- Validate all inputs
- Sanitize user content
- Use HTTPS in production
- Implement proper authentication
- Follow OWASP guidelines

### Accessibility
- Use semantic HTML
- Provide alt text for images
- Ensure keyboard navigation
- Test with screen readers
- Follow WCAG guidelines

## Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools
- [VS Code](https://code.visualstudio.com)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Next.js DevTools](https://nextjs.org/docs/app/building-your-application/configuring/devtools)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### Learning
- [React Learning Path](https://react.dev/learn)
- [Next.js Learning Path](https://nextjs.org/learn)
- [TypeScript Learning Path](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Learning Path](https://tailwindcss.com/docs/utility-first)
