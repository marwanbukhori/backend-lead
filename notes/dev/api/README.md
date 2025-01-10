# API Documentation

## Authentication

The platform uses JWT-based authentication. For detailed documentation of the authentication system, see [Authentication Documentation](auth.md).

Key features:

- JWT-based authentication
- Local strategy (email/password)
- Protected routes using JWT guards
- Secure password hashing
- Last login tracking

## Available Endpoints

### Users

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- Profile management (protected routes)

### Content

- Course management
- Lesson management
- Progress tracking

### Categories

- Category management
- Topic organization

For detailed API specifications and examples, see the corresponding documentation files in this directory.
