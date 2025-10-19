# Chat Page Documentation

## Overview
- **File Path**: `/src/app/chat/page.tsx`
- **URL**: `/chat`
- **Purpose**: AI chat interface with streaming responses, file uploads, and conversation management
- **Type**: Client-side rendered page with real-time functionality

## Page Structure

### Layout Components
- **Main Container**: `min-h-screen bg-white flex`
- **Sidebar**: `<MainSidebar />` with session management
- **Main Content**: `flex-1 flex flex-col bg-white`

### Visual Elements

#### 1. Header Section
```tsx
<div className="px-6 py-4 border-b border-gray-200">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-black">Chat With AI</h1>
      <p className="text-sm text-gray-600 mt-1">Break down lengthy texts into concise summaries to grasp.</p>
    </div>
    <div className="flex items-center gap-3">
      {/* Action buttons */}
    </div>
  </div>
</div>
```

**Functionality**:
- **Page Title**: "Chat With AI"
- **Description**: Explains the chat functionality
- **Action Buttons**: Help, settings, and other utilities (non-functional)

#### 2. Welcome Section (When No Messages)
```tsx
<div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
  <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-8">
    <span className="text-white font-bold text-3xl">S</span>
  </div>
  <h2 className="text-3xl font-bold text-black mb-4">Welcome Saku AI</h2>
  <p className="text-lg text-gray-600 text-center mb-8 max-w-md">
    Get Started By Script A Task And Chat Can Do The Rest. Not Sure Where To Start?
  </p>
  {/* Suggested actions grid */}
</div>
```

**Functionality**:
- **Saku AI Logo**: Large circular logo with "S"
- **Welcome Message**: Encourages user to start chatting
- **Suggested Actions**: 6 predefined action buttons

**Suggested Actions**:
1. **Write Copy** - Sets input to "Write Copy"
2. **Image Generation** - Sets input to "Image Generation"
3. **Research** - Sets input to "Research"
4. **Generate Article** - Sets input to "Generate Article"
5. **Data Analytics** - Sets input to "Data Analytics"
6. **Generate Code** - Sets input to "Generate Code"

#### 3. Chat Messages Section
```tsx
<div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-4">
  {messages.map((m, i) => (
    <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
      <div className={`max-w-[75%] rounded-lg px-4 py-3 ${
        m.role === "user" 
          ? "bg-black text-white" 
          : "bg-gray-100 text-black"
      }`}>
        <div className="text-sm font-medium mb-1 opacity-80">{m.role}</div>
        <div className="whitespace-pre-wrap">{m.content}</div>
        {/* Citations section */}
      </div>
    </div>
  ))}
</div>
```

**Functionality**:
- **Message Display**: Shows conversation history
- **Role-based Styling**: Different styles for user vs assistant messages
- **Auto-scroll**: Automatically scrolls to bottom on new messages
- **Citations**: Shows source information for AI responses

#### 4. Input Area
```tsx
<div className="p-6 border-t border-gray-200 bg-white">
  {/* File upload display */}
  <div className="flex items-center gap-3">
    {/* AI Model Indicator */}
    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
      GA
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
        {/* Image, file, send buttons */}
      </div>
    </div>
    
    {/* Dropdowns */}
    <div className="flex items-center gap-2">
      <select>
        <option>All Sources</option>
        <option>Gmail</option>
        <option>Drive</option>
        <option>Calendar</option>
      </select>
      <select>
        <option>All Access</option>
        <option>Public</option>
        <option>Private</option>
      </select>
    </div>
  </div>
</div>
```

**Functionality**:
- **Text Input**: Main input field for user messages
- **Enter to Send**: Press Enter to send message
- **File Upload**: Support for multiple file types
- **Source Selection**: Dropdown to filter data sources
- **Access Level**: Dropdown for access permissions

## State Management

### Message State
```tsx
const [messages, setMessages] = useState<{ 
  role: "user" | "assistant"; 
  content: string; 
  citations?: any[] 
}[]>([]);
```

