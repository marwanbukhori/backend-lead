# State Management Documentation

## 1. Pinia Stores

### Auth Store

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    loading: false,
  }),

  actions: {
    async login(credentials: LoginCredentials) {
      this.loading = true;
      try {
        const response = await authApi.login(credentials);
        this.token = response.data.token;
        this.user = response.data.user;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
    },
  },

  persist: {
    paths: ['token'],
  },
});
```

### Content Store

```typescript
// stores/content.ts
export const useContentStore = defineStore('content', {
  state: () => ({
    contents: [] as Content[],
    currentContent: null as Content | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchPublishedContent(topicId?: string) {
      this.loading = true;
      try {
        const response = await contentApi.getPublished(topicId);
        this.contents = response.data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
  },
});
```

## 2. Composables

### useCache

```typescript
// composables/useCache.ts
export function useCache<T>(key: string, ttl: number = 3600) {
  const getData = async (fetchFn: () => Promise<T>) => {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ttl * 1000) {
        return data;
      }
    }
    const data = await fetchFn();
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
    );
    return data;
  };

  return { getData };
}
```

### useErrorHandler

```typescript
// composables/useErrorHandler.ts
export function useErrorHandler() {
  const handleError = (error: any) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      router.push('/login');
    }
    // Handle other error cases
  };

  return { handleError };
}
```
