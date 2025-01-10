# Categories Module

This module handles the management of knowledge categories and their subcategories in the Source Of Truth platform.

## Features

- CRUD operations for categories
- Support for hierarchical categories (parent-child relationships)
- Automatic seeding of predefined categories
- Swagger/OpenAPI documentation

## API Endpoints

### Categories

| Method | Endpoint          | Description         | Role Required |
| ------ | ----------------- | ------------------- | ------------- |
| GET    | `/categories`     | List all categories | -             |
| GET    | `/categories/:id` | Get category by ID  | -             |
| POST   | `/categories`     | Create new category | ADMIN         |
| PATCH  | `/categories/:id` | Update category     | ADMIN         |
| DELETE | `/categories/:id` | Delete category     | ADMIN         |

## Data Structure

### Category Entity

```typescript
{
  id: string; // UUID
  name: string; // Category name
  slug: string; // URL-friendly name
  description: string; // Optional description
  parentId: string; // Optional parent category ID
  order: number; // Display order
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
```

## Seeding Categories

The module includes a seeder that automatically populates the database with predefined categories. The seeder is implemented in `categories.seed.ts`.

### Default Categories

1. API Design

   - REST API Principles
   - API Versioning
   - Error Handling

2. Database Management

   - SQL Basics
   - Database Design
   - Query Optimization

3. Authentication & Authorization

   - JWT Authentication
   - OAuth 2.0
   - Role-Based Access Control

4. Testing

   - Unit Testing
   - Integration Testing
   - E2E Testing

5. Performance
   - Caching Strategies
   - Database Indexing
   - Load Balancing

### Running the Seeder

There are two ways to run the seeder:

#### 1. Using CLI Command (Recommended)

The easiest way to seed the database is using the provided CLI command:

```bash
# This will run both categories and topics seeders in the correct order
npm run seed
```

#### 2. Programmatically

You can also run the seeder programmatically by injecting the `CategoriesSeeder` into your application:

```typescript
@Injectable()
export class AppService {
  constructor(private readonly categoriesSeeder: CategoriesSeeder) {}

  async seedCategories() {
    await this.categoriesSeeder.seed();
  }
}
```
