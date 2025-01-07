# Authentication and User Management Implementation

## Overview

We have implemented a comprehensive authentication and user management system using NestJS, TypeORM, and Passport.js. The system provides secure user authentication, role-based authorization, and user management functionalities.

## Core Components

### 1. User Entity (`src/modules/users/entities/user.entity.ts`)

- Defines the user model with properties:
  - Basic info: `id`, `email`, `firstName`, `lastName`
  - Security: `password` (hashed), `role`
  - Email verification: `isEmailVerified`, `verificationToken`
  - Password reset: `passwordResetToken`, `passwordResetExpires`
  - Timestamps: `createdAt`, `updatedAt`
- Implements password hashing using bcrypt
- Uses class-transformer to exclude sensitive fields from responses

### 2. User Module (`src/modules/users/users.module.ts`)

- Provides user management functionality
- Exports `UsersService` for use in other modules
- Uses TypeORM for database operations

### 3. Authentication Module (`src/modules/auth/auth.module.ts`)

- Implements JWT-based authentication
- Configures Passport.js strategies
- Manages JWT token generation and validation

### 4. Guards and Decorators

- `JwtAuthGuard`: Protects routes requiring authentication
- `RolesGuard`: Implements role-based access control
- `@Roles()` decorator: Specifies required roles for endpoints

### 5. DTOs

- `CreateUserDto`: Validates user registration data
- `UpdateUserDto`: Validates user update data
- `LoginDto`: Validates login credentials

## Features Implemented

### Authentication

- User registration with password hashing
- Login with JWT token generation
- JWT-based route protection
- Role-based access control (Admin/User roles)

### User Management

- CRUD operations for users
- Pagination for user listing
- Email verification system
- Password reset functionality
  - Request password reset
  - Reset password with token
- Profile management

### Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Email verification
- Secure password reset flow

## API Endpoints

### Authentication

- `POST /auth/login`: User login
- `GET /auth/profile`: Get current user profile

### User Management

- `POST /users`: Create new user (Admin only)
- `GET /users`: List all users (Admin only)
- `GET /users/:id`: Get user by ID
- `PATCH /users/:id`: Update user
- `DELETE /users/:id`: Delete user (Admin only)
- `POST /users/verify-email/:token`: Verify email
- `POST /users/request-password-reset`: Request password reset
- `POST /users/reset-password/:token`: Reset password

## Dependencies Added

- `@nestjs/passport`: NestJS Passport integration
- `passport`: Authentication middleware
- `passport-jwt`: JWT strategy for Passport
- `passport-local`: Local strategy for Passport
- `@types/passport-jwt`: TypeScript definitions for passport-jwt
- `@types/passport-local`: TypeScript definitions for passport-local
- `bcrypt`: Password hashing

## Security Considerations

- Passwords are hashed before storage
- Sensitive data is excluded from responses
- JWT tokens are used for stateless authentication
- Role-based access control is implemented
- Email verification is required
- Secure password reset flow with expiring tokens
- Rate limiting should be added (TODO)
- Request validation using class-validator
