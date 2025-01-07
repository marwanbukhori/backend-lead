# Senior Backend Demo

A NestJS-based backend application demonstrating senior-level architectural patterns and best practices.

## Features

- User authentication and authorization with JWT
- Role-based access control (RBAC)
- Hierarchical content management (Categories & Topics)
- Database seeding through CLI
- API documentation with Swagger/OpenAPI
- TypeORM for database management
- PostgreSQL as the database

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd senior-backend-demo
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the application:

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## CLI Commands

The application includes several CLI commands to help with common tasks:

### Database Seeding

Populate the database with initial data:

```bash
npm run seed
```

This command will:

- Seed categories (main categories and subcategories)
- Seed topics with proper category relationships
- Show progress with descriptive messages
- Handle errors gracefully

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api
```

## Project Structure

```
src/
├── modules/           # Feature modules
│   ├── auth/         # Authentication module
│   ├── users/        # User management
│   ├── categories/   # Content categories
│   └── topics/       # Learning topics
├── commands/         # CLI commands
├── config/          # Configuration
└── common/          # Shared resources
```

## Available Scripts

- `npm run start:dev` - Start the application in development mode
- `npm run build` - Build the application
- `npm run start:prod` - Start the application in production mode
- `npm run test` - Run tests
- `npm run lint` - Run linting
- `npm run seed` - Run database seeders

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
