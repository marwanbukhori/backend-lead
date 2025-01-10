# Authentication

## Overview

The application uses JWT (JSON Web Token) based authentication. The authentication flow is managed through the Pinia store and protected routes in Vue Router.

## Authentication Flow

1. **Login Process**

   ```mermaid
   sequenceDiagram
       participant User
       participant Frontend
       participant AuthStore
       participant Backend
       User->>Frontend: Enter credentials
       Frontend->>Backend: POST /auth/login
       Backend->>Frontend: Return JWT token
       Frontend->>AuthStore: Store token
       AuthStore->>LocalStorage: Save token
       Frontend->>User: Redirect to dashboard
   ```

2. **Token Management**

   - Tokens are stored in localStorage
   - Automatically attached to API requests
   - Cleared on logout or expiration

3. **Protected Routes**
   ```typescript
   // Route guard example
   router.beforeEach((to, from, next) => {
     const authStore = useAuthStore();
     if (to.meta.requiresAuth && !authStore.isAuthenticated) {
       next("/login");
     } else {
       next();
     }
   });
   ```

## Components

### LoginView

- Email/password form
- Error handling
- Remember me functionality
- Redirect after login

### RegisterView

- Registration form
- Field validation
- Success/error handling
- Automatic login after registration

## State Management

### Auth Store

```typescript
export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = computed(() => !!token.value);

  // Token management
  function setToken(newToken: string | null) {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
  }

  // User management
  function setUser(newUser: User | null) {
    user.value = newUser;
  }

  // Logout
  function logout() {
    user.value = null;
    setToken(null);
  }
});
```

## API Integration

### Auth Service

```typescript
import apiClient from "./client";

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  async register(userData: RegisterData) {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};
```

## Security Considerations

1. **Token Storage**

   - Tokens stored in localStorage
   - Cleared on logout
   - Automatic cleanup on expiration

2. **Request Security**

   - HTTPS required in production
   - CSRF protection
   - XSS prevention

3. **Error Handling**
   - Invalid credentials
   - Token expiration
   - Network errors
   - Server errors
