# Setup Guide

## Local Development Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/source-of-truth.git
cd source-of-truth
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

### Backend Environment (.env in apps/backend)

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=learning_platform
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1h

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend Environment (.env in apps/frontend)

```env
VITE_API_URL=http://localhost:3000
```

## Development

Start both applications in development mode:

```bash
npm run dev
```

Or start them individually:

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

## Database Setup

1. Create PostgreSQL database:

```sql
CREATE DATABASE learning_platform;
```

2. Run migrations:

```bash
cd apps/backend
npm run typeorm migration:run
```

3. Seed initial data:

```bash
cd apps/backend
npm run seed
```

## Available Endpoints

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api

## Common Issues

### CORS Issues

The backend is configured to accept requests from the frontend's default port (5173). If you change the frontend port, update the CORS configuration in `apps/backend/src/main.ts`.

### Database Connection

Make sure PostgreSQL is running and the database exists before starting the backend.

### Redis Connection

Ensure Redis is running on the default port (6379) or update the configuration in `apps/backend/src/config/cache.config.ts`.
