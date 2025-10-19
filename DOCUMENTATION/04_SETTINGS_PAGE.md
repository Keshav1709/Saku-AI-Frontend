# Settings Page Documentation

## Overview
- **File Path**: `/src/app/settings/page.tsx`
- **URL**: `/settings`
- **Purpose**: Comprehensive settings management including profile, integrations, monitoring, notifications, and more
- **Type**: Client-side rendered page with multiple tabs and real-time updates

## Page Structure

### Layout Components
- **Main Container**: `min-h-screen bg-[#f7f8f9]`
- **Sidebar**: `<MainSidebar />` component
- **Main Content**: `flex-1 p-6` with tabbed interface

### Tab System
```tsx
type SettingsTab = "profile" | "integrations" | "monitoring" | "notifications" | "tags" | "billing" | "policies" | "advanced";

const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
```

**Available Tabs**:
1. **Profile** - User profile management
2. **Integrations** - Third-party service connections
3. **Monitoring** - Activity monitoring settings
4. **Notifications** - Notification preferences
5. **Tags** - Tag management
6. **Billing** - Billing and subscription
7. **Policies** - Privacy and security policies
8. **Advanced** - Advanced configuration

## Tab 1: Profile Management

### Profile Data State
```tsx
const [profileData, setProfileData] = useState({
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

### Profile Photo Management
```tsx
const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
const [photoFile, setPhotoFile] = useState<File | null>(null);
```

**Functionality**:
- **Photo Upload**: File input for profile photo
- **Photo Preview**: Shows selected photo before saving
- **Photo Storage**: Stores photo in localStorage

### Profile Form Fields
```tsx
<div className="space-y-6">
  <div className="grid grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
      <input
        type="text"
        value={profileData.firstName}
        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
      />
    </div>
    {/* More fields */}
  </div>
</div>
```

**Form Fields**:
- **First Name** - Text input
- **Last Name** - Text input
- **Job Title** - Text input
- **Role** - Text input
- **Department** - Text input
- **Primary Email** - Email input
- **Language** - Dropdown selection
- **Preference Email** - Email input

### Profile Data Persistence
```tsx
const saveProfile = () => {
  localStorage.setItem("saku_profile", JSON.stringify(profileData));
  
  // Dispatch custom event for real-time updates
  const event = new CustomEvent("profileUpdated", { detail: profileData });
  window.dispatchEvent(event);
};
```

**Backend Integration**:
- **Current**: localStorage only
- **Future**: Connect to user profile API

## Tab 2: Integrations Management

### Integration State
```tsx
const [integrations, setIntegrations] = useState<Integration[]>([]);
const [loading, setLoading] = useState(false);
const [debugInfo, setDebugInfo] = useState<any>(null);
const [connectionStatus, setConnectionStatus] = useState<{[key: string]: string}>({});
const [fetchedData, setFetchedData] = useState<{[key: string]: any}>({});
```

### Integration Types
```tsx
type Integration = {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
};
```

**Available Integrations**:
- **Gmail** - Email service
- **Google Drive** - File storage
- **Google Calendar** - Calendar service
- **Slack** - Team communication
- **Discord** - Community communication
- **Notion** - Note-taking and collaboration

### Integration Categories
```tsx
{/* Communication Section */}
<div className="mb-8">
  <h3 className="text-base font-semibold mb-1">Communication</h3>
  <p className="text-sm text-neutral-700 mb-4">Connect messaging, email, and video conferencing tools.</p>
  <div className="space-y-3">
    {integrations.filter(int => ["gmail", "slack", "discord"].includes(int.id)).map(integration => (
      // Integration card
    ))}
  </div>
