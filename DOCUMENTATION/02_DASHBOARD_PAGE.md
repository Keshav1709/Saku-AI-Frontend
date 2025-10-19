# Dashboard Page Documentation

## Overview
- **File Path**: `/src/app/dashboard/page.tsx`
- **URL**: `/dashboard`
- **Purpose**: Main dashboard displaying user profile, tasks, schedule, AI suggestions, and activity trace
- **Type**: Client-side rendered page with dynamic content

## Page Structure

### Layout Components
- **Main Container**: `min-h-screen bg-[#f7f8f9]`
- **Sidebar**: `<MainSidebar />` component
- **Main Content**: `flex-1 p-6` with grid layout

### Visual Elements

#### 1. Header Section
```tsx
<div className="mb-8">
  <h1 className="text-3xl font-bold text-black mb-4">
    Hello, {profileData.firstName || "User"}
  </h1>
  <div className="relative">
    <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
      {/* Search icon */}
    </svg>
    <input 
      type="text" 
      placeholder="Search Gmail, Slack, Docs & Web"
      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
    />
  </div>
</div>
```

**Functionality**:
- **Dynamic Greeting**: Uses `profileData.firstName` from localStorage
- **Search Input**: Placeholder for future search functionality
- **Search Icon**: Visual indicator for search functionality

**Backend Integration**:
- **Current**: No backend calls for search
- **Future**: Connect to search API endpoint

#### 2. Quick Access Apps
```tsx
<div className="flex items-center gap-4 mt-4">
  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">M</div>
  {/* More app icons */}
</div>
```

**Functionality**:
- **Static Icons**: Currently hardcoded app representations
- **Visual Indicators**: Different colored circles for different apps
- **No Click Handlers**: Icons are not interactive

**Backend Integration**:
- **Current**: No backend integration
- **Future**: Connect to user's connected apps API

#### 3. Tasks Section
```tsx
<div className="bg-white rounded-xl border p-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-bold text-black">Tasks</h2>
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-full">
        <svg>{/* Star icon */}</svg>
        <span className="text-sm font-medium">2</span>
      </div>
      <button className="bg-black text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-black/90 transition-colors">
        + New Task
      </button>
    </div>
  </div>
</div>
```

**Functionality**:
- **Task Counter**: Shows "2" high-priority tasks
- **New Task Button**: Placeholder for task creation
- **Task List**: Displays hardcoded task items

**Backend Integration**:
- **Current**: No backend calls
- **Future**: Connect to tasks API

#### 4. Today Schedule Section
```tsx
<div className="bg-white rounded-xl border p-6">
  <h2 className="text-xl font-bold text-black mb-4">Today Schedule</h2>
  <div className="space-y-3">
    {/* Schedule items */}
  </div>
</div>
```

**Functionality**:
- **Schedule Display**: Shows hardcoded schedule items
- **Time Display**: Shows meeting times and durations
- **Participant Count**: Shows number of participants

**Backend Integration**:
- **Current**: No backend calls
- **Future**: Connect to calendar API

#### 5. AI Suggestions Section
```tsx
<div className="bg-white rounded-xl border p-6">
  <h2 className="text-xl font-bold text-black mb-4">AI Suggestions</h2>
  <div className="space-y-3">
    {/* Suggestion items */}
  </div>
</div>
```

**Functionality**:
- **Suggestion Cards**: Displays AI-generated suggestions
- **Priority Indicators**: Color-coded priority levels
- **Action Buttons**: Placeholder buttons for suggested actions

**Backend Integration**:
- **Current**: No backend calls
- **Future**: Connect to AI suggestions API

#### 6. AI Trace Section
```tsx
<div className="bg-white rounded-xl border p-6">
  <h2 className="text-xl font-bold text-black mb-4">AI Trace</h2>
  <div className="space-y-4">
    {/* Trace items */}
  </div>
</div>
```

**Functionality**:
- **Activity Log**: Shows AI activity history
- **Status Indicators**: Shows completion status
- **Timing Information**: Shows execution time
- **Source Information**: Shows data sources used

**Backend Integration**:
- **Current**: No backend calls
- **Future**: Connect to AI trace API

## State Management

### Profile Data State
```tsx
const [profileData, setProfileData] = useState<ProfileData>({
  firstName: "Romeo",
  lastName: "Saha",
  jobTitle: "",
  role: "",
  department: "",
  primaryEmail: "",
  language: "English",
  preferenceEmail: "Romeosahal2@gmail.com"
});
```

**Data Source**: localStorage with key `saku_profile`
**Update Mechanism**: Listens for storage events and custom events

### Event Listeners
```tsx
useEffect(() => {
  // Load profile data from localStorage
  const savedProfile = localStorage.getItem("saku_profile");
  if (savedProfile) {
    try {
      const data = JSON.parse(savedProfile);
      setProfileData(data);
    } catch (error) {
      console.error("Failed to parse profile data:", error);
    }
  }

  // Listen for storage changes
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "saku_profile" && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        setProfileData(data);
      } catch (error) {
        console.error("Failed to parse updated profile data:", error);
      }
    }
  };

  // Listen for custom events
  const handleProfileUpdate = (e: CustomEvent) => {
    setProfileData(e.detail);
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("profileUpdated", handleProfileUpdate as EventListener);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("profileUpdated", handleProfileUpdate as EventListener);
  };
}, []);
```

