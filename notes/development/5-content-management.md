# Content Management System Implementation

## Content Structure

### 1. Categories

```typescript
interface Category {
  id: string;
  name: string; // e.g., "Database", "Authentication", "API Design"
  slug: string; // URL-friendly name
  description: string;
  order: number; // For custom ordering
  parentId?: string; // For nested categories
}
```

### 2. Topics

```typescript
interface Topic {
  id: string;
  categoryId: string;
  title: string; // e.g., "SQL Basics", "JWT Authentication"
  slug: string;
  description: string;
  order: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
```

### 3. Content

```typescript
interface Content {
  id: string;
  topicId: string;
  title: string;
  content: string; // Markdown content
  type: 'concept' | 'tutorial' | 'example' | 'exercise';
  order: number;
  metadata: {
    prerequisites?: string[];
    timeToComplete?: number;
    tags?: string[];
  };
}
```

### 4. Code Examples

```typescript
interface CodeExample {
  id: string;
  contentId: string;
  title: string;
  description: string;
  code: string;
  language: string;
  framework?: string;
  runnable: boolean; // Whether it can be executed in playground
}
```

## Database Schema

### Categories Table

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  order_number INTEGER NOT NULL DEFAULT 0,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Topics Table

```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  order_number INTEGER NOT NULL DEFAULT 0,
  difficulty VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Contents Table

```sql
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  order_number INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Code Examples Table

```sql
CREATE TABLE code_examples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES contents(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  framework VARCHAR(50),
  runnable BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Initial Categories and Topics

### Backend Fundamentals

1. API Design

   - REST API Principles
   - API Versioning
   - Error Handling
   - Request/Response Patterns

2. Database Management

   - SQL Basics
   - Database Design
   - Migrations
   - Query Optimization

3. Authentication & Authorization

   - JWT Authentication
   - OAuth 2.0
   - Role-Based Access Control
   - Security Best Practices

4. Testing

   - Unit Testing
   - Integration Testing
   - E2E Testing
   - Test-Driven Development

5. Performance
   - Caching Strategies
   - Database Indexing
   - Load Balancing
   - Performance Monitoring

## Implementation Steps

1. Create Entities

   - Category entity
   - Topic entity
   - Content entity
   - CodeExample entity

2. Create DTOs

   - Create/Update DTOs for each entity
   - Response DTOs with relationships

3. Create Services

   - CRUD operations for each entity
   - Content versioning
   - Search functionality

4. Create Controllers

   - REST endpoints for each entity
   - File upload for content
   - Search endpoints

5. Add Features
   - Markdown rendering
   - Code syntax highlighting
   - Content versioning
   - Search indexing

## API Endpoints

### Categories

- GET /categories - List all categories
- GET /categories/:id - Get category details
- POST /categories - Create category
- PATCH /categories/:id - Update category
- DELETE /categories/:id - Delete category

### Topics

- GET /topics - List all topics
- GET /topics/:id - Get topic details
- POST /topics - Create topic
- PATCH /topics/:id - Update topic
- DELETE /topics/:id - Delete topic

### Contents

- GET /contents - List all contents
- GET /contents/:id - Get content details
- POST /contents - Create content
- PATCH /contents/:id - Update content
- DELETE /contents/:id - Delete content
- GET /contents/search - Search contents

### Code Examples

- GET /code-examples - List all examples
- GET /code-examples/:id - Get example details
- POST /code-examples - Create example
- PATCH /code-examples/:id - Update example
- DELETE /code-examples/:id - Delete example
- POST /code-examples/:id/execute - Execute code example