</div>
```

**Categories**:
1. **Communication** - Gmail, Slack, Discord
2. **Productivity** - Calendar, Notion
3. **Storage** - Google Drive

### Integration Connection Flow
```tsx
const toggleIntegration = async (integrationId: string) => {
  setLoading(true);
  
  try {
    if (integrations.find(int => int.id === integrationId)?.connected) {
      // Disconnect integration
      await fetch(`/api/connectors/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_type: integrationId })
      });
    } else {
      // Connect integration
      const response = await fetch(`/api/connectors/${integrationId}/auth-url`);
      const data = await response.json();
      window.location.href = data.url;
    }
    
    // Refresh integrations
    await loadIntegrations();
  } catch (error) {
    console.error('Integration toggle failed:', error);
  } finally {
    setLoading(false);
  }
};
```

**Backend Integration**:
- **Auth URL**: `/api/connectors/{service}/auth-url`
- **Toggle Connection**: `/api/connectors/toggle`
- **OAuth Callback**: Handled by backend

### Integration Testing
```tsx
const testIntegration = async (service: string) => {
  try {
    const response = await fetch(`/api/integrations?service=${service}&type=messages`);
    const data = await response.json();
    
    setFetchedData(prev => ({
      ...prev,
      [service]: data
    }));
    
    setConnectionStatus(prev => ({
      ...prev,
      [service]: 'success'
    }));
  } catch (error) {
    setConnectionStatus(prev => ({
      ...prev,
      [service]: 'error'
    }));
  }
};
```

**Test Functionality**:
- **Gmail**: Tests message fetching
- **Drive**: Tests file listing
- **Calendar**: Tests event fetching

## Tab 3: Monitoring Settings

### Monitoring State
```tsx
const [monitoringSettings, setMonitoringSettings] = useState({
  timeTracking: true,
  appUsageMonitoring: false,
  contextAwareness: true,
  smartSuggestions: true
});
```

### Monitoring Toggle Controls
```tsx
<button
  onClick={() => toggleMonitoring("timeTracking")}
  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
    monitoringSettings.timeTracking ? 'bg-black' : 'bg-neutral-300'
  }`}
>
  <span
    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
      monitoringSettings.timeTracking ? 'translate-x-6' : 'translate-x-1'
    }`}
  />
</button>
```

**Monitoring Features**:
- **Time Tracking** - Track time spent on activities
- **App Usage Monitoring** - Monitor application usage
- **Context Awareness** - AI context understanding
- **Smart Suggestions** - AI-powered suggestions

## Tab 4: Notifications Settings

### Notification State
```tsx
const [notificationSettings, setNotificationSettings] = useState({
  dailySummaries: true,
  productUpdates: true,
  accountInfo: true
});
```

**Notification Types**:
- **Daily Summaries** - Daily activity summaries
- **Product Updates** - New feature announcements
- **Account Info** - Account-related notifications

## Tab 5: Tags Management

### Tags State
```tsx
const [tags, setTags] = useState<string[]>([]);
const [newTag, setNewTag] = useState("");
```

**Tag Functionality**:
- **Add Tags** - Create new tags
- **Remove Tags** - Delete existing tags
- **Tag Display** - Show all available tags

## Tab 6: Billing Settings

### Billing Information
```tsx
<div className="space-y-6">
  <div className="bg-white rounded-xl border p-6">
    <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">Pro Plan</p>
        <p className="text-sm text-gray-600">$29/month</p>
      </div>
      <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors">
        Change Plan
      </button>
    </div>
  </div>
</div>
```

**Billing Features**:
- **Plan Display** - Current subscription plan
- **Usage Statistics** - Usage metrics and limits
- **Payment Methods** - Manage payment information
- **Billing History** - View past invoices

## Tab 7: Policies Settings

### Policy State
```tsx
const [policySettings, setPolicySettings] = useState({
  externalWrites: true,
  highValueActions: true,
  newWorkflows: true,
  sensitiveData: true
});
```

**Policy Types**:
- **External Writes** - Allow writing to external services
- **High Value Actions** - Require confirmation for important actions
- **New Workflows** - Auto-approve new workflow creation
- **Sensitive Data** - Handle sensitive data with extra care

## Tab 8: Advanced Settings

### Advanced Configuration
```tsx
<div className="space-y-6">
  <div className="bg-white rounded-xl border p-6">
    <h3 className="text-lg font-semibold mb-4">API Configuration</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
        <input
          type="password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="Enter your API key"
        />
      </div>
    </div>
  </div>
</div>
```

**Advanced Features**:
- **API Configuration** - Manage API keys and endpoints
- **Debug Settings** - Enable debug mode and logging
- **Data Export** - Export user data
- **Account Deletion** - Delete account permanently

## Backend Integration

### Current API Endpoints

#### 1. Integrations API
```typescript
// GET /api/connectors
interface ConnectorsResponse {
  connectors: {
    key: string;
    name: string;
    connected: boolean;
  }[];
}

// GET /api/connectors/{service}/auth-url
interface AuthUrlResponse {
  url: string;
  state: string;
}

// POST /api/connectors/toggle
interface ToggleRequest {
  service_type: string;
}
```

#### 2. Integration Data API
```typescript
// GET /api/integrations?service={service}&type={type}
interface IntegrationDataResponse {
  data: any[];
  success: boolean;
  error?: string;
}
```

### Required Backend Endpoints

#### 1. Profile Management API
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
  profilePhoto?: string;
}

// PUT /api/user/profile
interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  role?: string;
  department?: string;
  primaryEmail?: string;
  language?: string;
  preferenceEmail?: string;
  profilePhoto?: string;
}
```

#### 2. Settings API
```typescript
// GET /api/user/settings
interface UserSettings {
  monitoring: {
    timeTracking: boolean;
    appUsageMonitoring: boolean;
    contextAwareness: boolean;
    smartSuggestions: boolean;
  };
  notifications: {
    dailySummaries: boolean;
    productUpdates: boolean;
    accountInfo: boolean;
  };
  policies: {
    externalWrites: boolean;
    highValueActions: boolean;
    newWorkflows: boolean;
    sensitiveData: boolean;
  };
}

// PUT /api/user/settings
interface UpdateSettingsRequest {
  monitoring?: Partial<UserSettings['monitoring']>;
  notifications?: Partial<UserSettings['notifications']>;
  policies?: Partial<UserSettings['policies']>;
}
```

#### 3. Tags API
```typescript
// GET /api/user/tags
interface TagsResponse {
  tags: string[];
}

