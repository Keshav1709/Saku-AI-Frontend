# Saku-AI Frontend Documentation

## Overview
This documentation provides comprehensive information about the Saku-AI Frontend application, including detailed page documentation, component guides, API integration details, and development guidelines. The application now uses **Better Auth** for authentication and **shadcn/ui** for the user interface.

## Documentation Structure

### 📄 Page Documentation
- **[01_HOME_PAGE.md](./01_HOME_PAGE.md)** - Landing page with introduction and navigation
- **[02_DASHBOARD_PAGE.md](./02_DASHBOARD_PAGE.md)** - Main dashboard with profile, tasks, schedule, and AI features
- **[03_CHAT_PAGE.md](./03_CHAT_PAGE.md)** - AI chat interface with streaming responses and file uploads
- **[04_SETTINGS_PAGE.md](./04_SETTINGS_PAGE.md)** - Comprehensive settings management with multiple tabs
- **[05_DOCS_PAGE.md](./05_DOCS_PAGE.md)** - Document management and display
- **[06_UPLOAD_PAGE.md](./06_UPLOAD_PAGE.md)** - File upload interface for documents

### 🔧 Technical Documentation
- **[07_API_ROUTES.md](./07_API_ROUTES.md)** - Backend API integration and route documentation
- **[08_COMPONENTS.md](./08_COMPONENTS.md)** - Reusable component documentation
- **[09_DEVELOPMENT_GUIDE.md](./09_DEVELOPMENT_GUIDE.md)** - Complete development guide and best practices
- **[10_LOGIN_SIGNUP.md](./10_LOGIN_SIGNUP.md)** - Authentication system documentation (Better Auth)

### 🚀 Setup Documentation
- **[../SETUP_GUIDE.md](../SETUP_GUIDE.md)** - Complete setup guide for new developers

## Quick Start

### For Developers
1. **Read the [Setup Guide](../SETUP_GUIDE.md)** for complete installation instructions
2. **Review [Authentication Documentation](./10_LOGIN_SIGNUP.md)** for Better Auth implementation
3. **Check [Component Documentation](./08_COMPONENTS.md)** for shadcn/ui components
4. **Reference [API Routes](./07_API_ROUTES.md)** for backend integration
5. **Study specific page docs** for detailed implementation

