"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MainSidebar } from "@/components/MainSidebar";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Plus, 
  Filter,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  ExternalLink
} from "lucide-react";

export default function MeetingsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // ALL hooks must be declared at the top level
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    time: "",
    duration: "60",
    type: "video",
    participants: "",
    description: ""
  });

  // Authentication check
  useEffect(() => {
    if (isPending) return;
    
    if (!session) {
      router.replace("/auth/login");
      return;
    }
  }, [session, isPending, router]);

  // Load meetings
  useEffect(() => {
    const loadMeetings = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/meetings");
        const data = await response.json();
        setMeetings(data.meetings || []);
      } catch (error) {
        console.error("Failed to load meetings:", error);
        // Mock data for demo
        setMeetings([
          {
            id: "1",
            title: "Team Standup",
            date: "2024-01-15",
            time: "09:00",
            duration: "30",
            type: "video",
            participants: ["john@example.com", "jane@example.com"],
            status: "upcoming",
            description: "Daily team standup meeting"
          },
          {
            id: "2",
            title: "Project Review",
            date: "2024-01-16",
            time: "14:00",
            duration: "60",
            type: "video",
            participants: ["john@example.com", "jane@example.com", "bob@example.com"],
            status: "upcoming",
            description: "Monthly project review and planning"
          },
          {
            id: "3",
            title: "Client Meeting",
            date: "2024-01-14",
            time: "10:00",
            duration: "45",
            type: "video",
            participants: ["john@example.com", "client@company.com"],
            status: "completed",
            description: "Client presentation and feedback session"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadMeetings();
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

  const handleCreateMeeting = async () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time) return;

    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMeeting),
      });

      if (response.ok) {
        setNewMeeting({
          title: "",
          date: "",
          time: "",
          duration: "60",
          type: "video",
          participants: "",
          description: ""
        });
        setShowCreateForm(false);
        // Reload meetings
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to create meeting:", error);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    try {
      const response = await fetch(`/api/meetings/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMeetings(prev => prev.filter(meeting => meeting.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete meeting:", error);
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meeting.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || meeting.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const upcomingMeetings = filteredMeetings.filter(m => m.status === "upcoming");
  const completedMeetings = filteredMeetings.filter(m => m.status === "completed");

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <MainSidebar 
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
              <p className="text-gray-600 mt-1">Manage your meetings and schedule new ones</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Meeting
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search meetings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Meetings</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Create Meeting Form */}
            {showCreateForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create New Meeting</CardTitle>
                  <CardDescription>Schedule a new meeting with your team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meeting Title
                      </label>
                      <Input
                        value={newMeeting.title}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter meeting title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meeting Type
                      </label>
                      <Select value={newMeeting.type} onValueChange={(value) => setNewMeeting(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video Call</SelectItem>
                          <SelectItem value="in-person">In Person</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <Input
                        type="date"
                        value={newMeeting.date}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time
                      </label>
                      <Input
                        type="time"
                        value={newMeeting.time}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes)
                      </label>
                      <Select value={newMeeting.duration} onValueChange={(value) => setNewMeeting(prev => ({ ...prev, duration: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Participants (comma-separated emails)
                      </label>
                      <Input
                        value={newMeeting.participants}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, participants: e.target.value }))}
                        placeholder="john@example.com, jane@example.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <Input
                        value={newMeeting.description}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Meeting description"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateMeeting}
                      disabled={!newMeeting.title || !newMeeting.date || !newMeeting.time}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Create Meeting
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Meetings List */}
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingMeetings.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedMeetings.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="mt-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading meetings...</p>
                  </div>
                ) : upcomingMeetings.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming meetings</h3>
                      <p className="text-gray-600">Create your first meeting to get started.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingMeetings.map((meeting) => (
                      <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{meeting.title}</CardTitle>
                              <CardDescription>{meeting.description}</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(meeting.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{meeting.time} ({meeting.duration} min)</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Video className="w-4 h-4" />
                              <span className="capitalize">{meeting.type}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>{meeting.participants.length} participants</span>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2 mt-4">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Join
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteMeeting(meeting.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="mt-6">
                {completedMeetings.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No completed meetings</h3>
                      <p className="text-gray-600">Completed meetings will appear here.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedMeetings.map((meeting) => (
                      <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{meeting.title}</CardTitle>
                              <CardDescription>{meeting.description}</CardDescription>
                            </div>
                            <Badge variant="secondary">Completed</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(meeting.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{meeting.time} ({meeting.duration} min)</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Video className="w-4 h-4" />
                              <span className="capitalize">{meeting.type}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>{meeting.participants.length} participants</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}