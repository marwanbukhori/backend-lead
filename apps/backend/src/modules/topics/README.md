# Topics Module

This module manages knowledge topics within categories, providing structured content organization for the Source Of Truth platform.

## Features

- CRUD operations for topics
- Category-based organization
- Difficulty level management
- Order-based content sequencing
- Swagger/OpenAPI documentation
- Automatic seeding of initial topics

## API Endpoints

### Topics

| Method | Endpoint                          | Description             | Role Required |
| ------ | --------------------------------- | ----------------------- | ------------- |
| GET    | `/topics`                         | List all topics         | -             |
| GET    | `/topics/:id`                     | Get topic by ID         | -             |
| GET    | `/topics/by-category/:categoryId` | List topics by category | -             |
| POST   | `/topics`                         | Create new topic        | ADMIN         |
| PATCH  | `/topics/:id`                     | Update topic            | ADMIN         |
| DELETE | `/topics/:id`                     | Delete topic            | ADMIN         |

## Data Structure

### Topic Entity

```typescript
{
  id: string;          // UUID
  categoryId: string;  // Reference to parent category
  title: string;       // Topic title
  slug: string;        // URL-friendly title
  description: string; // Optional description
  order: number;       // Display order within category
  difficulty: enum;    // BEGINNER/INTERMEDIATE/ADVANCED
  createdAt: Date;     // Creation timestamp
  updatedAt: Date;     // Last update timestamp
}
```

### Difficulty Levels

```typescript
enum TopicDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}
```

## Seeding Topics

The module includes a seeder that automatically populates the database with predefined topics. The seeder is implemented in `topics.seed.ts`.

### Default Topics

1. REST API Principles

   - Introduction to REST (Beginner)
   - HTTP Methods and Status Codes (Beginner)
   - RESTful Resource Design (Intermediate)

2. SQL Basics

   - SQL Query Fundamentals (Beginner)
   - Joins and Relationships (Intermediate)

3. JWT Authentication

   - JWT Structure and Flow (Beginner)
   - Implementing JWT Authentication (Intermediate)
   - JWT Security Best Practices (Advanced)

4. Unit Testing

   - Testing Fundamentals (Beginner)
   - Writing Effective Unit Tests (Intermediate)

5. Caching Strategies
   - Caching Basics (Beginner)
   - Cache Invalidation Strategies (Advanced)

### Running the Seeder

There are two ways to run the seeder:

#### 1. Using CLI Command (Recommended)

The easiest way to seed the database is using the provided CLI command:

```bash
# This will run both categories and topics seeders in the correct order
npm run seed
```

The seeder will:

- First seed the categories (required for topics)
- Then seed the topics with proper category relationships
- Show progress with descriptive messages
- Handle any errors that occur during seeding

#### 2. Programmatically

You can also run the seeder programmatically by injecting both seeders into your application:

```typescript
@Injectable()
export class AppService {
  constructor(
    private readonly categoriesSeeder: CategoriesSeeder,
    private readonly topicsSeeder: TopicsSeeder,
  ) {}

  async seed() {
    // First seed categories
    await this.categoriesSeeder.seed();
    // Then seed topics
    await this.topicsSeeder.seed();
  }
}
```

## Usage Examples

### Creating a Topic

```typescript
// POST /topics
{
  "categoryId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "REST API Principles",
  "slug": "rest-api-principles",
  "description": "Understanding REST architectural principles and constraints",
  "order": 1,
  "difficulty": "beginner"
}
```

### Updating a Topic

```typescript
// PATCH /topics/:id
{
  "title": "Updated Topic Title",
  "difficulty": "intermediate"
}
```

### Fetching Topics by Category

```typescript
// GET /topics/by-category/:categoryId
// Returns an array of topics sorted by order and title
```

## Relationships

- Each topic belongs to a category (`ManyToOne` relationship)
- Categories can have multiple topics (`OneToMany` relationship)
- Topics are automatically deleted when their parent category is deleted (CASCADE)
