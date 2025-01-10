# Database Setup and Configuration

## Overview

Our application uses PostgreSQL as the primary database, with TypeORM as the Object-Relational Mapping (ORM) tool. This setup provides robust data persistence with type safety and elegant database operations through TypeORM's features.

## PostgreSQL Setup

### 1. Database Creation

```bash
# Command breakdown:
psql -h localhost -U postgres -c "CREATE DATABASE senior_backend_demo;"

# Where:
# -h localhost    : Connects to PostgreSQL server on localhost
# -U postgres     : Uses the 'postgres' superuser account
# -c             : Executes the following SQL command
# CREATE DATABASE : Creates a new database named 'senior_backend_demo'
```

### 2. Database Configuration

Configuration is managed through environment variables in `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=senior_backend_demo
```

## TypeORM Configuration

### 1. Configuration File (`src/config/database.config.ts`)

```typescript
export default registerAs("database", () => ({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "senior_backend_demo",
  entities: ["dist/**/*.entity{.ts,.js}"],
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
}));
```

### 2. Module Integration (`src/app.module.ts`)

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (databaseConfig) => ({
    ...databaseConfig,
    autoLoadEntities: true,
  }),
  inject: [databaseConfig.KEY],
});
```

## Database Schema

### 1. Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  is_email_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Entity Relationships

### Current Entities

1. **User Entity** (`src/modules/users/entities/user.entity.ts`)
   - Standalone entity with no current relationships
   - Handles user authentication and profile data

## TypeORM Features Used

### 1. Entity Decorators

- `@Entity()`: Marks classes as database entities
- `@Column()`: Defines table columns
- `@PrimaryGeneratedColumn()`: Creates auto-generated primary keys
- `@CreateDateColumn()`: Automatically handles creation timestamps
- `@UpdateDateColumn()`: Automatically handles update timestamps

### 2. Repository Pattern

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}
}
```

## Database Management

### 1. Development Mode

- `synchronize: true` automatically creates/updates database schema
- Logging enabled for SQL queries
- Not recommended for production

### 2. Production Mode

- `synchronize: false` to prevent automatic schema changes
- Logging disabled
- Migrations should be used for schema changes

## Best Practices

1. **Security**

   - Never store plain-text passwords
   - Use environment variables for credentials
   - Implement proper indexing for frequently queried fields

2. **Performance**

   - Use pagination for large datasets
   - Implement proper caching strategies
   - Monitor query performance

3. **Data Integrity**
   - Use transactions for complex operations
   - Implement proper constraints
   - Regular backups

## Future Considerations

1. **Migrations**

   - Implement TypeORM migrations for schema changes
   - Version control for database schema

2. **Optimization**

   - Add indexes for frequently queried columns
   - Implement query caching
   - Add database replication for read/write splitting

3. **Monitoring**
   - Add database monitoring
   - Query performance tracking
   - Connection pool monitoring
