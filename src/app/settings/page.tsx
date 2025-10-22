"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { MainSidebar } from "@/components/MainSidebar";

type SettingsTab = "profile" | "integrations" | "monitoring" | "notifications" | "tags" | "billing" | "policies" | "advanced";

type Integration = {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    jobTitle: "",
    role: "",
    department: "",
    language: "English",
    preferenceEmail: "",
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<{[key: string]: string}>({});
  const [fetchedData, setFetchedData] = useState<{[key: string]: any}>({});

  const [monitoringSettings, setMonitoringSettings] = useState({
    timeTracking: true,
    appUsageMonitoring: false,
    contextAwareness: true,
    smartSuggestions: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    dailySummaries: true,
    productUpdates: true,
    accountInfo: true
  });

  const [policySettings, setPolicySettings] = useState({
    externalWrites: true,
    highValueActions: true,
    newWorkflows: true,
    sensitiveData: true
  });

  useEffect(() => {
    if (isPending) return;
    
    if (!session) {
      router.replace("/login");
      return;
    }

    // Load user data from database
    loadProfileData();

    // Load monitoring settings
    const savedMonitoring = localStorage.getItem("saku_monitoring");
    if (savedMonitoring) {
      try {
        const data = JSON.parse(savedMonitoring);
        setMonitoringSettings(data);
      } catch {}
    }

    // Load notification settings
    const savedNotifications = localStorage.getItem("saku_notifications");
    if (savedNotifications) {
      try {
        const data = JSON.parse(savedNotifications);
        setNotificationSettings(data);
      } catch {}
    }

    // Load policy settings
    const savedPolicies = localStorage.getItem("saku_policies");
    if (savedPolicies) {
      try {
        const data = JSON.parse(savedPolicies);
        setPolicySettings(data);
      } catch {}
    }

    // Load integrations
    loadIntegrations();
  }, [session, isPending, router]);

  const loadProfileData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        
        // Extract first and last name from the full name
        const nameParts = user.name ? user.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        setProfileData({
          name: user.name || "",
          email: user.email || "",
          jobTitle: "",
          role: "",
          department: "",
          language: "English",
          preferenceEmail: "",
        });
        
        if (user.avatar) {
          setProfilePhoto(user.avatar);
        }
      } else {
        console.error('Failed to load profile data');
        // Fallback to session data
        if (session?.user) {
          // Extract first and last name from the full name
          const nameParts = session.user.name ? session.user.name.split(' ') : ['', ''];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          setProfileData({
            name: session.user.name || "",
            email: session.user.email || "",
            jobTitle: "",
            role: "",
            department: "",
            language: "English",
            preferenceEmail: "",
          });
          
          if (session.user.image) {
            setProfilePhoto(session.user.image);
          }
        }
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      // Fallback to session data
      if (session?.user) {
        // Extract first and last name from the full name
        const nameParts = session.user.name ? session.user.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        setProfileData({
          name: session.user.name || "",
          email: session.user.email || "",
          jobTitle: "",
          role: "",
          department: "",
          language: "English",
          preferenceEmail: "",
        });
        
        if (session.user.image) {
          setProfilePhoto(session.user.image);
        }
      }
    }
  };

  const loadIntegrations = async () => {
    // Check connection status for Google services
    const googleServices = ['gmail', 'drive', 'calendar', 'tasks'];
    const connectionChecks = await Promise.allSettled(
      googleServices.map(async (service) => {
        try {
          const response = await fetch(`/api/integrations/${service}`);
          return { service, connected: response.ok };
        } catch {
          return { service, connected: false };
        }
      })
    );

    const connectionStatusMap: { [key: string]: boolean } = {};
    connectionChecks.forEach((result) => {
      if (result.status === 'fulfilled') {
        connectionStatusMap[result.value.service] = result.value.connected;
      }
    });

    const mockIntegrations = [
      { id: 'gmail', name: 'Gmail', description: 'Access your Gmail messages and data', icon: '📧', connected: connectionStatusMap.gmail || false },
      { id: 'drive', name: 'Google Drive', description: 'Access your Google Drive files and folders', icon: '📁', connected: connectionStatusMap.drive || false },
      { id: 'calendar', name: 'Google Calendar', description: 'Access your Google Calendar events', icon: '📅', connected: connectionStatusMap.calendar || false },
      { id: 'tasks', name: 'Google Tasks', description: 'Manage your Google Tasks and to-do lists', icon: '✅', connected: connectionStatusMap.tasks || false },
      { id: 'slack', name: 'Slack', description: 'Connect to your Slack workspace', icon: '💬', connected: false },
      { id: 'notion', name: 'Notion', description: 'Access your Notion workspace', icon: '📝', connected: false },
      { id: 'discord', name: 'Discord', description: 'Connect to Discord servers', icon: '🎮', connected: false }
    ];
    setIntegrations(mockIntegrations);
  };

  const getIntegrationDescription = (key: string) => {
    const descriptions: { [key: string]: string } = {
      'gmail': 'Access your Gmail messages and data',
      'drive': 'Access your Google Drive files and folders',
      'calendar': 'Access your Google Calendar events',
      'tasks': 'Manage your Google Tasks and to-do lists',
      'slack': 'Connect to your Slack workspace',
      'notion': 'Access your Notion workspace',
      'discord': 'Connect to Discord servers'
    };
    return descriptions[key] || 'Integration description';
  };

  const getIntegrationIcon = (key: string) => {
    const icons: { [key: string]: string } = {
      'gmail': '📧',
      'drive': '📁',
      'calendar': '📅',
      'tasks': '✅',
      'slack': '💬',
      'notion': '📝',
      'discord': '🎮'
    };
    return icons[key] || '🔗';
  };

  const testConnection = async (serviceType: string) => {
    setLoading(true);
    setConnectionStatus(prev => ({ ...prev, [serviceType]: 'testing' }));
    
    try {
      const response = await fetch(`/api/integrations/${serviceType}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setConnectionStatus(prev => ({ 
          ...prev, 
          [serviceType]: `connected (${data.totalCount || 0} items)` 
        }));
        
        // Store fetched data for display
        if (serviceType === 'gmail') {
          setFetchedData(prev => ({ ...prev, gmail: data }));
        } else if (serviceType === 'drive') {
          setFetchedData(prev => ({ ...prev, drive: data }));
        } else if (serviceType === 'calendar') {
          setFetchedData(prev => ({ ...prev, calendar: data }));
        }
        
        setDebugInfo({
          type: 'success',
          message: `Successfully connected to ${serviceType}. Found ${data.totalCount || 0} items.`,
          timestamp: new Date().toISOString()
        });
      } else {
        setConnectionStatus(prev => ({ 
          ...prev, 
          [serviceType]: data.needsReauth ? 'needs_reauth' : 'error' 
        }));
        
        setDebugInfo({
          type: 'error',
          message: data.error || `Failed to connect to ${serviceType}`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [serviceType]: 'error' }));
      setDebugInfo({
        type: 'error',
        message: `Network error connecting to ${serviceType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePhoto(result);
        localStorage.setItem("saku_profile_photo", result);
        // Dispatch custom event for real-time updates within the same tab
        window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { detail: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setPhotoFile(null);
    localStorage.removeItem("saku_profile_photo");
    // Dispatch custom event for real-time updates within the same tab
    window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { detail: null }));
  };

  const handleInputChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!session?.user?.email) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          name: profileData.name,
          avatar: profilePhoto,
        }),
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Reload profile data from database
        await loadProfileData();
        
        // Extract first and last name from the full name for localStorage
        const nameParts = profileData.name ? profileData.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const updatedProfileData = {
          firstName,
          lastName,
          jobTitle: profileData.jobTitle,
          role: profileData.role,
          department: profileData.department,
          primaryEmail: session.user.email || "",
          language: profileData.language,
          preferenceEmail: profileData.preferenceEmail
        };
        
        // Update localStorage
        localStorage.setItem("saku_profile", JSON.stringify(updatedProfileData));
        
        // Dispatch custom events for real-time updates
        window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedProfileData }));
        window.dispatchEvent(new CustomEvent('profileRefresh'));
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    // Reload profile data from database to cancel changes
    await loadProfileData();
    setMessage(null);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  const toggleIntegration = async (id: string) => {
    if (['gmail', 'drive', 'calendar', 'tasks'].includes(id)) {
      // For Google services, test the connection
      await testConnection(id);
    } else {
      // For other services, show placeholder
      setDebugInfo({
        type: 'info',
        message: `Integration toggle for ${id} - OAuth logic moved to external location`,
        timestamp: new Date().toISOString()
      });
    }
  };

  const toggleMonitoring = (setting: keyof typeof monitoringSettings) => {
    setMonitoringSettings(prev => {
      const updated = { ...prev, [setting]: !prev[setting] };
      localStorage.setItem("saku_monitoring", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleNotification = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => {
      const updated = { ...prev, [setting]: !prev[setting] };
      localStorage.setItem("saku_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const togglePolicy = (setting: keyof typeof policySettings) => {
    setPolicySettings(prev => {
      const updated = { ...prev, [setting]: !prev[setting] };
      localStorage.setItem("saku_policies", JSON.stringify(updated));
      return updated;
    });
  };

  const navItems = [
    { key: "profile" as SettingsTab, label: "Profile & Account" },
    { key: "integrations" as SettingsTab, label: "Integrations" },
    { key: "monitoring" as SettingsTab, label: "Monitoring" },
    { key: "notifications" as SettingsTab, label: "Notifications" },
    { key: "tags" as SettingsTab, label: "Tags" },
    { key: "billing" as SettingsTab, label: "Payment & Billing" },
    { key: "policies" as SettingsTab, label: "Policies" },
    { key: "advanced" as SettingsTab, label: "Advanced" }
  ];

  return (
    <div className="min-h-screen bg-[#f7f8f9] flex">
      <MainSidebar />
      <div className="flex-1 flex">
        {/* Settings Sidebar Navigation */}
        <aside className="w-64 bg-white border-r p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">Account Settings</h1>
            <p className="text-sm text-neutral-700">Create workflow for making your work smoother</p>
          </div>
          <nav className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeTab === item.key
                    ? "bg-[#e5e7eb] text-black font-medium"
                    : "text-black hover:bg-black/5"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white p-6 lg:p-8">
            {activeTab === "profile" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-2">Profile & Account</h2>
                  <p className="text-sm text-neutral-700">Manage your personal information, preferences, and account settings.</p>
                </div>

                {/* Account Information Section */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold mb-1">Account Information</h3>
                  <p className="text-sm text-neutral-700 mb-6">Update your personal details and preferences.</p>

                  {/* Profile Photo */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">Profile Photo</label>
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        {profilePhoto ? (
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neutral-200 bg-neutral-100">
                            <Image
                              src={profilePhoto}
                              alt="Profile"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center border-2 border-neutral-300">
                            <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full border border-neutral-300 flex items-center justify-center">
                          <svg className="w-3 h-3 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-700 mb-2">This will be displayed on your profile.</p>
                        <div className="flex gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 rounded text-sm hover:bg-neutral-50 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Change
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoChange}
                              className="hidden"
                            />
                          </label>
                          {profilePhoto && (
                            <button
                              onClick={handleRemovePhoto}
                              className="px-3 py-1.5 text-sm text-neutral-700 hover:text-red-600 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Display Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1.5">Display Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                      placeholder="Your Name"
                    />
                  </div>

                  {/* Job Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1.5">Job Title</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileData.jobTitle}
                        onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                        className="w-full border border-neutral-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                        placeholder="e.g : Product Designer"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Role & Department */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Role</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={profileData.role}
                          onChange={(e) => handleInputChange("role", e.target.value)}
                          className="w-full border border-neutral-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                          placeholder="e.g : Executive"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Department</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={profileData.department}
                          onChange={(e) => handleInputChange("department", e.target.value)}
                          className="w-full border border-neutral-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                          placeholder="e.g : Information Technology"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Primary Email */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1.5">Primary Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full border border-neutral-300 rounded px-3 py-2 pr-10 text-sm bg-neutral-50 text-neutral-500 cursor-not-allowed"
                        placeholder="Your email address"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                        (from Google)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preferences Section */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold mb-4">Preferences</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Languages</label>
                      <div className="relative">
                        <select
                          value={profileData.language}
                          onChange={(e) => handleInputChange("language", e.target.value)}
                          className="w-full border border-neutral-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white appearance-none"
                        >
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                          <option>Chinese</option>
                          <option>Japanese</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Primary Email</label>
                      <input
                        type="email"
                        value={profileData.preferenceEmail}
                        onChange={(e) => handleInputChange("preferenceEmail", e.target.value)}
                        className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                        placeholder="Romeosahal2@gmail.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Message Display */}
                {message && (
                  <div className={`mb-4 p-3 rounded text-sm ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {message.text}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-neutral-500">Update your profile information</p>
                    <button
                      onClick={handleSignOut}
                      className="text-xs text-red-600 hover:text-red-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="px-4 py-2 border border-neutral-300 rounded text-sm hover:bg-neutral-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={isLoading}
                      className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-black/90 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === "integrations" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-2">Integrations</h2>
                  <p className="text-sm text-neutral-700">Connect and manage integrations with your favorite apps and services.</p>
                </div>

                {/* Debug Widget */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    🔧 Debug Information
                    <button 
                      onClick={() => setDebugInfo(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </h3>
                  
                  {debugInfo && (
                    <div className={`p-3 rounded mb-3 ${
                      debugInfo.type === 'error' ? 'bg-red-50 border border-red-200' :
                      debugInfo.type === 'success' ? 'bg-green-50 border border-green-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${
                          debugInfo.type === 'error' ? 'bg-red-500' :
                          debugInfo.type === 'success' ? 'bg-green-500' :
                          'bg-blue-500'
                        }`}></span>
                        <span className="font-medium">{debugInfo.message}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Time: {new Date(debugInfo.timestamp).toLocaleString()}</div>
                        {debugInfo.state && <div>State: {debugInfo.state}</div>}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Connection Status:</h4>
                    {Object.keys(connectionStatus).length === 0 ? (
                      <p className="text-sm text-gray-500">No connection tests performed yet</p>
                    ) : (
                      Object.entries(connectionStatus).map(([service, status]) => (
                        <div key={service} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{service}:</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            status === 'testing' ? 'bg-yellow-100 text-yellow-700' :
                            status.includes('connected') ? 'bg-green-100 text-green-700' :
                            status === 'no_data' ? 'bg-orange-100 text-orange-700' :
                            status === 'error' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => testConnection('gmail')}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Test Gmail
                    </button>
                    <button 
                      onClick={() => testConnection('drive')}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Test Drive
                    </button>
                    <button 
                      onClick={() => testConnection('calendar')}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Test Calendar
                    </button>
                    <button 
                      onClick={() => testConnection('tasks')}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Test Tasks
                    </button>
                  </div>
                </div>

                {/* Data Display Section */}
                {Object.keys(fetchedData).length > 0 && (
                  <div className="mb-6 p-4 bg-white rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3">📊 Fetched Data Preview</h3>
                    
                    {fetchedData.gmail && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          📧 Gmail Messages ({fetchedData.gmail.messages?.length || 0})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {fetchedData.gmail.messages?.slice(0, 3).map((msg: any, idx: number) => (
                            <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                              <div className="font-medium">{msg.subject || 'No Subject'}</div>
                              <div className="text-gray-600">From: {msg.from}</div>
                              <div className="text-gray-500 text-xs">{msg.date}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {fetchedData.drive && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          📁 Drive Files ({fetchedData.drive.files?.length || 0})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {fetchedData.drive.files?.slice(0, 3).map((file: any, idx: number) => (
                            <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                              <div className="font-medium">{file.name}</div>
                              <div className="text-gray-600">Type: {file.mimeType}</div>
                              <div className="text-gray-500 text-xs">Modified: {file.modifiedTime}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {fetchedData.calendar && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          📅 Calendar Events ({fetchedData.calendar.events?.length || 0})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {fetchedData.calendar.events?.slice(0, 3).map((event: any, idx: number) => (
                            <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                              <div className="font-medium">{event.summary || 'No Title'}</div>
                              <div className="text-gray-600">
                                {event.start?.dateTime ? 
                                  new Date(event.start.dateTime).toLocaleString() : 
                                  event.start?.date || 'No date'
                                }
                              </div>
                              <div className="text-gray-500 text-xs">
                                {event.location || 'No location'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* Communication Section */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold mb-1">Communication</h3>
                  <p className="text-sm text-neutral-700 mb-4">Connect messaging, email, and video conferencing tools.</p>
                  
                  <div className="space-y-3">
                    {integrations.filter(int => ["gmail", "slack", "discord"].includes(int.id)).map(integration => (
                      <div key={integration.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors">
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
                        {integration.connected ? (
                          <button
                            onClick={() => toggleIntegration(integration.id)}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-700 hover:text-black transition-colors disabled:opacity-50 border border-neutral-200 rounded-md hover:border-neutral-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {loading ? 'Disconnecting...' : 'Disconnect'}
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleIntegration(integration.id)}
                            disabled={loading}
                            className="px-4 py-1.5 bg-black text-white text-sm rounded-md hover:bg-black/90 transition-colors disabled:opacity-50 font-medium"
                          >
                            {loading ? 'Connecting...' : '+ Connect'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Productivity Section */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold mb-1">Productivity</h3>
                  <p className="text-sm text-neutral-700 mb-4">Connect project management, calendar, and productivity tools.</p>
                  
                  <div className="space-y-3">
                    {integrations.filter(int => ["calendar", "tasks", "notion"].includes(int.id)).map(integration => (
                      <div key={integration.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors">
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
                        {integration.connected ? (
                          <button
                            onClick={() => toggleIntegration(integration.id)}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-700 hover:text-black transition-colors disabled:opacity-50 border border-neutral-200 rounded-md hover:border-neutral-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {loading ? 'Disconnecting...' : 'Disconnect'}
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleIntegration(integration.id)}
                            disabled={loading}
                            className="px-4 py-1.5 bg-black text-white text-sm rounded-md hover:bg-black/90 transition-colors disabled:opacity-50 font-medium"
                          >
                            {loading ? 'Connecting...' : '+ Connect'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Storage Section */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold mb-1">Storage</h3>
                  <p className="text-sm text-neutral-700 mb-4">Connect drives and storage tools</p>
                  
                  <div className="space-y-3">
                    {integrations.filter(int => int.id === "drive").map(integration => (
                      <div key={integration.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors">
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
                        {integration.connected ? (
                          <button
                            onClick={() => toggleIntegration(integration.id)}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-700 hover:text-black transition-colors disabled:opacity-50 border border-neutral-200 rounded-md hover:border-neutral-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {loading ? 'Disconnecting...' : 'Disconnect'}
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleIntegration(integration.id)}
                            disabled={loading}
                            className="px-4 py-1.5 bg-black text-white text-sm rounded-md hover:bg-black/90 transition-colors disabled:opacity-50 font-medium"
                          >
                            {loading ? 'Connecting...' : '+ Connect'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Monitoring Tab */}
            {activeTab === "monitoring" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-2">Monitoring Profile</h2>
                  <p className="text-sm text-neutral-700">Manage your personal information, preferences, and account settings.</p>
                </div>

                <div className="space-y-6">
                  {/* Time Tracking */}
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900">Time Tracking</h3>
                      <p className="text-sm text-neutral-700 mt-1">Track time spent on different activities</p>
                    </div>
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
                  </div>

                  {/* App Usage Monitoring */}
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900">App Usage Monitoring</h3>
                      <p className="text-sm text-neutral-700 mt-1">Monitor which applications you use most</p>
                    </div>
                    <button
                      onClick={() => toggleMonitoring("appUsageMonitoring")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                        monitoringSettings.appUsageMonitoring ? 'bg-black' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          monitoringSettings.appUsageMonitoring ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Context Awareness */}
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900">Context Awareness</h3>
                      <p className="text-sm text-neutral-700 mt-1">Allow AI to understand your current work context</p>
                    </div>
                    <button
                      onClick={() => toggleMonitoring("contextAwareness")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                        monitoringSettings.contextAwareness ? 'bg-black' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          monitoringSettings.contextAwareness ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Smart Suggestions */}
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900">Smart Suggestions</h3>
                      <p className="text-sm text-neutral-700 mt-1">Receive proactive workflow suggestions</p>
                    </div>
                    <button
                      onClick={() => toggleMonitoring("smartSuggestions")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                        monitoringSettings.smartSuggestions ? 'bg-black' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          monitoringSettings.smartSuggestions ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-2">Notifications</h2>
                  <p className="text-sm text-neutral-700">Manage your personal information, preferences, and account settings.</p>
                </div>

                <div className="space-y-6">
                  {/* Daily Summaries */}
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-black mb-1">Daily Summaries</h3>
                      <p className="text-sm text-neutral-700">Receive daily summaries in your inbox and messaging platforms that highlight the most important updates and emails that may require a response.</p>
                    </div>
                    <button
                      onClick={() => toggleNotification("dailySummaries")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                        notificationSettings.dailySummaries ? 'bg-black' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings.dailySummaries ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Product Updates */}
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-black mb-1">Product Updates</h3>
                      <p className="text-sm text-neutral-700">Get product updates and announcements from Read AI</p>
                    </div>
                    <button
                      onClick={() => toggleNotification("productUpdates")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                        notificationSettings.productUpdates ? 'bg-black' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings.productUpdates ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Account Info */}
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-black mb-1">Account Info</h3>
                      <p className="text-sm text-neutral-700">Receive information from Read AI about your account</p>
                    </div>
                    <button
                      onClick={() => toggleNotification("accountInfo")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                        notificationSettings.accountInfo ? 'bg-black' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings.accountInfo ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment & Billing Tab */}
            {activeTab === "billing" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-2">Payment & Billing</h2>
                  <p className="text-sm text-neutral-700">Create workflow for making your work smoother</p>
                </div>

                {/* Payment Methods Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Payment</h3>
                  <p className="text-sm text-neutral-700 mb-6">Manage your payment methods securely. Add, update, or remove your credit/debit cards.</p>
                  
                  <div className="space-y-4">
                    {/* Mastercard - Active */}
                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="flex items-center gap-4">
                        <div className="w-5 h-5 bg-blue-600 rounded border-2 border-blue-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-5 bg-red-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">MC</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium">•••• •••• •••• 1573</div>
                            <div className="text-xs text-neutral-700">Expiry 05/27</div>
                          </div>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-neutral-200 rounded">
                        <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>

                    {/* Visa - Inactive */}
                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="flex items-center gap-4">
                        <div className="w-5 h-5 border-2 border-neutral-300 rounded"></div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">V</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium">•••• •••• •••• 7228</div>
                            <div className="text-xs text-neutral-700">Expiry 10/26</div>
                          </div>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-neutral-200 rounded">
                        <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Billing Information Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Billing</h3>
                  <p className="text-sm text-neutral-700 mb-6">Review and update your billing information to ensure accurate and timely payments.</p>
                  
                  <div className="space-y-6">
                    {/* Billing Period */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Billing Period</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-700">Next billing on March 18, 2025</span>
                        <button className="px-4 py-2 bg-neutral-100 text-neutral-800 text-sm rounded hover:bg-neutral-200 transition-colors">
                          Change Billing Period
                        </button>
                      </div>
                    </div>

                    {/* Current Plan */}
                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Basic Plan</h4>
                          <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-2xl font-semibold">$29</span>
                            <span className="text-sm text-neutral-700">/ month</span>
                          </div>
                          <p className="text-sm text-neutral-700 mb-3">All the basics for starting a new business</p>
                          <a href="#" className="text-sm text-blue-600 hover:text-blue-700">View Details</a>
                        </div>
                        <button className="px-4 py-2 bg-neutral-100 text-neutral-800 text-sm rounded hover:bg-neutral-200 transition-colors">
                          Change Plan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice History Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Invoice</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-3 px-4 text-sm font-medium">Invoice #</th>
                          <th className="text-left py-3 px-4 text-sm font-medium">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium">Plan</th>
                          <th className="text-left py-3 px-4 text-sm font-medium">Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-neutral-100">
                          <td className="py-3 px-4 text-sm">#018298</td>
                          <td className="py-3 px-4 text-sm">Jan 20, 2025</td>
                          <td className="py-3 px-4 text-sm">Pro Plan</td>
                          <td className="py-3 px-4 text-sm">$79</td>
                          <td className="py-3 px-4">
                            <button className="p-1 hover:bg-neutral-200 rounded">
                              <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                        <tr className="border-b border-neutral-100">
                          <td className="py-3 px-4 text-sm">#015274</td>
                          <td className="py-3 px-4 text-sm">Feb 20, 2025</td>
                          <td className="py-3 px-4 text-sm">Basic Plan</td>
                          <td className="py-3 px-4 text-sm">$29</td>
                          <td className="py-3 px-4">
                            <button className="p-1 hover:bg-neutral-200 rounded">
                              <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Policies Tab */}
            {activeTab === "policies" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-2">Policies</h2>
                  <p className="text-sm text-neutral-700">Manage your personal information, preferences, and account settings.</p>
                </div>

                <div className="space-y-6">
                  {/* External Writes */}
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-black mb-1">External Writes</h3>
                      <p className="text-sm text-neutral-700">Require approval for emails, messages, and documents</p>
                    </div>
                    <button
                      onClick={() => togglePolicy("externalWrites")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                        policySettings.externalWrites ? 'bg-black' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          policySettings.externalWrites ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* High-Value Actions */}
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-black mb-1">High-Value Actions</h3>
                      <p className="text-sm text-neutral-700">Require approval for calendar invites and important decisions</p>
                    </div>
                    <button
                      onClick={() => togglePolicy("highValueActions")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                        policySettings.highValueActions ? 'bg-black' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          policySettings.highValueActions ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* New Workflows */}
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-black mb-1">New Workflows</h3>
                      <p className="text-sm text-neutral-700">Require approval when creating new automated workflows</p>
                    </div>
                    <button
                      onClick={() => togglePolicy("newWorkflows")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                        policySettings.newWorkflows ? 'bg-black' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          policySettings.newWorkflows ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Sensitive Data */}
                  <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-black mb-1">Sensitive Data</h3>
                      <p className="text-sm text-neutral-700">Require approval when handling sensitive information</p>
                    </div>
                    <button
                      onClick={() => togglePolicy("sensitiveData")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                        policySettings.sensitiveData ? 'bg-black' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          policySettings.sensitiveData ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs content placeholders */}
            {activeTab !== "profile" && activeTab !== "integrations" && activeTab !== "monitoring" && activeTab !== "notifications" && activeTab !== "billing" && activeTab !== "policies" && (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2 capitalize">{activeTab}</h2>
                <p className="text-neutral-700">This section is coming soon.</p>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