**Data Structure**:
- **role**: "user" or "assistant"
- **content**: Message text content
- **citations**: Optional array of source citations

### Session Management
```tsx
const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());
```

**Functionality**:
- **Unique Session ID**: Generated using crypto.randomUUID()
- **Session Persistence**: Stored in localStorage
- **Session Switching**: Can switch between different chat sessions

### File Upload State
```tsx
const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
```

**Supported File Types**:
- PDF files (`.pdf`)
- Word documents (`.doc`, `.docx`)
- Text files (`.txt`)
- Markdown files (`.md`)

## Backend Integration

### Current API Endpoints

#### 1. Chat Streaming API
```typescript
// GET /api/chat/stream?prompt={message}
// Response: Server-Sent Events (SSE)

interface StreamResponse {
  type: "token" | "context" | "done";
  value?: string;        // For token type
  citations?: any[];     // For context type
}
```

**Implementation**:
```tsx
const url = `/api/chat/stream?prompt=${encodeURIComponent(userMsg.content)}`;
const evt = new EventSource(url);

evt.onmessage = (e) => {
  try {
    const data = JSON.parse(e.data);
    if (data.type === "token") {
      // Update message content with new token
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
      // Update citations
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
      // Close connection and save session
      evt.close();
      saveSession();
    }
  } catch (error) {
    console.error("Error parsing SSE data:", error);
  }
};
```

#### 2. Session Management
```typescript
// Sessions stored in localStorage
interface Session {
  id: string;
  title: string;
  createdAt: string;
}

// Save session to localStorage
const saveSession = () => {
  const sessions = JSON.parse(localStorage.getItem("saku_sessions") || "[]");
  const title = userMsg.content.slice(0, 40) || "Conversation";
  const exists = sessions.find((s: { id: string }) => s.id === sessionId);
  
  if (!exists) {
    sessions.unshift({ 
      id: sessionId, 
      title, 
      createdAt: new Date().toISOString() 
    });
    localStorage.setItem("saku_sessions", JSON.stringify(sessions.slice(0, 30)));
  }
};
```

### Required Backend Endpoints

#### 1. Chat API (Current)
- **Endpoint**: `/api/chat/stream`
- **Method**: GET
- **Parameters**: `prompt` (query string)
- **Response**: Server-Sent Events stream

#### 2. File Upload API (Future)
```typescript
// POST /api/chat/upload
interface FileUploadRequest {
  files: File[];
  sessionId: string;
}

interface FileUploadResponse {
  success: boolean;
  fileIds: string[];
  error?: string;
}
```

#### 3. Session Management API (Future)
```typescript
// GET /api/chat/sessions
interface GetSessionsResponse {
  sessions: Session[];
}

// GET /api/chat/sessions/{id}
interface GetSessionResponse {
  session: Session;
  messages: Message[];
}

// DELETE /api/chat/sessions/{id}
interface DeleteSessionResponse {
  success: boolean;
}
```

## Interactive Elements

### ✅ Functional Elements
- **Message Input**: Text input with Enter to send
- **Message Display**: Shows conversation history
- **Streaming Responses**: Real-time AI response streaming
- **File Upload**: File selection and display
- **Session Management**: Create and switch between sessions
- **Suggested Actions**: Pre-defined action buttons
- **Auto-scroll**: Automatically scrolls to new messages

### ❌ Non-Functional Elements
- **File Upload Processing**: Files are selected but not uploaded
- **Source Filtering**: Dropdowns don't filter responses
- **Access Level Control**: Dropdown doesn't affect permissions
- **Header Action Buttons**: Help, settings buttons don't work
- **Message Actions**: No edit, delete, or copy functionality
- **Export Chat**: No way to export conversation

## Real-time Features

### Server-Sent Events (SSE)
```tsx
const evt = new EventSource(url);

evt.onmessage = (e) => {
  // Handle streaming data
};

evt.onerror = (error) => {
  console.error("SSE error:", error);
  evt.close();
};
```

