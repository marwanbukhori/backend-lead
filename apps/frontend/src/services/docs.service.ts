import { apiClient } from '@/api/client';

export interface Document {
  id: string;
  title: string;
  content: string;
  path: string;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
    order_index: number;
    is_visible: boolean;
  };
  tags: string | string[];
  views: number;
  created_at: string;
  updated_at: string;
  isBookmarked?: boolean;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  description: string;
  category: string;
  path: string;
  tags: string[];
  isBookmarked?: boolean;
}

export interface TableOfContentsSection {
  title: string;
  items: TableOfContentsItem[];
}

export interface Bookmark {
  id: string;
  documentId: string;
  notes?: string;
  order_index: number;
  document: Document;
  created_at: string;
  updated_at: string;
}

export const docsService = {
  async getAllDocs(): Promise<Document[]> {
    const response = await apiClient.get('/docs');
    return response.data;
  },

  async getDocsByCategory(category: string): Promise<Document[]> {
    const docs = await this.getAllDocs();
    const normalizedCategory = category.toLowerCase();
    return docs.filter(doc => doc.category?.name.toLowerCase() === normalizedCategory);
  },

  async getDoc(path: string): Promise<Document> {
    const cleanPath = path.replace('/docs', '');
    const response = await apiClient.get(`/docs${cleanPath}`);
    return response.data;
  },

  async getBookmarks(): Promise<Bookmark[]> {
    const response = await apiClient.get('/docs/bookmarks');
    return response.data;
  },

  async addBookmark(documentId: string, notes?: string): Promise<Bookmark> {
    const response = await apiClient.post(`/docs/bookmarks/${documentId}`, { notes });
    return response.data;
  },

  async removeBookmark(documentId: string): Promise<void> {
    await apiClient.delete(`/docs/bookmarks/${documentId}`);
  },

  async updateBookmarkOrder(bookmarkIds: string[]): Promise<void> {
    await apiClient.put('/docs/bookmarks/order', { bookmarkIds });
  },

  async getTableOfContents(): Promise<TableOfContentsSection[]> {
    // Get both docs and bookmarks in parallel
    const [docs, bookmarks] = await Promise.all([
      this.getAllDocs(),
      this.getBookmarks()
    ]);

    // Create a set of bookmarked document IDs for quick lookup
    const bookmarkedDocIds = new Set(bookmarks.map(b => b.documentId));

    // Group documents by category
    const docsByCategory = docs.reduce((acc, doc) => {
      const category = doc.category?.name || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(doc);
      return acc;
    }, {} as Record<string, Document[]>);

    // Format into sections
    return Object.entries(docsByCategory).map(([category, docs]) => ({
      title: category,
      items: docs.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.category?.description || '',
        path: `/docs${doc.path}`,
        tags: Array.isArray(doc.tags) ? doc.tags : doc.tags.split(','),
        category: doc.category?.name || 'Uncategorized',
        isBookmarked: bookmarkedDocIds.has(doc.id),
      }))
    }));
  }
}
