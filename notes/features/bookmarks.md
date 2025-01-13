# Document Bookmarking Feature

## Overview

The bookmark feature allows users to save and organize documents for quick access. Each bookmark is associated with a specific user and document, and can optionally include notes.

## Database Schema

### Bookmarks Table

```sql
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    notes TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, document_id)  -- Prevents duplicate bookmarks
);
```

### Key Relationships

- `user_id`: References the `users` table (CASCADE delete)
- `document_id`: References the `documents` table (CASCADE delete)
- Unique constraint on `(user_id, document_id)` ensures a user can't bookmark the same document twice

## API Endpoints

### 1. Get User's Bookmarks

```typescript
GET /api/docs/bookmarks

Response:
{
  id: string;
  documentId: string;
  notes?: string;
  order_index: number;
  document: {
    id: string;
    title: string;
    path: string;
    // ... other document fields
  };
  created_at: string;
  updated_at: string;
}[]
```

Database Query:

```sql
SELECT b.*, d.*
FROM bookmarks b
JOIN documents d ON b.document_id = d.id
WHERE b.user_id = :userId
ORDER BY b.order_index ASC;
```

### 2. Add Bookmark

```typescript
POST /api/docs/bookmarks/:documentId
Body: { notes?: string }

Response: {
  id: string;
  documentId: string;
  notes?: string;
  // ... other bookmark fields
}
```

Database Query:

```sql
INSERT INTO bookmarks (user_id, document_id, notes)
VALUES (:userId, :documentId, :notes)
RETURNING *;
```

### 3. Remove Bookmark

```typescript
DELETE /api/docs/bookmarks/:documentId

Response: 204 No Content
```

Database Query:

```sql
DELETE FROM bookmarks
WHERE user_id = :userId AND document_id = :documentId;
```

### 4. Update Bookmark Order

```typescript
PUT /api/docs/bookmarks/order
Body: { bookmarkIds: string[] }

Response: 204 No Content
```

Database Query:

```sql
-- Executed for each bookmark in the array
UPDATE bookmarks
SET order_index = :index
WHERE id = :bookmarkId AND user_id = :userId;
```

## Frontend Implementation

### State Management

The bookmark state is managed in two places:

1. Document listing (TableOfContents)
2. Individual document view

### Bookmark Status Check

When loading documents, we fetch both documents and bookmarks in parallel:

```typescript
const [docs, bookmarks] = await Promise.all([getAllDocs(), getBookmarks()]);

// Create efficient lookup of bookmarked documents
const bookmarkedDocIds = new Set(bookmarks.map((b) => b.documentId));

// Mark documents as bookmarked
const docsWithBookmarkStatus = docs.map((doc) => ({
  ...doc,
  isBookmarked: bookmarkedDocIds.has(doc.id),
}));
```

### Toggle Bookmark Function

```typescript
const handleToggleBookmark = async (item: TableOfContentsItem) => {
  try {
    if (item.isBookmarked) {
      await docsService.removeBookmark(item.id);
    } else {
      await docsService.addBookmark(item.id);
    }
    // Refresh to update bookmark states
    await refreshDocuments();
  } catch (err) {
    console.error("Error toggling bookmark:", err);
  }
};
```

## Security Considerations

1. **Authentication**: All bookmark endpoints require JWT authentication
2. **Authorization**: Users can only access and modify their own bookmarks
3. **Data Integrity**:
   - CASCADE deletion ensures no orphaned bookmarks
   - Unique constraint prevents duplicate bookmarks
   - Foreign keys ensure referential integrity

## Error Handling

1. **Document Not Found**: 404 error when bookmarking non-existent document
2. **Duplicate Bookmark**: 409 error when trying to bookmark same document twice
3. **Unauthorized Access**: 401 error for unauthenticated requests
4. **Invalid Document ID**: 400 error for malformed UUIDs

## Performance Optimizations

1. **Indexed Fields**:

   - `user_id` and `document_id` are indexed for fast lookups
   - Composite index on `(user_id, document_id)` for unique constraint

2. **Efficient Queries**:
   - Parallel fetching of docs and bookmarks
   - Use of Set for O(1) bookmark status lookup
   - Batch updates for reordering bookmarks

## Usage Example

```typescript
// Add a bookmark
await docsService.addBookmark(documentId, "Important reference");

// Remove a bookmark
await docsService.removeBookmark(documentId);

// Get all bookmarks
const bookmarks = await docsService.getBookmarks();

// Reorder bookmarks
await docsService.updateBookmarkOrder(newBookmarkOrder);
```
