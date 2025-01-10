import { defineStore } from 'pinia';
import { docsApi } from '@/api/docs';
import type { DocContent, SearchResult } from '@/types';

export const useDocsStore = defineStore('docs', {
  state: () => ({
    tableOfContents: [] as any[],
    currentDoc: null as DocContent | null,
    searchResults: [] as SearchResult[],
    recentlyViewed: [] as string[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchTableOfContents() {
      try {
        this.loading = true;
        const { data } = await docsApi.getTableOfContents();
        this.tableOfContents = data;
      } catch (error: any) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchDoc(path: string) {
      try {
        this.loading = true;
        const { data } = await docsApi.getDoc(path);
        this.currentDoc = data;
        this.addToRecentlyViewed(path);
      } catch (error: any) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async searchDocs(query: string) {
      try {
        this.loading = true;
        const { data } = await docsApi.search(query);
        this.searchResults = data;
      } catch (error: any) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    addToRecentlyViewed(path: string) {
      this.recentlyViewed = [
        path,
        ...this.recentlyViewed.filter(p => p !== path)
      ].slice(0, 10);
    },

    clearError() {
      this.error = null;
    }
  },

  getters: {
    isLoading: (state) => state.loading,
    hasError: (state) => state.error !== null,
    getRecentlyViewed: (state) => state.recentlyViewed,

    getDocByPath: (state) => (path: string) => {
      for (const section of state.tableOfContents) {
        const found = section.items.find((item: any) => item.path === path);
        if (found) return found;
      }
      return null;
    }
  }
});
