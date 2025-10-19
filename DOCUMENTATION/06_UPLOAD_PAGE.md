# Upload Page Documentation

## Overview
- **File Path**: `/src/app/upload/page.tsx`
- **URL**: `/upload`
- **Purpose**: File upload interface for documents
- **Type**: Client-side rendered page with file handling

## Page Structure

### Layout Components
- **Main Container**: `min-h-screen bg-[#f7f8f9] flex`
- **Sidebar**: `<MainSidebar />` component
- **Main Content**: `flex-1 p-6` with upload interface

### Visual Elements

#### 1. Page Header
```tsx
<div className="bg-white rounded-2xl border p-6">
  <h1 className="text-xl font-semibold mb-4">Upload</h1>
  {/* Upload interface */}
</div>
```

**Functionality**:
- **Page Title**: "Upload"
- **Container**: White card with rounded corners
- **Border**: Light gray border

#### 2. Upload Interface
```tsx
<div className="border rounded p-4">
  <input type="file" multiple onChange={onPick} />
  {files.length > 0 && (
    <ul className="mt-3 space-y-2">
      {files.map((f, i) => (
        <li key={i} className="flex items-center justify-between">
          <span className="truncate max-w-[70%]">{f.name}</span>
          <button className="text-sm underline" onClick={() => removeAt(i)}>
            remove
          </button>
        </li>
      ))}
    </ul>
  )}
  <div className="mt-4 flex gap-2">
    <button className="px-4 py-2 bg-black text-white rounded" onClick={onUpload}>
      Upload {files.length ? `(${files.length})` : ""}
    </button>
    {status && <span className="text-sm opacity-70">{status}</span>}
  </div>
</div>
```

**Functionality**:
- **File Input**: Multiple file selection
- **File List**: Shows selected files with remove option
- **Upload Button**: Triggers upload process
- **Status Display**: Shows upload status

## State Management

### File State
```tsx
const [files, setFiles] = useState<File[]>([]);
const [status, setStatus] = useState<string | null>(null);
```

**Data Structure**:
- **files**: Array of selected File objects
- **status**: String indicating upload status

### File Selection
```tsx
function onPick(e: React.ChangeEvent<HTMLInputElement>) {
  const selected = e.target.files ? Array.from(e.target.files) : [];
  setFiles((f) => [...f, ...selected]);
}
```

**Functionality**:
- **Multiple Selection**: Allows selecting multiple files
- **Array Conversion**: Converts FileList to Array
- **State Update**: Adds new files to existing selection

### File Removal
```tsx
function removeAt(i: number) {
  setFiles((prev) => prev.filter((_, idx) => idx !== i));
}
```

**Functionality**:
- **Index-based Removal**: Removes file by index
- **State Update**: Filters out selected file
- **UI Update**: Re-renders file list

### Upload Process
```tsx
async function onUpload() {
  if (files.length === 0) return;
  setStatus("Uploading…");
  
  for (const f of files) {
    const form = new FormData();
    form.append("file", f);
    try {
      const res = await fetch("/api/docs/upload", { 
        method: "POST", 
        body: form 
      });
      if (!res.ok) throw new Error();
    } catch {
      setStatus(`Failed uploading ${f.name}`);
      return;
    }
  }
  
  setFiles([]);
  setStatus("Uploaded");
}
```

**Functionality**:
- **Validation**: Checks if files are selected
- **Status Update**: Shows "Uploading…" status
- **Sequential Upload**: Uploads files one by one
- **Error Handling**: Shows error message on failure
- **Success Handling**: Clears files and shows success

## Backend Integration

### Current API Endpoint

#### 1. Document Upload API
```typescript
// POST /api/docs/upload
interface UploadRequest {
  file: File; // FormData with file
}

interface UploadResponse {
  success: boolean;
  docId?: string;
  error?: string;
}
```

**Implementation**:
```tsx
const form = new FormData();
form.append("file", f);
const res = await fetch("/api/docs/upload", { 
  method: "POST", 
  body: form 
});
```

### Required Backend Endpoints

