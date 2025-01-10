# Frontend Architecture

## Project Structure

```
apps/frontend/
├── src/
│   ├── api/              # API client and service modules
│   ├── assets/           # Static assets (images, styles)
│   ├── components/       # Vue components
│   │   ├── common/       # Reusable UI components
│   │   ├── layout/       # Layout components
│   │   ├── auth/         # Authentication components
│   │   ├── topics/       # Topic-related components
│   │   ├── content/      # Content-related components
│   │   └── categories/   # Category-related components
│   ├── composables/      # Vue composable functions
│   ├── router/           # Vue Router configuration
│   ├── stores/           # Pinia stores
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Utility functions
│   ├── views/            # Page components
│   ├── App.vue           # Root component
│   └── main.ts          # Application entry point
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Core Technologies

- **Vue.js 3**: Frontend framework with Composition API
- **TypeScript**: For type safety and better developer experience
- **Vite**: Build tool and development server
- **Pinia**: State management
- **Vue Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests

## Key Features

1. **Authentication**

   - JWT-based authentication
   - Protected routes
   - Persistent login state

2. **State Management**

   - Centralized state with Pinia
   - Modular store design
   - Type-safe state mutations

3. **API Integration**

   - Axios instance with interceptors
   - Automatic token handling
   - Error handling and retry logic

4. **Routing**
   - Route guards for authentication
   - Lazy-loaded components
   - Type-safe route parameters

## Configuration Files

### Vite Configuration (vite.config.ts)

```typescript
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Tailwind Configuration (tailwind.config.js)

```javascript
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          /* color palette */
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
```

## Component Organization

### Common Components

- Buttons, inputs, cards, and other reusable UI elements
- Consistent styling and behavior
- Type-safe props and events

### Layout Components

- Navigation bar
- Sidebar
- Footer
- Page layouts

### Feature Components

- Topic management
- Content management
- Category management
- Authentication forms

## State Management

### Auth Store

- User authentication state
- JWT token management
- Login/logout functionality

### Content Store

- Content management
- CRUD operations
- Content filtering and search

### Topics Store

- Topic management
- Topic hierarchies
- Topic-content relationships

## API Integration

### API Client

- Base configuration
- Request/response interceptors
- Error handling

### Service Modules

- Authentication service
- Content service
- Topics service
- Categories service
