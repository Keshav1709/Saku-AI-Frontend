"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MainSidebar } from "@/components/MainSidebar";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageCircle, 
  Home, 
  Workflow, 
  Calendar, 
  BarChart3, 
  Settings, 
  Paperclip, 
  Camera, 
  Send,
  Zap,
  FileText,
  Image as ImageIcon,
  Search,
  Code,
  TrendingUp
} from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // ALL hooks must be declared at the top level
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; timestamp: Date }[]>([]);
  const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("GPT-4");
  const [selectedSource, setSelectedSource] = useState("All Sources");
  const [selectedAccess, setSelectedAccess] = useState("All Access");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Authentication check
  useEffect(() => {
    if (isPending) return;
    
    if (!session) {
      router.replace("/auth/login");
      return;
    }
  }, [session, isPending, router]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      role: "user" as const, 
      content: input, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = { 
        role: "assistant" as const, 
        content: "I understand your request. Let me help you with that.", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: FileText, label: "Write Copy", color: "bg-blue-500" },
    { icon: ImageIcon, label: "Image Generation", color: "bg-purple-500" },
    { icon: Search, label: "Research", color: "bg-green-500" },
    { icon: FileText, label: "Generate Article", color: "bg-orange-500" },
    { icon: TrendingUp, label: "Data Analysis", color: "bg-red-500" },
    { icon: Code, label: "Generate Code", color: "bg-indigo-500" }
  ];

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
              <h1 className="text-2xl font-bold text-gray-900">Chat With AI</h1>
              <p className="text-gray-600 mt-1">Break down lengthy texts into concise summaries to grasp.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="max-w-4xl mx-auto text-center">
              {/* Welcome Section */}
              <div className="mb-8">
                <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">S</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Saku AI</h2>
                <p className="text-gray-600 mb-4">Get Started By Script A Task And Chat Can Do The Rest.</p>
                <p className="text-gray-500">Not Sure Where To Start?</p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {quickActions.map((action, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{action.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3xl ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'} rounded-lg p-4`}>
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.role === 'user' ? '/avatars/user.jpg' : '/avatars/ai.jpg'} />
                        <AvatarFallback>
                          {message.role === 'user' ? 'U' : 'AI'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">
                            {message.role === 'user' ? 'You' : 'Saku AI'}
                          </span>
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Agent Selection */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Agents:</span>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GPT-4">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>GPT-4</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Claude-4.5">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>Claude 4.5</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Gemini-2.5-Pro">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>Gemini 2.5 Pro</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Sources:</span>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Sources">All Sources</SelectItem>
                    <SelectItem value="Web">Web</SelectItem>
                    <SelectItem value="Documents">Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Access:</span>
                <Select value={selectedAccess} onValueChange={setSelectedAccess}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Access">All Access</SelectItem>
                    <SelectItem value="Limited">Limited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Input Field */}
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Find all unread emails from yesterday and summarize"
                  className="w-full px-4 py-3 text-base"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Camera className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}