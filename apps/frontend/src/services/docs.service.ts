import axios from 'axios';

export interface Document {
  id: string;
  title: string;
  content: string;
  path: string;
  category: string;
  tags: string | string[];
  views: number;
  created_at: string;
  updated_at: string;
}

export interface TableOfContentsItem {
  title: string;
  description: string;
  category: string;
  path: string;
  tags: string[];
}

export interface TableOfContentsSection {
  title: string;
  items: TableOfContentsItem[];
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const docsService = {
  async getAllDocs(): Promise<Document[]> {
    const response = await api.get('/api/docs');
    return response.data;
  },

  async getDocsByCategory(category: string): Promise<Document[]> {
    const docs = await this.getAllDocs();
    return docs.filter(doc => doc.category === category);
  },

  async getDoc(path: string): Promise<Document> {
    const cleanPath = path.replace('/docs', '');
    const response = await api.get(`/api/docs${cleanPath}`);
    return response.data;
  },

  async getTableOfContents(): Promise<TableOfContentsSection[]> {
    const docs = await this.getAllDocs();

    // Group documents by category
    const docsByCategory = docs.reduce((acc, doc) => {
      const category = doc.category
      // const category = categorizeDoc(doc.path);
      if (!acc[category]) acc[category] = [];
      acc[category].push(doc);
      return acc;
    }, {} as Record<string, Document[]>);

    // Format into sections
    return Object.entries(docsByCategory).map(([category, docs]) => ({
      title: category,
      items: docs.map(doc => ({
        title: doc.title,
        description: doc.content.split('\n')[2] || "No description available",
        path: `/docs${doc.path}`,
        tags: Array.isArray(doc.tags) ? doc.tags : doc.tags.split(','),
        category: doc.category,
      }))
    }));
  }
};
