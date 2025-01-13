# Documentation Repository Architecture

## Overview

A streamlined documentation repository with working demos of backend concepts. The system serves two purposes:

1. Organize and serve technical documentation
2. Provide working examples of backend concepts

## Project Structure

```
documentation-repo/
├── apps/
│   ├── backend/                # NestJS Backend Application
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── docs/      # Documentation handling
│   │   │   │   ├── auth/      # Authentication
│   │   │   │   ├── topics/    # Topic management
│   │   │   │   ├── content/   # Content management
│   │   │   │   └── categories/# Category organization
│   │   │   └── config/        # Configuration
│   │   └── package.json
│   │
│   └── frontend/              # Vue.js Frontend Application
│       ├── src/
│       │   ├── components/    # Vue components
│       │   ├── stores/        # Pinia state management
│       │   ├── services/      # API services
│       │   └── views/         # Page components
│       └── package.json
│
└── notes/                     # Documentation Content
    ├── concepts/             # Core technical concepts
    ├── development/         # Development guides
    ├── best-practices/      # Best practices
    └── features/           # Feature documentation

```

## Database Design

### Core Tables

1. **users**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  role VARCHAR(50) NOT NULL,
  isEmailVerified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. **categories**

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. **documents**

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  path VARCHAR(255) UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id),
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  views INTEGER DEFAULT 0,
  search_vector tsvector,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

4. **document_sections**

```sql
CREATE TABLE document_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  level INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

5. **bookmarks**

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  document_id UUID REFERENCES documents(id),
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, document_id)
);
```

## Core Features

1. **Documentation Management**

   - Markdown content storage and rendering
   - Document categorization
   - Section-based content organization
   - Full-text search with PostgreSQL tsvector
   - Document versioning and metadata

2. **User Features**

   - Authentication with JWT
   - User roles and permissions
   - Document bookmarking
   - Reading progress tracking
   - Personal notes on documents

3. **Content Organization**

   - Hierarchical categories
   - Document tagging
   - Custom ordering
   - Related content linking

4. **Search & Discovery**

   - Full-text search
   - Category-based browsing
   - Tag-based filtering
   - Command palette for quick navigation

## Frontend Architecture

1. **State Management**

   - Pinia stores for global state
   - Vue composition API for component state
   - Reactive data management
   - Persistent storage for user preferences

2. **UI Components**

   - Markdown viewer with syntax highlighting
   - Table of contents navigation
   - Command palette for quick search
   - Responsive layout with Tailwind CSS
   - Black and white theme with accent colors

3. **Routing & Navigation**

   - Vue Router integration
   - Dynamic route generation
   - Protected routes
   - Navigation guards

## Backend Architecture

1. **Module Organization**

   - Feature-based module structure
   - Clean architecture principles
   - Dependency injection
   - TypeORM for database access

2. **API Design**

   - RESTful endpoints
   - JWT authentication
   - Request validation
   - Error handling

3. **Database**

   - PostgreSQL with TypeORM
   - Full-text search
   - GiST indexes for search optimization
   - Database migrations
   - Seeding system

## Development Workflow

1. **Documentation**

   - Git-based versioning
   - Markdown editing
   - Automated deployment
   - Search indexing

2. **Development**

   - TypeScript throughout
   - ESLint + Prettier
   - Husky pre-commit hooks
   - Automated testing