## Backend Integration

### Current Status
- **No API Calls**: All data is hardcoded or from localStorage
- **No Real-time Updates**: No WebSocket or polling connections
- **No Error Handling**: No error states for failed data loading

### Required API Endpoints

#### 1. User Profile API
```typescript
// GET /api/user/profile
interface UserProfile {
  firstName: string;
  lastName: string;
  jobTitle: string;
  role: string;
  department: string;
  primaryEmail: string;
  language: string;
  preferenceEmail: string;
}
```

#### 2. Tasks API
```typescript
// GET /api/tasks
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
}

// POST /api/tasks
interface CreateTaskRequest {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}
```

#### 3. Schedule API
```typescript
// GET /api/schedule/today
interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  duration: number;
  participants: number;
  type: 'meeting' | 'task' | 'reminder';
}
```

#### 4. AI Suggestions API
```typescript
// GET /api/ai/suggestions
interface AISuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionType: string;
  actionData: any;
}
```

#### 5. AI Trace API
```typescript
// GET /api/ai/trace
interface AITrace {
  id: string;
  query: string;
  timestamp: string;
  duration: number;
  status: 'completed' | 'failed' | 'processing';
  sources: string[];
  result: any;
}
```

### Implementation Example

```tsx
// Add to dashboard component
const [tasks, setTasks] = useState<Task[]>([]);
const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
const [trace, setTrace] = useState<AITrace[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [tasksRes, scheduleRes, suggestionsRes, traceRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/schedule/today'),
        fetch('/api/ai/suggestions'),
        fetch('/api/ai/trace')
      ]);

      const [tasksData, scheduleData, suggestionsData, traceData] = await Promise.all([
        tasksRes.json(),
        scheduleRes.json(),
        suggestionsRes.json(),
        traceRes.json()
      ]);

      setTasks(tasksData.tasks || []);
      setSchedule(scheduleData.schedule || []);
      setSuggestions(suggestionsData.suggestions || []);
      setTrace(traceData.trace || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, []);
```

## Interactive Elements

### ✅ Functional Elements
- **Profile Data Loading**: Loads from localStorage
- **Real-time Profile Updates**: Listens for storage events
- **Responsive Design**: Adapts to different screen sizes

### ❌ Non-Functional Elements
- **Search Input**: No search functionality implemented
- **Quick Access Apps**: No click handlers
- **New Task Button**: No task creation functionality
- **Task Actions**: No task completion functionality
- **Schedule Items**: No calendar integration
- **AI Suggestions**: No action handling
- **AI Trace**: No interaction capabilities

## Styling Details

### Grid Layout
```tsx
<div className="grid grid-cols-2 gap-6">
  {/* Tasks Section */}
  {/* Today Schedule Section */}
  {/* AI Suggestions Section */}
  {/* AI Trace Section */}
</div>
```

### Card Styling
- **Background**: White with rounded corners
- **Border**: Light gray border
- **Padding**: 6 units (24px)
- **Spacing**: Consistent gap between cards

### Color Scheme
- **Background**: `#f7f8f9` (light gray)
- **Cards**: White background
- **Text**: Black for headings, gray for secondary text
- **Accents**: Red for high priority, blue for low priority

## Development Notes

### Dependencies
- **React Hooks**: useState, useEffect
- **Next.js**: useRouter for navigation
- **MainSidebar**: Custom component

### Performance Considerations
- **No Memoization**: Components re-render on every state change
- **No Lazy Loading**: All content loads at once
- **No Virtualization**: Long lists could impact performance

### Accessibility
- **Semantic HTML**: Proper heading hierarchy
- **Color Contrast**: Meets WCAG standards
- **Focus Management**: Default browser focus behavior

## Future Enhancements

### Recommended Features
1. **Real-time Updates**: WebSocket connections for live data
2. **Search Functionality**: Implement search across all data sources
3. **Task Management**: Full CRUD operations for tasks
4. **Calendar Integration**: Connect to Google Calendar
5. **AI Integration**: Connect to AI suggestions and trace APIs
6. **Customization**: Allow users to customize dashboard layout
7. **Notifications**: Real-time notifications for important updates

### Example Implementation
```tsx
// Add search functionality
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);

const handleSearch = async (query: string) => {
  if (!query.trim()) return;
  
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    setSearchResults(data.results);
  } catch (error) {
    console.error('Search failed:', error);
  }
};

// Add task creation
const handleCreateTask = async (taskData: CreateTaskRequest) => {
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    
    if (response.ok) {
      const newTask = await response.json();
      setTasks(prev => [newTask, ...prev]);
    }
  } catch (error) {
    console.error('Failed to create task:', error);
  }
};
```

## Testing Considerations

### Unit Tests
- Test profile data loading from localStorage
- Test event listener setup and cleanup
- Test component rendering with different data states

### Integration Tests
- Test profile data updates across components
- Test localStorage synchronization
- Test responsive behavior

### E2E Tests
- Test complete user journey from login to dashboard
- Test profile updates from settings page
- Test dashboard data loading and display