// POST /api/user/tags
interface AddTagRequest {
  tag: string;
}

// DELETE /api/user/tags/{tag}
interface DeleteTagResponse {
  success: boolean;
}
```

#### 4. Billing API
```typescript
// GET /api/billing/plan
interface BillingPlan {
  plan: string;
  price: number;
  currency: string;
  features: string[];
  usage: {
    current: number;
    limit: number;
  };
}

// GET /api/billing/invoices
interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
}
```

## Interactive Elements

### ✅ Functional Elements
- **Profile Form**: All form fields are functional
- **Integration Toggle**: Connect/disconnect integrations
- **Integration Testing**: Test connection status
- **Settings Toggles**: All toggle switches work
- **Tab Navigation**: Switch between different settings tabs
- **Profile Photo Upload**: File selection and preview
- **Real-time Updates**: Profile changes update across components

### ❌ Non-Functional Elements
- **Profile Photo Save**: Photo not saved to backend
- **Settings Persistence**: Settings not saved to backend
- **Billing Actions**: Change plan, payment methods not functional
- **Data Export**: Export functionality not implemented
- **Account Deletion**: Delete account not implemented
- **API Key Management**: API keys not validated or saved

## OAuth Integration

### OAuth Callback Handling
```tsx
useEffect(() => {
  // Check for OAuth callback parameters
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get('error');
  const connected = urlParams.get('connected');
  const state = urlParams.get('state');
  
  if (error) {
    console.log('DEBUG: OAuth error detected:', error);
    setDebugInfo({
      type: 'error',
      message: `OAuth Error: ${error}`,
      state: state,
      timestamp: new Date().toISOString()
    });
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  } else if (connected) {
    console.log('DEBUG: OAuth success detected:', connected);
    setDebugInfo({
      type: 'success',
      message: `Successfully connected to ${connected}`,
      state: state,
      timestamp: new Date().toISOString()
    });
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);
```

**OAuth Flow**:
1. User clicks "Connect" on integration
2. Redirected to OAuth provider
3. User authorizes application
4. Redirected back to settings page
5. Success/error status displayed
6. Integration status updated

## Styling Details

### Tab Navigation
```tsx
<div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tab.id
          ? 'bg-white text-black shadow-sm'
          : 'text-gray-600 hover:text-black'
      }`}
    >
      {tab.name}
    </button>
  ))}
</div>
```

### Form Styling
- **Input Fields**: Gray border with focus ring
- **Labels**: Medium font weight, gray color
- **Buttons**: Black background with hover effects
- **Cards**: White background with rounded corners

### Integration Cards
```tsx
<div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-xl">
      {integration.icon}
    </div>
    <div>
      <div className="flex items-center gap-2">
        <h4 className="font-medium text-sm">{integration.name}</h4>
        {integration.connected && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
            Connected
          </span>
        )}
      </div>
      <p className="text-xs text-neutral-700">{integration.description}</p>
    </div>
  </div>
  {/* Action buttons */}
</div>
```

## Development Notes

### Dependencies
- **React Hooks**: useState, useEffect
- **Next.js**: useRouter for navigation
- **MainSidebar**: Custom sidebar component
- **File API**: File upload handling

### Performance Considerations
- **Large Forms**: Consider splitting into smaller components
- **Real-time Updates**: Optimize re-renders
- **File Uploads**: Implement progress indicators
- **API Calls**: Debounce frequent requests

### Security Considerations
- **Input Validation**: Validate all form inputs
- **File Upload**: Validate file types and sizes
- **XSS Prevention**: Escape user content
- **CSRF Protection**: Implement CSRF tokens

## Future Enhancements

### Recommended Features
1. **Real-time Sync**: Sync settings across devices
2. **Bulk Operations**: Bulk edit integrations
3. **Import/Export**: Import/export settings
4. **Advanced Search**: Search through settings
5. **Audit Log**: Track settings changes
6. **Two-Factor Auth**: Enhanced security
7. **API Documentation**: Built-in API docs
8. **Webhook Management**: Manage webhooks

### Example Implementation
```tsx
// Add real-time sync
useEffect(() => {
  const syncSettings = async () => {
    try {
      const response = await fetch('/api/user/settings');
      const settings = await response.json();
      setMonitoringSettings(settings.monitoring);
      setNotificationSettings(settings.notifications);
      setPolicySettings(settings.policies);
    } catch (error) {
      console.error('Failed to sync settings:', error);
    }
  };

  syncSettings();
}, []);

// Add settings persistence
const saveSettings = async (settings: any) => {
  try {
    await fetch('/api/user/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};
```

## Testing Considerations

### Unit Tests
- Test form field updates
- Test integration toggle logic
- Test settings persistence
- Test OAuth callback handling

### Integration Tests
- Test API integration
- Test OAuth flow
- Test file upload
- Test real-time updates

### E2E Tests
- Test complete settings workflow
- Test integration connection flow
- Test profile update flow
- Test error handling
