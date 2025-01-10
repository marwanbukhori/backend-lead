import { apiClient } from './client';
import type { DocContent, SearchResult } from '@/types';

export const docsApi = {
  async getTableOfContents() {
    return apiClient.get('/docs/toc');
  },

  async getDoc(path: string) {
    return apiClient.get<DocContent>(`/docs/${path}`);
  },

  async search(query: string) {
    return apiClient.get<SearchResult[]>('/docs/search', {
      params: { query }
    });
  }
};
