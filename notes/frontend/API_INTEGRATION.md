# API Integration

## Overview

The frontend communicates with the NestJS backend through a RESTful API. All API calls are made using Axios with a configured base client that handles authentication and error handling.

## API Client Setup

### Base Configuration

```typescript
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});
```

### Request Interceptor

```typescript
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Response Interceptor

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      const router = useRouter();
      authStore.logout();
      router.push("/login");
    }
    return Promise.reject(error);
  }
);
```

## API Services

### Authentication Service

```typescript
export const authService = {
  login: (credentials) => apiClient.post("/auth/login", credentials),
  register: (userData) => apiClient.post("/auth/register", userData),
  getCurrentUser: () => apiClient.get("/auth/me"),
};
```

### Content Service

```typescript
export const contentService = {
  getAll: () => apiClient.get("/content"),
  getById: (id) => apiClient.get(`/content/${id}`),
  create: (data) => apiClient.post("/content", data),
  update: (id, data) => apiClient.put(`/content/${id}`, data),
  delete: (id) => apiClient.delete(`/content/${id}`),
  publish: (id) => apiClient.post(`/content/${id}/publish`),
};
```

### Topics Service

```typescript
export const topicsService = {
  getAll: () => apiClient.get("/topics"),
  getById: (id) => apiClient.get(`/topics/${id}`),
  create: (data) => apiClient.post("/topics", data),
  update: (id, data) => apiClient.put(`/topics/${id}`, data),
  delete: (id) => apiClient.delete(`/topics/${id}`),
};
```

### Categories Service

```typescript
export const categoriesService = {
  getAll: () => apiClient.get("/categories"),
  getById: (id) => apiClient.get(`/categories/${id}`),
  create: (data) => apiClient.post("/categories", data),
  update: (id, data) => apiClient.put(`/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/categories/${id}`),
};
```

## Error Handling

### Global Error Handler

```typescript
const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 400:
        return "Invalid request";
      case 401:
        return "Unauthorized";
      case 403:
        return "Forbidden";
      case 404:
        return "Not found";
      case 500:
        return "Server error";
      default:
        return "Something went wrong";
    }
  } else if (error.request) {
    // Request made but no response
    return "Network error";
  } else {
    // Error in request configuration
    return "Request error";
  }
};
```

## Usage in Components

### Example: Fetching Data

```typescript
const fetchContent = async () => {
  try {
    loading.value = true;
    const response = await contentService.getAll();
    content.value = response.data;
  } catch (error) {
    errorMessage.value = handleApiError(error);
  } finally {
    loading.value = false;
  }
};
```

### Example: Submitting Data

```typescript
const createTopic = async (topicData: TopicData) => {
  try {
    loading.value = true;
    await topicsService.create(topicData);
    router.push("/topics");
  } catch (error) {
    errorMessage.value = handleApiError(error);
  } finally {
    loading.value = false;
  }
};
```

## Best Practices

1. **Error Handling**

   - Always use try-catch blocks
   - Provide meaningful error messages
   - Handle network errors gracefully

2. **Loading States**

   - Show loading indicators during requests
   - Disable form submissions while loading
   - Handle long-running operations

3. **Data Validation**

   - Validate data before sending to API
   - Handle validation errors from server
   - Show validation feedback to users

4. **Security**
   - Never expose sensitive data
   - Validate all user inputs
   - Handle token expiration