### For New Team Members
1. **Start with [Setup Guide](../SETUP_GUIDE.md)**
2. **Understand the [Project Structure](./09_DEVELOPMENT_GUIDE.md#project-structure)**
3. **Review [Authentication System](./10_LOGIN_SIGNUP.md)**
4. **Study [Component Guidelines](./08_COMPONENTS.md)**
5. **Learn [API Integration Patterns](./07_API_ROUTES.md)**

## Key Features

### ✅ Functional Features
- **Authentication**: Better Auth with Google OAuth and email/password
- **Dashboard**: Profile management, task display, schedule view
- **Chat Interface**: AI-powered chat with streaming responses
- **Meetings**: Meeting management and scheduling
- **Document Management**: Upload, view, and manage documents
- **Settings**: Comprehensive settings with multiple tabs
- **Integration Management**: Connect to Gmail, Drive, Calendar, Slack, etc.
- **Real-time Updates**: Live data updates across components

### ❌ Non-Functional Features
- **Search Functionality**: Not implemented across pages
- **File Processing**: Files selected but not processed
- **Bulk Operations**: No bulk actions for documents
- **Advanced Filtering**: Limited filtering options
- **Export Functionality**: No export capabilities
- **Real-time Notifications**: No push notifications

## Backend Integration Status

### ✅ Connected APIs
- **Chat Streaming**: `/api/chat/stream` - Working
- **Connector Management**: `/api/connectors/*` - Working
- **Document Upload**: `/api/docs/upload` - Working
- **Integration Data**: `/api/integrations` - Working
- **Authentication**: Better Auth API routes - Working

### 🔄 Partial Integration
- **Profile Management**: Database sync with Better Auth
- **Settings Persistence**: Database sync with Better Auth
- **Session Management**: Better Auth session handling

### ❌ Missing APIs
- **File Processing**: No file processing API
- **Search API**: No search functionality
- **Notification API**: No notification system
- **Analytics API**: No analytics tracking

## Development Status

### 🟢 Complete Pages
- **Home Page**: Fully functional landing page
- **Authentication Pages**: Login/signup with Better Auth
- **Dashboard Page**: Complete with profile integration
- **Chat Page**: Fully functional with streaming and shadcn/ui
- **Meetings Page**: Complete meeting management with shadcn/ui
- **Settings Page**: Complete with all tabs
- **Docs Page**: Basic document listing
- **Upload Page**: Basic file upload

### 🟡 Partially Complete
- **API Integration**: Some endpoints connected
- **State Management**: Mix of localStorage and API
- **Error Handling**: Basic error handling implemented
- **Loading States**: Some loading states missing

### 🔴 Needs Work
- **File Processing**: Files not processed after upload
- **Search Functionality**: No search implementation
- **Real-time Features**: Limited real-time capabilities
- **Mobile Responsiveness**: Some pages need mobile optimization

## Architecture Overview

### Frontend Stack
- **Next.js 15**: React framework with app router
- **React 18**: UI library with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern component library

### Authentication Stack
- **Better Auth**: Modern authentication library
- **Google OAuth 2.0**: Third-party authentication
- **Prisma**: Database ORM
- **PostgreSQL**: Database

### Backend Integration
- **REST APIs**: HTTP-based communication
- **Server-Sent Events**: Real-time streaming
- **OAuth 2.0**: Third-party authentication

### State Management
- **React Hooks**: useState, useEffect, useContext
- **Better Auth**: Session management
- **localStorage**: Persistent local storage
- **Context API**: Global state management

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- PostgreSQL

### Installation
```bash
# Clone repository
git clone <repository-url>
cd Saku-AI-Frontend

# Install dependencies
npm install

# Set up environment
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
# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
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

## Common Tasks

### Adding a New Page
1. Create page file in `/src/app/`
2. Follow page structure from existing pages
3. Add authentication checks with Better Auth
4. Add navigation link in MainSidebar
5. Implement required API calls
6. Add loading and error states
7. Test responsive design

### Adding a New Component
1. Create component file in `/src/components/`
2. Use shadcn/ui components when possible
3. Define TypeScript interface
4. Implement component logic
5. Add proper styling with Tailwind CSS
6. Write unit tests
7. Document usage

### Integrating with Backend
1. Create API route in `/src/app/api/`
2. Define request/response types
3. Implement error handling
4. Add loading states
5. Test integration
6. Document endpoint

### Authentication Integration
1. Use `authClient.useSession()` for session management
2. Implement proper loading states
3. Add authentication checks
4. Handle redirects appropriately
5. Test authentication flows

## Troubleshooting

### Common Issues
- **Build Errors**: Clear `.next` folder and rebuild
- **TypeScript Errors**: Check type definitions
- **Authentication Errors**: Check Better Auth configuration
- **Database Errors**: Verify Prisma setup and database connection
- **API Errors**: Verify backend is running
- **Styling Issues**: Check Tailwind classes and shadcn/ui components

### Debug Tools
- **React DevTools**: Browser extension
- **Next.js DevTools**: Built-in debugging
- **Browser DevTools**: Network, Console, Sources
- **VS Code**: Debugging configuration
- **Prisma Studio**: Database management

## Contributing

### Code Standards
- Use TypeScript for all new code
- Follow ESLint and Prettier rules
- Use shadcn/ui components when possible
- Write tests for new features
- Document all public APIs
- Use conventional commit messages
- Follow Better Auth best practices

### Pull Request Process
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Create pull request
5. Address review feedback
6. Merge after approval

## Migration Notes

### From NextAuth.js to Better Auth
- **Better Type Safety**: Improved TypeScript support
- **Simpler Configuration**: Less boilerplate code
- **Modern API**: Uses React hooks and modern patterns
- **Better Performance**: Optimized for modern React applications

### Key Changes
- Authentication configuration updated
- Client-side authentication code updated
- Middleware configuration updated
- Environment variables updated
- Documentation updated

## Support

### Documentation
- **Setup Guide**: Complete installation instructions
- **Page Docs**: Detailed page-by-page documentation
- **Component Docs**: shadcn/ui component guides
- **API Docs**: Backend integration details
- **Auth Docs**: Better Auth implementation guide
- **Dev Guide**: Complete development guide

### Getting Help
- **Setup Issues**: Check [Setup Guide](../SETUP_GUIDE.md)
- **Authentication Issues**: Review [Authentication Documentation](./10_LOGIN_SIGNUP.md)
- **Code Issues**: Check existing documentation
- **API Problems**: Review API route documentation
- **Component Issues**: Check component documentation
- **General Questions**: Refer to development guide

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Authentication**: Better Auth  
**UI Framework**: shadcn/ui + Tailwind CSS  
**Maintainer**: Development Team