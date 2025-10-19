# Components Documentation

## Overview
- **Location**: `/src/components/`
- **Purpose**: Reusable UI components
- **Type**: React functional components with TypeScript

## Component Structure

### 1. MainSidebar Component
- **File Path**: `/src/components/MainSidebar.tsx`
- **Purpose**: Main navigation sidebar
- **Usage**: Used across all main pages

### 2. Sidebar Component
- **File Path**: `/src/components/Sidebar.tsx`
- **Purpose**: Secondary sidebar (likely for chat)
- **Usage**: Used in chat interface

### 3. TopNav Component
- **File Path**: `/src/components/TopNav.tsx`
- **Purpose**: Top navigation bar
- **Usage**: Used across all pages

## Detailed Component Documentation

### 1. MainSidebar Component

#### Purpose
Provides main navigation for the application with session management for chat functionality.

#### Props Interface
```typescript
interface MainSidebarProps {
  selectedId?: string;
  onNew?: () => void;
  onSelect?: (id: string) => void;
}
```

#### Functionality
- **Navigation Items**: Dashboard, Chat, Documents, Upload, Settings
- **Session Management**: For chat sessions
- **Active State**: Highlights current page
- **New Session**: Creates new chat session
- **Session Selection**: Switches between chat sessions

#### Navigation Items
```typescript
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    current: false
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: 'chat',
    current: false
  },
  {
    name: 'Documents',
    href: '/docs',
    icon: 'documents',
    current: false
  },
  {
    name: 'Upload',
    href: '/upload',
    icon: 'upload',
    current: false
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: 'settings',
    current: false
  }
];
```

#### Session Management
```typescript
// Load sessions from localStorage
const [sessions, setSessions] = useState<Session[]>([]);

useEffect(() => {
  const savedSessions = localStorage.getItem('saku_sessions');
  if (savedSessions) {
    setSessions(JSON.parse(savedSessions));
  }
}, []);

// Handle new session
const handleNewSession = () => {
  const newSession = {
    id: crypto.randomUUID(),
    title: 'New Chat',
    createdAt: new Date().toISOString()
  };
  
  const updatedSessions = [newSession, ...sessions];
  setSessions(updatedSessions);
  localStorage.setItem('saku_sessions', JSON.stringify(updatedSessions));
  
  onNew?.();
};
```

#### Styling
- **Container**: Fixed width sidebar with background
- **Navigation**: Vertical list with icons and text
- **Active State**: Highlighted current page
- **Sessions**: Collapsible session list
- **Responsive**: Hidden on mobile, visible on desktop

### 2. Sidebar Component

#### Purpose
Secondary sidebar for chat interface with session management.

#### Props Interface
```typescript
interface SidebarProps {
  selectedId?: string;
  onNew?: () => void;
  onSelect?: (id: string) => void;
}
```

#### Functionality
- **Session List**: Shows chat sessions
- **New Chat**: Creates new chat session
- **Session Selection**: Switches between sessions
- **Session Management**: Add, remove, rename sessions

#### Session Display
```typescript
{sessions.map((session) => (
  <div
    key={session.id}
    onClick={() => onSelect?.(session.id)}
    className={`p-3 rounded-lg cursor-pointer transition-colors ${
      selectedId === session.id
        ? 'bg-gray-100 text-black'
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <div className="font-medium text-sm">{session.title}</div>
    <div className="text-xs text-gray-500">
      {new Date(session.createdAt).toLocaleDateString()}
    </div>
  </div>
))}
```

#### Styling
- **Session Items**: Rounded cards with hover effects
- **Active State**: Highlighted selected session
- **Typography**: Different font weights for title and date
- **Spacing**: Consistent padding and margins

### 3. TopNav Component

#### Purpose
Top navigation bar with user profile and notifications.

#### Props Interface
```typescript
interface TopNavProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  notifications?: Notification[];
  onLogout?: () => void;
}
```

#### Functionality
- **User Profile**: Display user information
- **Notifications**: Show notification count
- **Logout**: Handle user logout
- **Search**: Global search functionality

#### User Profile
```typescript
<div className="flex items-center gap-3">
  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
    {user?.avatar ? (
      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
    ) : (
      <span className="text-sm font-medium text-gray-600">
        {user?.name?.charAt(0) || 'U'}
      </span>
    )}
  </div>
  <div>
    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
    <div className="text-xs text-gray-500">{user?.email}</div>
  </div>