#### 1. Enhanced Upload API
```typescript
// POST /api/docs/upload
interface UploadRequest {
  file: File;
  metadata?: {
    title?: string;
    tags?: string[];
    description?: string;
  };
}

interface UploadResponse {
  success: boolean;
  docId: string;
  title: string;
  size: number;
  type: string;
  uploadedAt: string;
  error?: string;
}
```

#### 2. Bulk Upload API
```typescript
// POST /api/docs/upload/bulk
interface BulkUploadRequest {
  files: File[];
  metadata?: {
    tags?: string[];
    description?: string;
  };
}

interface BulkUploadResponse {
  success: boolean;
  results: {
    docId: string;
    title: string;
    success: boolean;
    error?: string;
  }[];
  totalUploaded: number;
  totalFailed: number;
}
```

#### 3. Upload Progress API
```typescript
// WebSocket /api/docs/upload/progress
interface UploadProgress {
  docId: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}
```

## Interactive Elements

### ✅ Functional Elements
- **File Selection**: Multiple file selection works
- **File Display**: Shows selected files with names
- **File Removal**: Remove individual files
- **Upload Process**: Uploads files to backend
- **Status Display**: Shows upload status
- **Error Handling**: Displays error messages

### ❌ Non-Functional Elements
- **File Validation**: No file type or size validation
- **Progress Indicator**: No upload progress display
- **Drag & Drop**: No drag and drop functionality
- **File Preview**: No file preview before upload
- **Metadata Input**: No way to add file metadata
- **Bulk Operations**: No bulk file operations
- **Upload Queue**: No upload queue management
- **Retry Failed**: No retry for failed uploads

## Styling Details

### Upload Container
```tsx
<div className="border rounded p-4">
  <input type="file" multiple onChange={onPick} />
  {/* File list and controls */}
</div>
```

**Styling**:
- **Border**: Light gray border with rounded corners
- **Padding**: 4 units (16px) padding
- **File Input**: Default browser styling

### File List
```tsx
<ul className="mt-3 space-y-2">
  {files.map((f, i) => (
    <li key={i} className="flex items-center justify-between">
      <span className="truncate max-w-[70%]">{f.name}</span>
      <button className="text-sm underline" onClick={() => removeAt(i)}>
        remove
      </button>
    </li>
  ))}
</ul>
```

**Styling**:
- **Spacing**: `space-y-2` for vertical spacing
- **Layout**: Flex layout with space between
- **Text Truncation**: `truncate` for long filenames
- **Button**: Underlined text for remove button

### Upload Button
```tsx
<button className="px-4 py-2 bg-black text-white rounded" onClick={onUpload}>
  Upload {files.length ? `(${files.length})` : ""}
</button>
```

**Styling**:
- **Background**: Black background
- **Text**: White text
- **Padding**: 4 units horizontal, 2 units vertical
- **Border Radius**: Rounded corners
- **Dynamic Text**: Shows file count when files selected

## Development Notes

### Dependencies
- **React Hooks**: useState
- **Next.js**: Default Next.js functionality
- **MainSidebar**: Custom sidebar component
- **File API**: Native browser File API

### Performance Considerations
- **Sequential Upload**: Could be slow for many files
- **No Progress**: No visual feedback during upload
- **Memory Usage**: Large files could impact performance
- **No Chunking**: No file chunking for large files

### Error Handling
```tsx
try {
  const res = await fetch("/api/docs/upload", { 
    method: "POST", 
    body: form 
  });
  if (!res.ok) throw new Error();
} catch {
  setStatus(`Failed uploading ${f.name}`);
  return;
}
```

**Error Handling**:
- **Network Errors**: Catches fetch errors
- **Server Errors**: Checks response status
- **User Feedback**: Shows error message
- **Early Return**: Stops upload on first error

## Future Enhancements

### Recommended Features
1. **File Validation**: Validate file types and sizes
2. **Progress Indicator**: Show upload progress
3. **Drag & Drop**: Add drag and drop functionality
4. **File Preview**: Preview files before upload
5. **Metadata Input**: Add file metadata fields
6. **Bulk Upload**: Upload multiple files simultaneously
7. **Upload Queue**: Manage upload queue
8. **Retry Failed**: Retry failed uploads
9. **File Compression**: Compress files before upload
10. **Chunked Upload**: Upload large files in chunks

