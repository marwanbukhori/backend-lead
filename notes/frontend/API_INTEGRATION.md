# API Integration Documentation

## 1. API Client Setup

```typescript
// api/axios.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      // Handle token refresh or logout
    }
    return Promise.reject(error);
  },
);

export default apiClient;
```

## 2. API Modules

### Auth API

```typescript
// api/auth.ts
import apiClient from './axios';

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post('/auth/login', credentials),

  register: (userData: RegisterData) =>
    apiClient.post('/auth/register', userData),

  refreshToken: () => apiClient.post('/auth/refresh'),
};
```

### Content API

```typescript
// api/content.ts
import apiClient from './axios';

export const contentApi = {
  getPublished: (topicId?: string) =>
    apiClient.get(`/content/published${topicId ? `?topicId=${topicId}` : ''}`),

  create: (data: CreateContentData) => apiClient.post('/content', data),

  update: (id: string, data: UpdateContentData) =>
    apiClient.patch(`/content/${id}`, data),

  publish: (id: string) => apiClient.post(`/content/${id}/publish`),

  delete: (id: string) => apiClient.delete(`/content/${id}`),
};
```

### Topics API

```typescript
// api/topics.ts
import apiClient from './axios';

export const topicsApi = {
  getAll: () => apiClient.get('/topics'),

  getById: (id: string) => apiClient.get(`/topics/${id}`),

  create: (data: CreateTopicData) => apiClient.post('/topics', data),

  update: (id: string, data: UpdateTopicData) =>
    apiClient.patch(`/topics/${id}`, data),
};
```

## 3. Error Handling

```typescript
// utils/error-handler.ts
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your data.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Forbidden. You do not have permission.';
      case 404:
        return 'Resource not found.';
      case 422:
        return 'Validation error. Please check your input.';
      default:
        return 'An error occurred. Please try again.';
    }
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.';
  } else {
    // Error in request configuration
    return 'Error in making request. Please try again.';
  }
};
```
