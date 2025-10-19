# API Routes Documentation

## Overview
- **Location**: `/src/app/api/`
- **Purpose**: Backend API integration layer
- **Type**: Next.js API routes with backend proxying

## API Route Structure

### 1. Authentication Routes
- **Path**: `/src/app/api/auth/route.ts`
- **Purpose**: Handle authentication requests
- **Status**: Not implemented

### 2. Chat Routes
- **Path**: `/src/app/api/chat/stream/route.ts`
- **Purpose**: Handle streaming chat responses
- **Status**: Implemented

### 3. Connector Routes
- **Path**: `/src/app/api/connectors/`
- **Purpose**: Handle third-party service connections
- **Status**: Implemented

### 4. Document Routes
- **Path**: `/src/app/api/docs/`
- **Purpose**: Handle document management
- **Status**: Implemented

### 5. Integration Routes
- **Path**: `/src/app/api/integrations/route.ts`
- **Purpose**: Handle integration data fetching
- **Status**: Implemented

## Detailed API Documentation

### 1. Chat Streaming API

#### Endpoint: `/api/chat/stream`
- **Method**: GET
- **Purpose**: Stream AI chat responses
- **Parameters**: `prompt` (query string)

**Implementation**:
```typescript
// GET /api/chat/stream?prompt={message}
// Response: Server-Sent Events (SSE)

interface StreamResponse {
  type: "token" | "context" | "done";
  value?: string;        // For token type
  citations?: any[];     // For context type
}
```

**Backend Integration**:
- **Backend URL**: `process.env.NEXT_PUBLIC_BACKEND_URL`
- **Endpoint**: `/chat` (POST)
- **Method**: Streaming response

**Usage Example**:
```typescript
const url = `/api/chat/stream?prompt=${encodeURIComponent(message)}`;
const evt = new EventSource(url);

evt.onmessage = (e) => {
  const data = JSON.parse(e.data);
  if (data.type === "token") {
    // Update message content
  } else if (data.type === "context") {
    // Update citations
  } else if (data.type === "done") {
    evt.close();
  }
};
```

### 2. Connector Management API

#### Endpoint: `/api/connectors`
- **Method**: GET
- **Purpose**: Get list of available connectors
- **Response**: List of connector statuses

**Implementation**:
```typescript
// GET /api/connectors
interface ConnectorsResponse {
  connectors: {
    key: string;
    name: string;
    connected: boolean;
  }[];
}
```

#### Endpoint: `/api/connectors/{service}/auth-url`
- **Method**: GET
- **Purpose**: Get OAuth authorization URL
- **Parameters**: `service` (path parameter)
- **Response**: OAuth URL and state

**Implementation**:
```typescript
// GET /api/connectors/gmail/auth-url
interface AuthUrlResponse {
  url: string;
  state: string;
}
```

#### Endpoint: `/api/connectors/toggle`
- **Method**: POST
- **Purpose**: Toggle connector connection status
- **Body**: Service type and action

**Implementation**:
```typescript
// POST /api/connectors/toggle
interface ToggleRequest {
  service_type: string;
}

interface ToggleResponse {
  success: boolean;
  message?: string;
}
```

### 3. Document Management API

#### Endpoint: `/api/docs`
- **Method**: GET
- **Purpose**: Get list of documents
- **Response**: Document list

**Implementation**:
```typescript
// GET /api/docs
interface DocsResponse {
  docs: {
    id: string;
    title: string;
    createdAt: string;
  }[];
}
```

#### Endpoint: `/api/docs/upload`
- **Method**: POST
- **Purpose**: Upload document
- **Body**: FormData with file
- **Response**: Upload status

**Implementation**:
```typescript
// POST /api/docs/upload
interface UploadRequest {
  file: File; // FormData
}

interface UploadResponse {
  success: boolean;
  docId?: string;
  error?: string;
}
```

### 4. Integration Data API

#### Endpoint: `/api/integrations`
- **Method**: GET
- **Purpose**: Fetch data from integrated services
- **Parameters**: `service`, `type`, `maxResults`, `query`

**Implementation**:
```typescript
// GET /api/integrations?service=gmail&type=messages&maxResults=10&query=unread
interface IntegrationDataRequest {
  service: 'gmail' | 'drive' | 'calendar';
  type: 'messages' | 'files' | 'events';
  maxResults?: number;
  query?: string;
  timeMin?: string; // For calendar
}

interface IntegrationDataResponse {
  data: any[];
  success: boolean;
  error?: string;
}
```

**Service Mappings**:
- **Gmail**: `/integrations/gmail/messages`
- **Drive**: `/integrations/drive/files`
- **Calendar**: `/integrations/calendar/events`

#### Endpoint: `/api/integrations`
- **Method**: POST
- **Purpose**: Perform integration actions
- **Body**: Action and payload