### Example Implementation

#### 1. File Validation
```tsx
const validateFile = (file: File): string | null => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'text/plain', 'application/msword'];
  
  if (file.size > maxSize) {
    return `File ${file.name} is too large. Maximum size is 10MB.`;
  }
  
  if (!allowedTypes.includes(file.type)) {
    return `File ${file.name} has an unsupported type. Allowed types: PDF, TXT, DOC`;
  }
  
  return null;
};

const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selected = e.target.files ? Array.from(e.target.files) : [];
  const validFiles: File[] = [];
  const errors: string[] = [];
  
  selected.forEach(file => {
    const error = validateFile(file);
    if (error) {
      errors.push(error);
    } else {
      validFiles.push(file);
    }
  });
  
  if (errors.length > 0) {
    setStatus(errors.join(', '));
  }
  
  setFiles(prev => [...prev, ...validFiles]);
};
```

#### 2. Progress Indicator
```tsx
const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

const onUpload = async () => {
  if (files.length === 0) return;
  setStatus("Uploading…");
  
  for (const f of files) {
    const form = new FormData();
    form.append("file", f);
    
    try {
      const res = await fetch("/api/docs/upload", { 
        method: "POST", 
        body: form,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [f.name]: progress }));
        }
      });
      
      if (!res.ok) throw new Error();
    } catch {
      setStatus(`Failed uploading ${f.name}`);
      return;
    }
  }
  
  setFiles([]);
  setStatus("Uploaded");
};
```

#### 3. Drag & Drop
```tsx
const [isDragOver, setIsDragOver] = useState(false);

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragOver(true);
};

const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragOver(false);
};

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragOver(false);
  
  const files = Array.from(e.dataTransfer.files);
  setFiles(prev => [...prev, ...files]);
};

<div
  className={`border-2 border-dashed rounded-lg p-8 text-center ${
    isDragOver ? 'border-black bg-gray-50' : 'border-gray-300'
  }`}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
>
  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
  <p className="mt-2 text-sm text-gray-600">
    Drag and drop files here, or click to select
  </p>
</div>
```

#### 4. File Preview
```tsx
const [previews, setPreviews] = useState<{[key: string]: string}>({});

useEffect(() => {
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({ ...prev, [file.name]: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  });
}, [files]);

// In file list
{file.type.startsWith('image/') && previews[file.name] && (
  <img 
    src={previews[file.name]} 
    alt={file.name}
    className="w-16 h-16 object-cover rounded"
  />
)}
```

#### 5. Bulk Upload
```tsx
const onUpload = async () => {
  if (files.length === 0) return;
  setStatus("Uploading…");
  
  try {
    const form = new FormData();
    files.forEach(file => form.append('files', file));
    
    const res = await fetch("/api/docs/upload/bulk", { 
      method: "POST", 
      body: form 
    });
    
    if (res.ok) {
      const result = await res.json();
      setStatus(`Uploaded ${result.totalUploaded} files successfully`);
      setFiles([]);
    } else {
      throw new Error();
    }
  } catch {
    setStatus("Upload failed");
  }
};
```

## Testing Considerations

### Unit Tests
- Test file selection logic
- Test file removal logic
- Test upload process
- Test error handling

### Integration Tests
- Test API integration
- Test file upload flow
- Test error scenarios
- Test status updates

### E2E Tests
- Test complete upload workflow
- Test file selection and removal
- Test upload success and failure
- Test multiple file upload

## Security Considerations

### File Security
- **File Type Validation**: Validate file types
- **File Size Limits**: Enforce size limits
- **Malware Scanning**: Scan uploaded files
- **Content Validation**: Validate file content

### API Security
- **Authentication**: Require valid authentication
- **Rate Limiting**: Implement rate limiting
- **File Quotas**: Enforce user file quotas
- **Input Sanitization**: Sanitize file metadata
