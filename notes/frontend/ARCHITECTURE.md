# Frontend Architecture Documentation

## 1. Project Structure

```
frontend/
├── src/
│   ├── api/                 # API integration layer
│   ├── assets/             # Static assets
│   ├── components/         # Reusable Vue components
│   ├── composables/        # Vue 3 composables
│   ├── stores/            # Pinia state management
│   ├── views/             # Page components
│   └── router/            # Vue Router configuration
```

## 2. Core Technologies

- **Vue.js 3**: Using Composition API with `<script setup>`
- **Pinia**: State management
- **Vue Router**: Client-side routing
- **Axios**: HTTP client
- **Vite**: Build tool

## 3. Integration with Backend

- Backend API endpoint: `http://localhost:3000`
- CORS enabled for frontend origin: `http://localhost:5173`
- JWT-based authentication
- Redis caching for improved performance
