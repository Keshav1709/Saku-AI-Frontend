# Saku AI - Intelligent Assistant Platform

## Overview

Saku AI is a Next.js-based frontend application for an AI-powered assistant that integrates with multiple productivity tools and services. The platform enables users to chat with an AI assistant, connect third-party applications (Gmail, Slack, Google Drive, Notion, etc.), upload and manage documents, and automate workflows across connected services.

The application is built with Next.js 15.5.6, React 19, TypeScript, and Tailwind CSS v4, running on port 5000. It provides a modern, responsive interface for AI-driven task automation and cross-platform integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
**Technology**: Next.js 15 (App Router)
**Rationale**: Provides server-side rendering, file-based routing, and built-in API routes for a unified full-stack architecture. The App Router enables modern React patterns with server components and streaming.

**Key Configuration**:
- Custom port 5000 with host binding to 0.0.0.0 for containerized environments
- TypeScript with strict mode enabled for type safety
- Path aliases (`@/*` → `./src/*`) for clean imports

### Styling Approach
**Technology**: Tailwind CSS v4 with custom CSS variables
**Rationale**: Utility-first CSS framework enables rapid UI development with consistent design tokens. Dark mode support via CSS custom properties.

**Design System**:
- Custom color scheme using CSS variables (`--background`, `--foreground`)
- Geist font family for modern typography
- Responsive utilities for mobile-first design

### Authentication & Authorization
**Mechanism**: Cookie-based authentication with localStorage fallback
**Implementation**: 
- Middleware-based route protection at `/src/middleware.ts`
- Protected routes: `/chat`, `/connect`, `/dashboard`, `/onboarding`, `/settings`, `/upload`, `/docs`
- Public routes: `/login`, `/signup`, `/`, static assets
- Authentication cookie: `saku_auth`

**Rationale**: Middleware provides centralized auth logic that runs before page rendering, preventing unauthorized access at the edge. Cookie-based approach is more secure than localStorage-only, while localStorage provides client-side state persistence.

**Limitations**: Current implementation uses hardcoded test credentials (`test`/`test123`). Production deployment requires integration with proper authentication service.

### Application State Management
**Approach**: React hooks with localStorage persistence
**Rationale**: For this scale of application, React's built-in state management (useState, useEffect) combined with localStorage provides sufficient state handling without additional dependencies.

**Data Persistence**:
- Conversation history stored in `saku_sessions` localStorage key
- Auth token in `saku_auth` localStorage key
- User profile data stored in `saku_profile` localStorage key
- Profile photo stored in `saku_profile_photo` localStorage key (base64 encoded)
- Client-side only (no database integration in frontend)

### API Architecture
**Pattern**: Next.js API Routes (Route Handlers)
**Structure**: RESTful endpoints with backend proxy capability

**Key Endpoints**:
- `/api/auth` - Authentication (POST for login, DELETE for logout)
- `/api/chat/stream` - Server-Sent Events for streaming chat responses
- `/api/connectors` - List available integrations
- `/api/connectors/toggle` - Enable/disable integrations
- `/api/docs` - List uploaded documents
- `/api/docs/upload` - File upload handling

**Backend Integration Pattern**: All API routes support proxying to a FastAPI backend via `NEXT_PUBLIC_BACKEND_URL` environment variable, with fallback to mock data when backend is unavailable. This enables:
1. Development without backend dependency
2. Gradual migration from mock to real data
3. Easy environment-specific configuration

### Streaming Architecture
**Technology**: Server-Sent Events (SSE) via ReadableStream
**Rationale**: SSE provides unidirectional streaming from server to client, ideal for AI chat responses that generate tokens progressively. More efficient than WebSockets for this use case.

**Implementation**: `/api/chat/stream` uses Node.js runtime with ReadableStream to stream JSON-encoded events:
- `type: "meta"` - Initial metadata
- `type: "token"` - Individual response tokens
- `type: "done"` - Stream completion

**Proxy Capability**: When backend URL is configured, the route proxies the upstream SSE stream directly to the client.

### File Upload Handling
**Approach**: FormData with multipart/form-data
**Implementation**: Client-side file selection with array-based state management, uploaded via `/api/docs/upload` which forwards to backend `/ingest/upload` endpoint.

**Rationale**: FormData enables browser-native file handling without complex encoding. Server-side proxying to backend keeps file processing logic centralized.

### Page Structure & Routing

**Public Pages**:
- `/` - Landing page with call-to-action
- `/login` - Authentication page
- `/signup` - Registration page (UI only, no backend integration)

