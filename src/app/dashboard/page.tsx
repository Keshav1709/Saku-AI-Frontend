"use client";

import { MainSidebar } from "@/components/MainSidebar";
import { SearchResults } from "@/components/SearchResults";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type ProfileData = {
  firstName: string;
  lastName: string;
  jobTitle: string;
  role: string;
  department: string;
  primaryEmail: string;
  language: string;
  preferenceEmail: string;
};

type GmailMessage = {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
};

type CalendarEvent = {
  id: string;
  summary: string;
  description: string;
  start: any;
  end: any;
  location: string;
  status: string;
  htmlLink: string;
  attendees: any[];
};

type Task = {
  id: string;
  title: string;
  notes: string;
  due: string;
  status: string;
  completed: string;
  position: string;
  updated: string;
};

export default function Dashboard() {
  const { data: session } = useSession();
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

  const [gmailMessages, setGmailMessages] = useState<GmailMessage[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const fetchProfileData = async () => {
    if (!session?.user?.email) return;
    
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        
        // Extract first and last name from the full name
        const nameParts = user.name ? user.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const newProfileData = {
          firstName,
          lastName,
          jobTitle: "",
          role: "",
          department: "",
          primaryEmail: user.email || "",
          language: "English",
          preferenceEmail: user.email || ""
        };
        
        setProfileData(newProfileData);
        
        // Update localStorage for consistency
        localStorage.setItem("saku_profile", JSON.stringify(newProfileData));
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    }
  };

  const fetchDashboardData = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setGmailMessages(data.data.gmailMessages || []);
        setCalendarEvents(data.data.calendarEvents || []);
        setTasks(data.data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    try {
      const response = await fetch('/api/integrations/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTaskTitle,
          notes: ''
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTasks(prev => [data.task, ...prev]);
          setNewTaskTitle("");
          setShowNewTaskForm(false);
        }
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await fetch('/api/integrations/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          status
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTasks(prev => prev.map(task => 
            task.id === taskId ? data.task : task
          ));
        }
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

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

    // Listen for storage changes to update profile in real-time
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

    // Listen for custom events for real-time updates within the same tab
    const handleProfileUpdate = (e: CustomEvent) => {
      setProfileData(e.detail);
    };

    // Listen for profile refresh events
    const handleProfileRefresh = () => {
      if (session) {
        fetchProfileData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("profileUpdated", handleProfileUpdate as EventListener);
    window.addEventListener("profileRefresh", handleProfileRefresh as EventListener);

    // Fetch profile and dashboard data when session is available
    if (session) {
      fetchProfileData();
      fetchDashboardData();
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profileUpdated", handleProfileUpdate as EventListener);
      window.removeEventListener("profileRefresh", handleProfileRefresh as EventListener);
    };
  }, [session]);

  return (
    <div className="h-screen bg-[#f7f8f9] overflow-hidden">
      <div className="flex h-full">
        <MainSidebar 
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 px-6 py-4 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-4">
              Hello, {profileData.firstName || "User"}
            </h1>
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search Gmail, Drive, Calendar & Tasks"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setShowSearchResults(true);
                  }
                }}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Quick Access Apps */}
            <div className="flex items-center gap-4 mt-4">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">M</div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.94 15.54a1 1 0 01-1.42-1.42l4.24-4.24a1 1 0 011.42 0l1.41 1.41 2.83-2.83a1 1 0 011.42 0l4.24 4.24a1 1 0 010 1.42l-4.24 4.24a1 1 0 01-1.42 0l-2.83-2.83-1.41 1.41a1 1 0 01-1.42 0l-4.24-4.24z"/>
                </svg>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm">N</div>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">31</div>
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">M</div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Tasks Section */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black">Tasks</h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="text-sm font-medium">{tasks.length}</span>
                  </div>
                  <button 
                    onClick={() => setShowNewTaskForm(!showNewTaskForm)}
                    className="bg-black text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-black/90 transition-colors"
                  >
                    + New Task
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4 mb-4">
                <button className="bg-black text-white px-3 py-1.5 rounded-lg text-sm font-medium">Tasks</button>
                <button className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium">Approvals (0)</button>
              </div>

              {/* New Task Form */}
              {showNewTaskForm && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Enter task title..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                      onKeyPress={(e) => e.key === 'Enter' && createTask()}
                    />
                    <button
                      onClick={createTask}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowNewTaskForm(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                    <span className="ml-3 text-gray-600">Loading tasks...</span>
                  </div>
                ) : tasks.length > 0 ? (
                  tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-black">{task.title}</div>
                        {task.notes && (
                          <div className="text-sm text-gray-600 mt-1">{task.notes}</div>
                        )}
                        {task.due && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(task.due).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'needsAction' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {task.status === 'needsAction' ? 'pending' : 'completed'}
                        </span>
                        {task.status === 'needsAction' && (
                          <button 
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                            className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-medium">Mark Complete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No tasks found. Create your first task!
                  </div>
                )}
              </div>
            </div>

            {/* Today Schedule Section */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-xl font-bold text-black mb-4">Today Schedule</h2>
              
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                    <span className="ml-3 text-gray-600">Loading schedule...</span>
                  </div>
                ) : calendarEvents.length > 0 ? (
                  calendarEvents.slice(0, 5).map((event) => {
                    const startTime = event.start?.dateTime ? 
                      new Date(event.start.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) :
                      'All day';
                    
                    const endTime = event.end?.dateTime ? 
                      new Date(event.end.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) :
                      '';
                    
                    const duration = event.start?.dateTime && event.end?.dateTime ? 
                      Math.round((new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / (1000 * 60)) + ' min' :
                      '';

                    const isMeeting = event.summary.toLowerCase().includes('meeting') || 
                                   event.summary.toLowerCase().includes('call') ||
                                   event.summary.toLowerCase().includes('standup') ||
                                   event.summary.toLowerCase().includes('demo');

                    return (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {isMeeting ? (
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-black">{event.summary}</div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {startTime}{endTime ? ` - ${endTime}` : ''} {duration ? `• ${duration}` : ''}
                            </div>
                            {event.location && (
                              <div className="text-sm text-gray-500 mt-1">📍 {event.location}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-sm">{event.attendees?.length || 0}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No events scheduled for today
                  </div>
                )}
              </div>
            </div>

            {/* AI Suggestions Section */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-xl font-bold text-black mb-4">Latest Gmail Messages</h2>
              
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                    <span className="ml-3 text-gray-600">Loading messages...</span>
                  </div>
                ) : gmailMessages.length > 0 ? (
                  gmailMessages.slice(0, 5).map((message) => {
                    const isImportant = message.subject.toLowerCase().includes('urgent') || 
                                      message.subject.toLowerCase().includes('important') ||
                                      message.subject.toLowerCase().includes('asap');
                    
                    const isUnread = !message.subject.includes('Re:') && !message.subject.includes('Fwd:');
                    
                    return (
                      <div key={message.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-black mb-1">{message.subject}</h3>
                            <p className="text-sm text-gray-600 mb-2">{message.snippet}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>From: {message.from}</span>
                              <span>•</span>
                              <span>{new Date(message.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            {isImportant && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                Important
                              </span>
                            )}
                            {isUnread && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
                          View Email
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No recent messages found
                  </div>
                )}
              </div>
            </div>

            {/* AI Trace Section */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-xl font-bold text-black mb-4">AI Trace</h2>
              
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm font-medium text-black">User Query Received</span>
                        </div>
                        <span className="text-xs text-gray-500">Completed</span>
                      </div>
                      <span className="text-xs text-gray-500">0.1s</span>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-2">10:30:15</div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-sm text-black">Q Search Query</span>
                      </div>
                      <div className="text-sm text-gray-600 ml-6">Q3 marketing strategy Discussion</div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-black">Sources</span>
                      </div>
                      <div className="text-sm text-gray-600 ml-6">Gmail, Slack, Docs</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Search Results Modal */}
      {showSearchResults && (
        <SearchResults
          query={searchQuery}
          onClose={() => setShowSearchResults(false)}
        />
      )}
    </div>
  );
}