**Benefits**:
- **Real-time Updates**: Messages appear as they're generated
- **Better UX**: Users see progress instead of waiting
- **Efficient**: Single connection for entire conversation

### Error Handling
```tsx
evt.onerror = (error) => {
  console.error("SSE error:", error);
  evt.close();
  // Could show error message to user
};
```

## File Upload System

### Current Implementation
```tsx
const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  setUploadedFiles(prev => [...prev, ...files]);
};

const removeFile = (index: number) => {
  setUploadedFiles(prev => prev.filter((_, i) => i !== index));
};
```

**Features**:
- **Multiple File Selection**: Can select multiple files at once
- **File Display**: Shows selected files with remove option
- **File Type Validation**: Only accepts specific file types
- **File Size Display**: Shows file names (truncated if too long)

### Future Enhancement
```tsx
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  
  try {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('sessionId', sessionId);
    
    const response = await fetch('/api/chat/upload', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      setUploadedFiles(prev => [...prev, ...result.files]);
    }
  } catch (error) {
    console.error('File upload failed:', error);
  }
};
```

## Styling Details

### Message Styling
- **User Messages**: Black background, white text, right-aligned
- **Assistant Messages**: Gray background, black text, left-aligned
- **Max Width**: 75% of container width
- **Padding**: 4 units horizontal, 3 units vertical

### Input Styling
- **Border**: Gray border with focus ring
- **Placeholder**: Gray text
- **Icons**: Positioned absolutely on the right
- **Buttons**: Hover effects and transitions

### Responsive Design
- **Mobile**: Full width input, stacked layout
- **Desktop**: Sidebar + main content layout
- **Tablet**: Adaptive layout based on screen size

## Development Notes

### Dependencies
- **React Hooks**: useState, useEffect, useRef
- **Next.js**: useRouter for navigation
- **MainSidebar**: Custom sidebar component
- **EventSource**: Native browser API for SSE

### Performance Considerations
- **Message Limit**: Consider limiting message history
- **Memory Usage**: Large conversations could impact performance
- **File Size**: Large file uploads could cause issues
- **Connection Management**: Properly close SSE connections

### Security Considerations
- **Input Sanitization**: Sanitize user input before sending
- **File Validation**: Validate file types and sizes
- **XSS Prevention**: Escape user content in messages
- **Rate Limiting**: Implement rate limiting for API calls

## Future Enhancements

### Recommended Features
1. **Message Actions**: Edit, delete, copy, share messages
2. **File Processing**: Actually process uploaded files
3. **Export Functionality**: Export conversations to PDF/Word
4. **Search in Chat**: Search through conversation history
5. **Message Threading**: Support for threaded conversations
6. **Voice Input**: Speech-to-text functionality
7. **Voice Output**: Text-to-speech for responses
8. **Custom Prompts**: Save and reuse custom prompts
9. **Collaboration**: Share conversations with others
10. **Integration**: Connect with other apps and services

### Example Implementation
```tsx
// Add message actions
const handleMessageAction = (action: string, messageIndex: number) => {
  switch (action) {
    case 'copy':
      navigator.clipboard.writeText(messages[messageIndex].content);
      break;
    case 'delete':
      setMessages(prev => prev.filter((_, i) => i !== messageIndex));
      break;
    case 'edit':
      // Implement message editing
      break;
  }
};

// Add export functionality
const exportChat = () => {
  const chatData = {
    sessionId,
    messages,
    createdAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(chatData, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-${sessionId}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

## Testing Considerations

### Unit Tests
- Test message state management
- Test file upload handling
- Test session management
- Test SSE data parsing

### Integration Tests
- Test chat API integration
- Test file upload API
- Test session persistence
- Test error handling

### E2E Tests
- Test complete chat flow
- Test file upload process
- Test session switching
- Test streaming responses
- Test error scenarios