**Implementation**:
```typescript
// POST /api/integrations
interface IntegrationActionRequest {
  action: 'disconnect' | 'download';
  service_type?: string;
  file_id?: string;
}

interface IntegrationActionResponse {
  success: boolean;
  data?: any;
  error?: string;
}
```

## Backend Integration Pattern

### Environment Configuration
```typescript
const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!backend) {
  return NextResponse.json({error: 'Backend not configured'}, {status: 500});
}
```

### Request Proxying
```typescript
const url = `${backend.replace(/\/$/, '')}${endpoint}?${params.toString()}`;
const resp = await fetch(url);

if (!resp.ok) {
  throw new Error(`HTTP error! status: ${resp.status}`);
}

const json = await resp.json();
return NextResponse.json(json);
```

### Error Handling
```typescript
try {
  // API logic
} catch (error) {
  console.error('API error:', error);
  return NextResponse.json(
    {error: 'Internal server error'}, 
    {status: 500}
  );
}
```

## Required Backend Endpoints

### 1. Chat API
```typescript
// POST /chat
interface ChatRequest {
  message: string;
  sessionId?: string;
  context?: any;
}

interface ChatResponse {
  response: string;
  citations: any[];
  sessionId: string;
}
```

### 2. Connector API
```typescript
// GET /connectors
interface ConnectorsResponse {
  connectors: Connector[];
}

// GET /connectors/{service}/auth-url
interface AuthUrlRequest {
  service: string;
  state?: string;
}

interface AuthUrlResponse {
  url: string;
  state: string;
}

// POST /connectors/toggle
interface ToggleRequest {
  service_type: string;
  action: 'connect' | 'disconnect';
}

interface ToggleResponse {
  success: boolean;
  message: string;
}
```

### 3. Document API
```typescript
// GET /docs
interface DocsResponse {
  docs: Document[];
  total: number;
  page: number;
  limit: number;
}

// POST /docs/upload
interface UploadRequest {
  file: File;
  metadata?: any;
}

interface UploadResponse {
  success: boolean;
  docId: string;
  title: string;
  size: number;
  type: string;
  uploadedAt: string;
}

// DELETE /docs/{id}
interface DeleteRequest {
  docId: string;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}
```

### 4. Integration API
```typescript
// GET /integrations/{service}/{type}
interface IntegrationDataRequest {
  service: 'gmail' | 'drive' | 'calendar';
  type: 'messages' | 'files' | 'events';
  max_results?: number;
  query?: string;
  time_min?: string;
}

interface IntegrationDataResponse {
  data: any[];
  success: boolean;
  error?: string;
}

// POST /integrations/disconnect
interface DisconnectRequest {
  service_type: string;
}

interface DisconnectResponse {
  success: boolean;
  message: string;
}

// GET /integrations/drive/download/{file_id}
interface DownloadRequest {
  file_id: string;
}

interface DownloadResponse {
  url: string;
  filename: string;
  expires_at: string;
}
```

## Security Considerations

### Authentication
- **Token Validation**: Validate authentication tokens
- **Session Management**: Manage user sessions
- **Permission Checks**: Verify user permissions

### Input Validation
- **Parameter Validation**: Validate all input parameters
- **File Validation**: Validate uploaded files
- **Size Limits**: Enforce size limits
- **Type Validation**: Validate file types

### Rate Limiting
- **API Rate Limits**: Implement rate limiting
- **User Quotas**: Enforce user quotas
- **Resource Limits**: Limit resource usage

### Error Handling
- **Error Logging**: Log all errors
- **User Feedback**: Provide meaningful error messages
- **Security**: Don't expose sensitive information

## Performance Considerations

### Caching
- **Response Caching**: Cache API responses
- **Static Data**: Cache static data
- **User Data**: Cache user-specific data

### Optimization
- **Request Batching**: Batch multiple requests
- **Response Compression**: Compress responses
- **Connection Pooling**: Pool database connections

### Monitoring
- **Performance Metrics**: Track performance
- **Error Rates**: Monitor error rates
- **Usage Statistics**: Track API usage

## Testing Considerations

### Unit Tests
- Test API route handlers
- Test request validation
- Test response formatting
- Test error handling

### Integration Tests
- Test backend integration
- Test authentication flow
- Test data flow
- Test error scenarios

### E2E Tests
- Test complete API workflows
- Test user interactions
- Test error handling
- Test performance

## Development Guidelines

### Code Structure
- **Consistent Patterns**: Use consistent patterns
- **Error Handling**: Implement proper error handling
- **Type Safety**: Use TypeScript types
- **Documentation**: Document all endpoints

### Best Practices
- **RESTful Design**: Follow REST principles
- **HTTP Status Codes**: Use appropriate status codes
- **Response Format**: Use consistent response format
- **Versioning**: Implement API versioning

### Maintenance
- **Code Reviews**: Review all changes
- **Testing**: Test all changes
- **Documentation**: Keep documentation updated
- **Monitoring**: Monitor API performance
