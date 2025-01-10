# Content Module

This module manages the learning content within topics, providing rich text content, code examples, and version control.

## CQRS Implementation

### Commands

- `CreateContentCommand`: Creates new content
  ```typescript
  new CreateContentCommand(createContentDto);
  ```
- `PublishContentCommand`: Publishes content
  ```typescript
  new PublishContentCommand(contentId);
  ```

### Queries

- `GetContentQuery`: Retrieves single content
  ```typescript
  new GetContentQuery(contentId);
  ```
- `GetPublishedContentQuery`: Retrieves published content
  ```typescript
  new GetPublishedContentQuery(topicId?)
  ```

### Events

- `ContentPublishedEvent`: Triggered when content is published
  ```typescript
  new ContentPublishedEvent(contentId);
  ```

### Domain Model

```typescript
class ContentModel extends AggregateRoot {
  // Properties
  id: string;
  topicId: string;
  title: string;
  body: string;
  codeExamples?: Array<{ language: string; code: string }>;
  status: ContentStatus;

  // Commands
  publish(): void;
  unpublish(): void;
  archive(): void;
}
```

### Factory

```typescript
class ContentFactory {
  create(dto: CreateContentDto): ContentModel;
  reconstitute(entity: Content): ContentModel;
}
```

### Usage Example

```typescript
// Creating content
const command = new CreateContentCommand(createContentDto);
await commandBus.execute(command);

// Publishing content
const publishCmd = new PublishContentCommand(contentId);
await commandBus.execute(publishCmd);

// Querying content
const query = new GetPublishedContentQuery(topicId);
const content = await queryBus.execute(query);
```

## Features

- CRUD operations for content
- Rich text content with code examples
- Content versioning
- Draft/publish/archive workflow
- Content ordering within topics
- Swagger/OpenAPI documentation
- Automatic seeding of sample content

## API Endpoints

### Content

| Method | Endpoint                     | Description            | Role Required |
| ------ | ---------------------------- | ---------------------- | ------------- |
| GET    | `/content`                   | List all content       | -             |
| GET    | `/content/published`         | List published content | -             |
| GET    | `/content/:id`               | Get content by ID      | -             |
| GET    | `/content/by-topic/:topicId` | List content by topic  | -             |
| POST   | `/content`                   | Create new content     | ADMIN         |
| PATCH  | `/content/:id`               | Update content         | ADMIN         |
| DELETE | `/content/:id`               | Delete content         | ADMIN         |
| POST   | `/content/:id/publish`       | Publish content        | ADMIN         |
| POST   | `/content/:id/unpublish`     | Unpublish content      | ADMIN         |
| POST   | `/content/:id/archive`       | Archive content        | ADMIN         |

## Data Structure

### Content Entity

```typescript
{
  id: string;          // UUID
  topicId: string;     // Reference to parent topic
  title: string;       // Content title
  body: string;        // Main content text
  codeExamples: {      // Optional code examples
    language: string;
    code: string;
    description?: string;
  }[];
  order: number;       // Display order within topic
  status: enum;        // DRAFT/PUBLISHED/ARCHIVED
  publishedAt: Date;   // When the content was published
  version: number;     // Content version
  createdAt: Date;     // Creation timestamp
  updatedAt: Date;     // Last update timestamp
}
```

### Content Status

```typescript
enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}
```

## Seeding Content

The module includes a seeder that automatically populates the database with sample content. The seeder is implemented in `content.seed.ts`.

### Default Content

1. REST API Content

   - What is REST? (Published)
   - REST Constraints (Published)

2. SQL Content

   - Basic SQL Queries (Published)

3. JWT Content

   - Understanding JWT Structure (Published)

4. Testing Content

   - Introduction to Testing (Published)

5. Caching Content
   - Caching Fundamentals (Published)

### Running the Seeder

The content seeder is integrated into the main seeding command:

```bash
npm run seed
```

This will:

1. Seed categories
2. Seed topics
3. Seed content with proper relationships

## Usage Examples

### Creating Content

```typescript
// POST /content
{
  "topicId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Introduction to REST APIs",
  "body": "REST (Representational State Transfer) is an architectural style...",
  "codeExamples": [
    {
      "language": "http",
      "code": "GET /api/users HTTP/1.1\nHost: example.com",
      "description": "Example GET request"
    }
  ],
  "order": 1,
  "status": "draft"
}
```

### Publishing Content

```typescript
// POST /content/:id/publish
// No body required
```

### Filtering Content by Topic and Status

```typescript
// GET /content/by-topic/:topicId?status=published
// Returns published content for the specified topic
```

## Relationships

- Each content belongs to a topic (`ManyToOne` relationship)
- Topics can have multiple content items (`OneToMany` relationship)
- Content is automatically deleted when its parent topic is deleted (CASCADE)

## Version Control

The module includes automatic version tracking:

- Each content update increments the version number
- Version history is maintained through the `@VersionColumn` decorator
- Useful for tracking content changes and implementing rollback features

## Event Flow

1. Content Creation:

   - `CreateContentCommand` → ContentModel created → Saved to database

2. Content Publishing:
   - `PublishContentCommand` → ContentModel.publish() → `ContentPublishedEvent` → Event handlers (logging, notifications, etc.)

## Benefits of CQRS

1. **Separation of Concerns**

   - Commands handle write operations
   - Queries handle read operations
   - Clear responsibility boundaries

2. **Domain-Driven Design**

   - ContentModel as aggregate root
   - Business logic encapsulation
   - Rich domain model

3. **Event-Driven Architecture**

   - Events for state changes
   - Decoupled side effects
   - Audit trail through events

4. **Scalability**
   - Separate read/write models
   - Optimized query handlers
   - Event sourcing ready
