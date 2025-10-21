"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MainSidebar } from "@/components/MainSidebar";
import Image from "next/image";

export default function ChatPage() {
  function renderMarkdownToHtml(text: string) {
    const escapeHtml = (s: string) => s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

    const lines = text.split("\n");
    const html: string[] = [];
    let inList = false;

    for (const raw of lines) {
      const line = raw.trimEnd();
      if (/^###\s+/.test(line)) {
        if (inList) { html.push("</ul>"); inList = false; }
        html.push(`<h3>${escapeHtml(line.replace(/^###\s+/, ""))}</h3>`);
        continue;
      }
      if (/^##\s+/.test(line)) {
        if (inList) { html.push("</ul>"); inList = false; }
        html.push(`<h2>${escapeHtml(line.replace(/^##\s+/, ""))}</h2>`);
        continue;
      }
      if (/^-\s+/.test(line)) {
        if (!inList) { html.push("<ul>"); inList = true; }
        const item = line.replace(/^-\s+/, "");
        const bold = item.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        html.push(`<li>${escapeHtml(bold).replace(/&lt;strong&gt;|&lt;\/strong&gt;/g, (m)=> m==='&lt;strong&gt;'?'<strong>':'</strong>')}</li>`);
        continue;
      }
      if (line === "") {
        if (inList) { html.push("</ul>"); inList = false; }
        html.push("<p></p>");
        continue;
      }
      const bold = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      html.push(`<p>${escapeHtml(bold).replace(/&lt;strong&gt;|&lt;\/strong&gt;/g, (m)=> m==='&lt;strong&gt;'?'<strong>':'</strong>')}</p>`);
    }
    if (inList) html.push("</ul>");
    return html.join("\n");
  }
  const router = useRouter();
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; citations?: any[] }[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const [sessionId, setSessionId] = useState<string>(() => "");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileData, setProfileData] = useState<{
    firstName: string;
    lastName: string;
    jobTitle: string;
    role: string;
    department: string;
    primaryEmail: string;
    language: string;
    preferenceEmail: string;
  }>({
    firstName: "Romeo",
    lastName: "Saha",
    jobTitle: "",
    role: "",
    department: "",
    primaryEmail: "",
    language: "",
    preferenceEmail: ""
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("saku_auth");
    if (!token) router.replace("/login");
    // ensure a conversation exists
    (async () => {
      try {
        const res = await fetch('/api/conversations', { method: 'POST' });
        const data = await res.json();
        if (data?.ok && data?.conversation?.id) {
          setSessionId(data.conversation.id);
        } else {
          setSessionId(crypto.randomUUID());
        }
      } catch {
        setSessionId(crypto.randomUUID());
      }
    })();
  }, [router]);

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        const nameParts = userData.name ? userData.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        setProfileData({
          firstName,
          lastName,
          jobTitle: userData.jobTitle || "",
          role: userData.role || "",
          department: userData.department || "",
          primaryEmail: userData.email || "",
          language: userData.language || "",
          preferenceEmail: userData.preferenceEmail || ""
        });
        
        if (userData.avatar) {
          setProfilePhoto(userData.avatar);
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    // Hide welcome section when there are messages
    setShowWelcome(messages.length === 0);
  }, [messages]);

  function logout() {
    localStorage.removeItem("saku_auth");
    router.replace("/login");
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSuggestedAction = (action: string) => {
    setInput(action);
  };

  async function onSend() {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input };
    setMessages((m) => [...m, userMsg, { role: "assistant", content: "", citations: [] }]);
    setInput("");

    // Upload any attached files first and collect doc_ids
    let docIds: string[] = [];
    if (uploadedFiles.length > 0) {
      try {
        const uploads = uploadedFiles.map(async (file) => {
          const form = new FormData();
          form.append("file", file);
          const res = await fetch("/api/docs/upload", { method: "POST", body: form });
          if (!res.ok) throw new Error("upload_failed");
          const json = await res.json();
          if (json?.ok && json?.doc_id) return json.doc_id as string;
          throw new Error("invalid_upload_response");
        });
        docIds = await Promise.all(uploads);
        setUploadedFiles([]);
      } catch (e) {
        console.error("Attachment upload failed:", e);
      }
    }

    // Stream via SSE from internal API including docIds as filter when present
    const qp = new URLSearchParams({ prompt: userMsg.content });
    if (docIds.length > 0) qp.set("docIds", docIds.join(","));
    if (sessionId) qp.set("convId", sessionId);
    const evt = new EventSource(`/api/chat/stream?${qp.toString()}`);
    evt.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "token") {
          setMessages((m) => {
            const next = [...m];
            const last = next[next.length - 1];
            next[next.length - 1] = { 
              role: "assistant", 
              content: (last?.content || "") + data.value,
              citations: last?.citations || []
            };
            return next;
          });
        } else if (data.type === "context") {
          // Update the last message with citations
          setMessages((m) => {
            const next = [...m];
            const last = next[next.length - 1];
            if (last && last.role === "assistant") {
              next[next.length - 1] = { 
                ...last, 
                citations: data.citations || [] 
              };
            }
            return next;
          });
        } else if (data.type === "done") {
          evt.close();
          // persist session index
          const sessions = JSON.parse(localStorage.getItem("saku_sessions") || "[]");
          const title = userMsg.content.slice(0, 40) || "Conversation";
          const exists = sessions.find((s: { id: string }) => s.id === sessionId);
          if (!exists) {
            sessions.unshift({ id: sessionId, title, createdAt: new Date().toISOString() });
            localStorage.setItem("saku_sessions", JSON.stringify(sessions.slice(0, 30)));
          }
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };
    evt.onerror = (error) => {
      console.error("SSE error:", error);
      evt.close();
    };
  }

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      <MainSidebar
        selectedId={sessionId}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNew={() => {
          setSessionId(crypto.randomUUID());
          setMessages([]);
        }}
        onSelect={async (id) => {
          setSessionId(id);
          try {
            const resp = await fetch(`/api/conversations/${id}`);
            const json = await resp.json();
            const msgs = (json?.conversation?.messages || []).map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content, citations: m.citations || [] }));
            setMessages(msgs);
          } catch {}
        }}
      />
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black">Chat With AI</h1>
              <p className="text-sm text-gray-600 mt-1">Break down lengthy texts into concise summaries to grasp.</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" disabled aria-disabled className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center opacity-60 cursor-not-allowed" title="Coming soon">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button type="button" disabled aria-disabled className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center opacity-60 cursor-not-allowed" title="Coming soon">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </button>
              <button type="button" disabled aria-disabled className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center opacity-60 cursor-not-allowed" title="Coming soon">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {showWelcome ? (
            /* Welcome Section */
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 overflow-y-auto">
              {/* SakuAI Logo */}
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-8">
                <span className="text-white font-bold text-3xl">S</span>
              </div>
              
              {/* Welcome Message */}
              <h2 className="text-3xl font-bold text-black mb-4">Welcome Saku AI</h2>
              <p className="text-lg text-gray-600 text-center mb-8 max-w-md">
                Get Started By Script A Task And Chat Can Do The Rest. Not Sure Where To Start?
              </p>

              {/* Suggested Actions */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl w-full">
                <button
                  onClick={() => handleSuggestedAction("Write Copy")}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-black">Write Copy</span>
                </button>

                <button
                  onClick={() => handleSuggestedAction("Image Generation")}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-black">Image Generation</span>
                </button>

                <button
                  onClick={() => handleSuggestedAction("Research")}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-black">Research</span>
                </button>

                <button
                  onClick={() => handleSuggestedAction("Generate Article")}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-black">Generate Article</span>
                </button>

                <button
                  onClick={() => handleSuggestedAction("Data Analytics")}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-black">Data Analytics</span>
                </button>

                <button
                  onClick={() => handleSuggestedAction("Generate Code")}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-black">&lt;&gt; Generate Code</span>
                </button>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div ref={listRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className={`max-w-[75%] rounded-lg px-4 py-3 ${
                    m.role === "user" 
                      ? "bg-black text-white" 
                      : "bg-gray-100 text-black"
                  }`}>
                    <div className="text-sm font-medium mb-1 opacity-80">{m.role}</div>
                    <div className="prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(m.content) }} />
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <div className="text-xs font-medium mb-2">Sources:</div>
                        <div className="space-y-2">
                          {m.citations.map((citation, idx) => (
                            <div key={idx} className="text-xs bg-white bg-opacity-20 p-2 rounded">
                              <div className="font-medium">
                                {citation.doc_id ? `Document ${citation.doc_id}` : 'Source'}
                              </div>
                              <div className="mt-1 opacity-90">
                                {citation.snippet}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            {/* Uploaded Files Display */}
            {uploadedFiles.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-700 truncate max-w-32">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* AI Model Indicator - Show Profile Picture */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                {profilePhoto ? (
                  <Image
                    src={profilePhoto}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {profileData.firstName ? profileData.firstName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>

              {/* Input Field */}
              <div className="flex-1 relative">
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-20 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Find all unread emails from yesterday and summarize |"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSend();
                    }
                  }}
                />
                
                {/* Input Icons */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button type="button" disabled aria-disabled className="text-gray-300 cursor-not-allowed" title="Coming soon">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  
                  <label className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.md"
                    />
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </label>
                  
                  <button
                    onClick={onSend}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Dropdowns */}
              <div className="flex items-center gap-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent">
                  <option>All Sources</option>
                  <option>Gmail</option>
                  <option>Drive</option>
                  <option>Calendar</option>
                </select>
                
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent">
                  <option>All Access</option>
                  <option>Public</option>
                  <option>Private</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