</div>
```

#### Notifications
```typescript
<div className="relative">
  <button className="p-2 text-gray-400 hover:text-gray-600 relative">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5h-5m-6 0H4l5 5-5 5h5" />
    </svg>
    {notifications && notifications.length > 0 && (
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
        {notifications.length}
      </span>
    )}
  </button>
</div>
```

#### Styling
- **Container**: Full width with background
- **Layout**: Flex layout with space between
- **User Profile**: Avatar and user info
- **Notifications**: Bell icon with count badge
- **Responsive**: Adapts to different screen sizes

## Component Usage Examples

### 1. Using MainSidebar
```tsx
import { MainSidebar } from '@/components/MainSidebar';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#f7f8f9]">
      <div className="flex">
        <MainSidebar />
        <main className="flex-1 p-6">
          {/* Page content */}
        </main>
      </div>
    </div>
  );
}
```

### 2. Using Sidebar for Chat
```tsx
import { Sidebar } from '@/components/Sidebar';

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState<string>();
  
  const handleNewSession = () => {
    // Create new chat session
  };
  
  const handleSelectSession = (id: string) => {
    setSelectedId(id);
    // Load session messages
  };
  
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar
        selectedId={selectedId}
        onNew={handleNewSession}
        onSelect={handleSelectSession}
      />
      <main className="flex-1 flex flex-col">
        {/* Chat content */}
      </main>
    </div>
  );
}
```

### 3. Using TopNav
```tsx
import { TopNav } from '@/components/TopNav';

export default function Layout() {
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatar.jpg'
  };
  
  const notifications = [
    { id: '1', message: 'New message', read: false },
    { id: '2', message: 'Task completed', read: true }
  ];
  
  const handleLogout = () => {
    // Handle logout
  };
  
  return (
    <div className="min-h-screen">
      <TopNav
        user={user}
        notifications={notifications}
        onLogout={handleLogout}
      />
      {/* Page content */}
    </div>
  );
}
```

## Styling Guidelines

### Design System
- **Colors**: Consistent color palette
- **Typography**: Consistent font sizes and weights
- **Spacing**: Consistent spacing scale
- **Borders**: Consistent border radius and colors

### Responsive Design
- **Mobile**: Stacked layout, hidden sidebar
- **Tablet**: Collapsible sidebar
- **Desktop**: Full sidebar visible

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Color Contrast**: WCAG compliant colors
- **Focus States**: Clear focus indicators

## State Management

### Local State
- **useState**: For component state
- **useEffect**: For side effects
- **useCallback**: For memoized functions
- **useMemo**: For computed values

### Global State
- **localStorage**: For persistent data
- **Context API**: For shared state
- **Custom Hooks**: For reusable logic

### Data Flow
- **Props Down**: Pass data down via props
- **Events Up**: Pass events up via callbacks
- **Context**: Share data across components

## Performance Considerations

### Optimization
- **React.memo**: Memoize components
- **useCallback**: Memoize functions
- **useMemo**: Memoize values
- **Lazy Loading**: Load components on demand

### Bundle Size
- **Tree Shaking**: Remove unused code
- **Code Splitting**: Split code by route
- **Dynamic Imports**: Import components dynamically

### Rendering
- **Virtual Scrolling**: For long lists
- **Debouncing**: For search inputs
- **Throttling**: For scroll events

## Testing Considerations

### Unit Tests
- Test component rendering
- Test prop handling
- Test event handlers
- Test state updates

### Integration Tests
- Test component interactions
- Test data flow
- Test user interactions
- Test error handling

### E2E Tests
- Test complete user flows
- Test responsive behavior
- Test accessibility
- Test performance

## Development Guidelines

### Code Structure
- **Single Responsibility**: One purpose per component
- **Composition**: Compose complex components
- **Reusability**: Make components reusable
- **Maintainability**: Keep components maintainable

### Best Practices
- **TypeScript**: Use TypeScript for type safety
- **Props Interface**: Define clear prop interfaces
- **Default Props**: Provide sensible defaults
- **Error Boundaries**: Handle errors gracefully

### Documentation
- **JSDoc**: Document component props
- **Examples**: Provide usage examples
- **Storybook**: Create component stories
- **README**: Document component purpose
