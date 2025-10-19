# Documents Page Documentation

## Overview
- **File Path**: `/src/app/docs/page.tsx`
- **URL**: `/docs`
- **Purpose**: Display and manage uploaded documents
- **Type**: Client-side rendered page with data fetching

## Page Structure

### Layout Components
- **Main Container**: `min-h-screen bg-[#f7f8f9] flex`
- **Sidebar**: `<MainSidebar />` component
- **Main Content**: `flex-1 p-6` with document list

### Visual Elements

#### 1. Page Header
```tsx
<div className="bg-white rounded-2xl border p-6">
  <h1 className="text-xl font-semibold mb-4">Documents</h1>
  {/* Document list or loading state */}
</div>
```

**Functionality**:
- **Page Title**: "Documents"
- **Container**: White card with rounded corners
- **Border**: Light gray border

#### 2. Document List
```tsx
<ul className="space-y-2">
  {docs.map((d) => (
    <li key={d.id} className="border rounded p-3">
      <div className="font-medium">{d.title}</div>
      <div className="text-xs opacity-70">{new Date(d.createdAt).toLocaleString()}</div>
    </li>
  ))}
</ul>
```

**Functionality**:
- **Document Items**: Shows document title and creation date
- **Styling**: Border with padding, rounded corners
- **Typography**: Medium font weight for title, small for date

#### 3. Loading State
```tsx
{loading ? (
  <p className="opacity-70">Loading…</p>
) : docs.length === 0 ? (
  <p className="opacity-70">No documents yet.</p>
) : (
  /* Document list */
)}
```

**States**:
- **Loading**: Shows "Loading…" message
- **Empty**: Shows "No documents yet." message
- **Populated**: Shows document list

## State Management

### Document State
```tsx
const [docs, setDocs] = useState<Doc[]>([]);
const [loading, setLoading] = useState(true);
```

### Document Type
```tsx
type Doc = { 
  id: string; 
  title: string; 
  createdAt: string 
};
```

**Data Structure**:
- **id**: Unique document identifier
- **title**: Document title/name
- **createdAt**: ISO timestamp of creation

### Data Fetching
```tsx
useEffect(() => {
  let active = true;
  (async () => {
    try {
      const res = await fetch("/api/docs");
      const data = await res.json();
      if (active) setDocs(data.docs ?? []);
    } catch {
      if (active) setDocs([]);
    } finally {
      if (active) setLoading(false);
    }
  })();
  return () => {
    active = false;
  };
}, []);
```

**Functionality**:
- **API Call**: Fetches documents from `/api/docs`
- **Error Handling**: Sets empty array on error
- **Cleanup**: Prevents state updates after unmount
- **Loading State**: Manages loading indicator

## Backend Integration

### Current API Endpoint

#### 1. Documents API
```typescript
// GET /api/docs
interface DocsResponse {
  docs: Doc[];
}

// Response format
{
  "docs": [
    {
      "id": "doc-123",
      "title": "Sample Document",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Implementation**:
```tsx
const res = await fetch("/api/docs");
const data = await res.json();
setDocs(data.docs ?? []);
```

### Required Backend Endpoints

#### 1. Document Management API
```typescript
// GET /api/docs
interface GetDocsResponse {
  docs: Document[];
  total: number;
  page: number;
  limit: number;
}

// GET /api/docs/{id}
interface GetDocResponse {
  doc: Document;
  content?: string;
  metadata?: any;
}

// DELETE /api/docs/{id}
interface DeleteDocResponse {
  success: boolean;
  message?: string;
}

// PUT /api/docs/{id}
interface UpdateDocRequest {
  title?: string;
  tags?: string[];
  metadata?: any;
}
```

#### 2. Document Search API
```typescript
// GET /api/docs/search?q={query}
interface SearchDocsResponse {
  docs: Document[];
  query: string;
  total: number;
}

// GET /api/docs/filter?tag={tag}&type={type}
interface FilterDocsResponse {
  docs: Document[];
  filters: {
    tag?: string;
    type?: string;
  };
  total: number;
}
```

#### 3. Document Actions API
```typescript
// POST /api/docs/{id}/download
interface DownloadDocResponse {
  url: string;
  filename: string;
  expiresAt: string;
}

// POST /api/docs/{id}/share
interface ShareDocRequest {
  permissions: 'read' | 'write' | 'admin';
  expiresAt?: string;
}

interface ShareDocResponse {
  shareUrl: string;
  shareId: string;
  expiresAt: string;
}
```

## Interactive Elements

### ✅ Functional Elements
- **Document Display**: Shows document list
- **Loading State**: Displays loading indicator
- **Empty State**: Shows message when no documents
- **Error Handling**: Gracefully handles API errors

### ❌ Non-Functional Elements
- **Document Actions**: No edit, delete, or download buttons
- **Search**: No search functionality
- **Filtering**: No filtering by type, date, or tags
- **Pagination**: No pagination for large document lists
- **Sorting**: No sorting options
- **Bulk Actions**: No bulk selection or operations
- **Document Preview**: No preview functionality
- **Document Upload**: No upload interface (separate page)

## Styling Details

### Document List Styling
```tsx
<ul className="space-y-2">
  {docs.map((d) => (
    <li key={d.id} className="border rounded p-3">
      <div className="font-medium">{d.title}</div>
      <div className="text-xs opacity-70">{new Date(d.createdAt).toLocaleString()}</div>
    </li>
  ))}
