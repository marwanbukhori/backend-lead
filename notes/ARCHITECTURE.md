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
│   │   │   │   ├── auth/      # Authentication demo
│   │   │   │   ├── chat/      # WebSocket demo
│   │   │   │   ├── tasks/     # CQRS demo
│   │   │   │   └── cache/     # Redis caching demo
│   │   │   └── config/        # Configuration
│   │   └── package.json
│   │
│   └── frontend/              # Vue.js Frontend Application
│       ├── src/
│       │   ├── components/    # Vue components
│       │   ├── stores/        # State management
│       │   └── views/         # Page components
│       └── package.json
│
└── notes/                     # Documentation Content
    ├── concepts/             # Core technical concepts
    │   ├── cqrs/            # CQRS documentation + demo explanation
    │   ├── caching/         # Caching strategies + demo explanation
    │   ├── websockets/      # WebSocket implementation + demo
    │   └── auth/            # Authentication patterns + demo
    ├── guides/             # Development guides
    └── best-practices/     # Best practices documentation

```

## Database Design

### Core Tables

1. **users**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. **documents**

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  path VARCHAR(255) UNIQUE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. **bookmarks**

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  document_id UUID REFERENCES documents(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, document_id)
);
```

### Demo Tables

1. **tasks** (CQRS Demo)

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_events (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. **chat_messages** (WebSocket Demo)

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  room_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Backend Concepts Implementation

### 1. CQRS Pattern (Task Management Demo)

- Command Bus: Task creation/updates
- Query Bus: Task retrieval
- Event Store: Task event logging
- Event Sourcing: Task state reconstruction

### 2. Caching Strategy (Redis)

- Document caching
- Search results caching
- User session management
- Rate limiting implementation

### 3. WebSocket Implementation (Chat Demo)

- Real-time messaging
- Room management
- Presence tracking
- Message history

### 4. Authentication

- JWT implementation
- Role-based access
- Session management
- Security best practices

## Core Features

1. **Documentation Management**

   - Markdown content storage
   - Version control
   - Search functionality
   - Navigation system

2. **Working Demos**

   - CQRS task management
   - Real-time chat
   - Caching examples
   - Authentication flows

3. **User Features**
   - Authentication
   - Bookmarks
   - Reading progress
   - Demo interaction

## Development Workflow

1. **Documentation**

   - Git-based versioning
   - Markdown editing
   - Automated deployment
   - Search indexing

2. **Demo Development**
   - Isolated modules
   - Clear documentation
   - Integration tests
   - Performance monitoring