**Protected Pages**:
- `/onboarding` - Multi-step welcome flow (4 steps)
- `/chat` - Main chat interface with sidebar for conversation history
- `/connect` - Integration management dashboard
- `/dashboard` - Overview with quick actions
- `/docs` - Document library viewer
- `/upload` - File upload interface
- `/settings` - Account settings with multiple sub-pages (Profile & Account, Integrations, Monitoring, Tags, Payment & Billing, Policies, Advanced)

**Layout Strategy**: Shared `TopNav` component provides consistent navigation across protected routes. `Sidebar` component in chat page manages conversation switching.

### Component Architecture
**Pattern**: Client-side components with "use client" directive
**Rationale**: Most components require interactivity (state, effects, event handlers), necessitating client-side rendering. Server components could be introduced for static layouts in future optimization.

**Shared Components**:
- `TopNav` - Global navigation with active route highlighting, settings link, and logout
- `Sidebar` - Conversation list with localStorage persistence

### Settings Page Architecture
**Location**: `/src/app/settings/page.tsx`
**Pattern**: Tabbed interface with sub-navigation sidebar

**Sub-Pages**:
1. **Profile & Account** (Implemented) - User profile management with:
   - Profile photo upload/change/remove with base64 encoding
   - Personal information fields (First Name, Last Name, Job Title, Role, Department)
   - Email configuration (Primary Email)
   - Preferences (Language dropdown, Preference Email)
   - Auto-save functionality with localStorage persistence
   - Manual Save Changes and Cancel buttons
   
2. **Integrations** (Placeholder) - Third-party app connections
3. **Monitoring** (Placeholder) - Activity and usage tracking
4. **Tags** (Placeholder) - Custom tag management
5. **Payment & Billing** (Placeholder) - Subscription and billing management
6. **Policies** (Placeholder) - Privacy and terms
7. **Advanced** (Placeholder) - Advanced settings and configurations

**Implementation Details**:
- Responsive grid layout: single column on mobile, 2-column (240px sidebar + flex content) on desktop
- State management via React hooks with real-time localStorage sync
- Profile photo handling via FileReader API with base64 encoding for client-side storage
- Form fields auto-save after 500ms debounce to prevent excessive writes
- Matches existing design system: `#f7f8f9` backgrounds, white cards, black buttons, neutral borders

**Data Storage**:
- Profile data: `localStorage.saku_profile` (JSON object)
- Profile photo: `localStorage.saku_profile_photo` (base64 data URL)

**Future Enhancements**:
- Backend API integration for server-side profile storage
- Image optimization and size limits for profile photos
- Implementation of remaining sub-pages (Integrations, Monitoring, etc.)
- Form validation and error handling
- Success/error toast notifications

### Development vs Production Behavior
**Environment Detection**: API routes check `NEXT_PUBLIC_BACKEND_URL` to determine backend availability

**Mock Data Strategy**:
- Connectors: Returns 6 predefined integrations (Gmail, Slack, Drive, Notion, Calendar, Discord)
- Documents: Returns 2 sample documents
- Chat: Simulates token-by-token streaming with 25ms delays

**Rationale**: Enables frontend development and testing without backend dependency, while maintaining same API contract for production.

## External Dependencies

### Backend Service
**Expected Service**: FastAPI backend (not included in this repository)
**Configuration**: `NEXT_PUBLIC_BACKEND_URL` environment variable
**Endpoints Required**:
- `GET /connectors` - List integrations
- `POST /connectors/toggle` - Toggle integration state
- `GET /docs` - List documents
- `POST /ingest/upload` - Handle file uploads
- `GET /chat/stream` - Stream chat responses (SSE)

**Integration Pattern**: All backend calls include error handling with fallback to mock data, ensuring graceful degradation.

### Third-Party Integrations
The application is designed to connect with:
- **Gmail** - Email management
- **Slack** - Team communication
- **Google Drive** - File storage
- **Notion** - Note-taking and databases
- **Google Calendar** - Scheduling
- **Discord** - Community chat

**Implementation Status**: UI and API structure present, but OAuth flows and actual integration logic must be implemented in backend service.

### Font Service
**Provider**: Google Fonts (Geist and Geist Mono)
**Usage**: Loaded via `next/font/google` for optimized font delivery
**Rationale**: Next.js font optimization provides automatic subsetting and preloading for improved performance.

### Deployment Platform
**Target**: Vercel (mentioned in README)
**Rationale**: Native Next.js support with zero-config deployment, edge network, and automatic preview environments.

### Runtime Environment
**Node.js**: Required for API routes and server-side functionality
**Environment Variables**:
- `NEXT_PUBLIC_BACKEND_URL` - Backend API base URL (optional, enables real data)