# Authentication API Documentation

## Overview

The platform uses JWT (JSON Web Token) based authentication with Passport.js strategies. Authentication is handled through the `/auth` endpoints, supporting both local authentication (email/password) and JWT token verification.

## Authentication Flow

1. Users register with email/password
2. Users login with credentials to receive JWT token
3. Subsequent requests use JWT token in Authorization header

## Endpoints

### Register New User

```http
POST /auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe"
}
```

**Response (200 OK)**

```json
{
  "access_token": "eyJhbG...token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword"
}
```

**Response (200 OK)**

```json
{
  "access_token": "eyJhbG...token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

## Authentication Strategies

### Local Strategy

- Uses email/password for authentication
- Validates credentials against database
- Updates last login timestamp on successful login

### JWT Strategy

- Validates JWT tokens for protected routes
- Extracts user information from token payload
- Used for all authenticated API endpoints

## Using Authentication

### Protected Routes

Add the JWT token to the Authorization header for protected routes:

```http
GET /api/protected-route
Authorization: Bearer eyJhbG...token
```

### Error Responses

- **401 Unauthorized**: Invalid credentials or token
- **409 Conflict**: Email already exists (registration)

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- Last login tracking for security monitoring
- CORS protection enabled
- Rate limiting implemented for auth endpoints

## Implementation Details

The authentication system is implemented using:

- NestJS Passport module
- JWT module for token handling
- TypeORM for user management
- bcrypt for password hashing
