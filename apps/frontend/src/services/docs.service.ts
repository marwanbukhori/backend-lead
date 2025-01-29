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
  created_at: string;
}

export interface TableOfContentsSection {
  title: string;
  id: string;
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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  order_index: number;
  is_visible: boolean;
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
    // Remove /docs prefix if it exists and ensure path starts with /
    const cleanPath = path.replace(/^\/docs/, '');
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    const response = await apiClient.get(`/docs${normalizedPath}`);
    return response.data;
  },

  async getDocById(id: string): Promise<Document> {
    const response = await apiClient.get(`/docs/by-id/${id}`);
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
      id: category,
      items: docs.map(doc => {
        // Format the created_at date
        const date = new Date(doc.created_at);
        const formattedDate = date.toLocaleString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });

        return {
          id: doc.id,
          title: doc.title,
          description: doc.category?.description || '',
          path: doc.path,
          tags: Array.isArray(doc.tags) ? doc.tags : doc.tags.split(','),
          category: doc.category?.name || 'Uncategorized',
          isBookmarked: bookmarkedDocIds.has(doc.id),
          created_at: formattedDate
        };
      })
    }));
  },

  async createDocument(doc: {
    title: string;
    content: string;
    categoryId: string;
    tags: string[];
  }): Promise<Document> {
    const { title, categoryId } = doc;

    // Get category to use its name in the path
    const categories = await this.getCategories();
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Generate path using category slug and document title WITHOUT /docs prefix
    const documentSlug = title.toLowerCase().replace(/\s+/g, '-');
    const path = `/${category.slug}/${documentSlug}`;

    const response = await apiClient.post('/docs', {
      ...doc,
      id: crypto.randomUUID(),
      path,
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    });
    return response.data;
  },

  async updateDocument(id: string, doc: {
    title: string;
    content: string;
    categoryId: string;
    tags: string[];
  }): Promise<Document> {
    // Get category to update path
    const categories = await this.getCategories();
    const category = categories.find(c => c.id === doc.categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Generate new path WITHOUT /docs prefix
    const documentSlug = doc.title.toLowerCase().replace(/\s+/g, '-');
    const path = `/${category.slug}/${documentSlug}`;

    const updatePayload = {
      ...doc,
      path,
      sections: [{
        title: doc.title,
        content: doc.content,
        level: 1,
        order_index: 0
      }]
    };

    const updateResponse = await apiClient.put(`/docs/by-id/${id}`, updatePayload);
    return updateResponse.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/docs/${id}`);
  },

  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get('/docs/categories');
    return response.data;
  }
}