</ul>
```

**Styling**:
- **Spacing**: `space-y-2` for vertical spacing between items
- **Border**: Light gray border with rounded corners
- **Padding**: 3 units (12px) padding
- **Typography**: Medium font weight for title, small for date
- **Opacity**: 70% opacity for date text

### Card Container
```tsx
<div className="bg-white rounded-2xl border p-6">
  <h1 className="text-xl font-semibold mb-4">Documents</h1>
  {/* Content */}
</div>
```

**Styling**:
- **Background**: White background
- **Border Radius**: `rounded-2xl` for large rounded corners
- **Border**: Light gray border
- **Padding**: 6 units (24px) padding

## Development Notes

### Dependencies
- **React Hooks**: useState, useEffect
- **Next.js**: Default Next.js functionality
- **MainSidebar**: Custom sidebar component

### Performance Considerations
- **No Pagination**: Could impact performance with many documents
- **No Virtualization**: Long lists could cause performance issues
- **No Caching**: No client-side caching of document data
- **No Debouncing**: No debouncing for search (when implemented)

### Error Handling
```tsx
try {
  const res = await fetch("/api/docs");
  const data = await res.json();
  if (active) setDocs(data.docs ?? []);
} catch {
  if (active) setDocs([]);
} finally {
  if (active) setLoading(false);
}
```

**Error Handling**:
- **API Errors**: Sets empty array on fetch failure
- **JSON Parsing**: Handles malformed JSON responses
- **Component Unmount**: Prevents state updates after unmount

## Future Enhancements

### Recommended Features
1. **Document Actions**: Edit, delete, download, share
2. **Search Functionality**: Search through document titles and content
3. **Filtering**: Filter by type, date, tags, or status
4. **Sorting**: Sort by title, date, size, or type
5. **Pagination**: Handle large document lists
6. **Bulk Operations**: Select multiple documents for bulk actions
7. **Document Preview**: Preview documents without downloading
8. **Document Upload**: Direct upload from this page
9. **Document Metadata**: Show file size, type, and other metadata
10. **Document Tags**: Add and manage document tags

### Example Implementation

#### 1. Document Actions
```tsx
const handleDeleteDoc = async (docId: string) => {
  try {
    const response = await fetch(`/api/docs/${docId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      setDocs(prev => prev.filter(doc => doc.id !== docId));
    }
  } catch (error) {
    console.error('Failed to delete document:', error);
  }
};

const handleDownloadDoc = async (docId: string) => {
  try {
    const response = await fetch(`/api/docs/${docId}/download`, {
      method: 'POST'
    });
    
    if (response.ok) {
      const data = await response.json();
      window.open(data.url, '_blank');
    }
  } catch (error) {
    console.error('Failed to download document:', error);
  }
};
```

#### 2. Search Functionality
```tsx
const [searchQuery, setSearchQuery] = useState('');
const [filteredDocs, setFilteredDocs] = useState<Doc[]>([]);

useEffect(() => {
  if (searchQuery.trim()) {
    const filtered = docs.filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDocs(filtered);
  } else {
    setFilteredDocs(docs);
  }
}, [searchQuery, docs]);

// Add search input
<input
  type="text"
  placeholder="Search documents..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
/>
```

#### 3. Document Actions UI
```tsx
<li key={d.id} className="border rounded p-3 flex items-center justify-between">
  <div>
    <div className="font-medium">{d.title}</div>
    <div className="text-xs opacity-70">{new Date(d.createdAt).toLocaleString()}</div>
  </div>
  <div className="flex items-center gap-2">
    <button
      onClick={() => handleDownloadDoc(d.id)}
      className="p-1 text-gray-400 hover:text-gray-600"
      title="Download"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </button>
    <button
      onClick={() => handleDeleteDoc(d.id)}
      className="p-1 text-gray-400 hover:text-red-600"
      title="Delete"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
</li>
```

#### 4. Pagination
```tsx
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const itemsPerPage = 10;

const paginatedDocs = docs.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

// Pagination controls
<div className="flex items-center justify-between mt-4">
  <div className="text-sm text-gray-600">
    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, docs.length)} of {docs.length} documents
  </div>
  <div className="flex items-center gap-2">
    <button
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
    >
      Previous
    </button>
    <span className="px-3 py-1 bg-black text-white rounded">
      {currentPage}
    </span>
    <button
      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div>
```

## Testing Considerations

### Unit Tests
- Test document state management
- Test loading state handling
- Test error handling
- Test data fetching logic

### Integration Tests
- Test API integration
- Test error scenarios
- Test loading states
- Test empty state

### E2E Tests
- Test complete document workflow
- Test document display
- Test error handling
- Test loading states

## Security Considerations

### Data Protection
- **Input Validation**: Validate document data
- **Access Control**: Ensure proper permissions
- **File Security**: Validate file types and sizes
- **XSS Prevention**: Escape user content

### API Security
- **Authentication**: Require valid authentication
- **Authorization**: Check user permissions
- **Rate Limiting**: Implement rate limiting
- **Input Sanitization**: Sanitize all inputs
