# Testing Authentication Flow

## Prerequisites

1. Application is running (`npm run start:dev`)
2. Database is created and configured
3. Access Swagger UI at: `http://localhost:3000/api/docs`

## 1. Register a New User

### Using Swagger UI

1. Navigate to `Users` section
2. Find `POST /users` endpoint
3. Click "Try it out"
4. Use this sample payload:

```json
{
  "email": "admin@example.com",
  "password": "Admin123!",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin"
}
```

5. Click "Execute"
6. Expected response: Status 201 with user data

### Using cURL

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

## 2. Login

### Using Swagger UI

1. Navigate to `Auth` section
2. Find `POST /auth/login` endpoint
3. Click "Try it out"
4. Use this sample payload:

```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

5. Click "Execute"
6. Expected response: Status 200 with access token and user data
7. Copy the `accessToken` value

### Using cURL

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

## 3. Using the Access Token

### Authorize in Swagger UI

1. Click the "Authorize" button at the top
2. Enter token in format: `Bearer your-access-token`
3. Click "Authorize"
4. Now you can access protected endpoints

### Test Protected Endpoint

1. Try `GET /auth/profile` to verify authentication
2. Expected response: Your user profile data

### Using cURL with Token

```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer your-access-token"
```

## Common Test Cases

### 1. Registration Validation

- Try registering with invalid email format
- Try registering with short password
- Try registering with existing email
- Try registering without required fields

### 2. Login Validation

- Try login with wrong password
- Try login with non-existent email
- Try login with invalid format

### 3. Token Usage

- Try accessing protected route without token
- Try accessing protected route with invalid token
- Try accessing admin routes with non-admin user

## Expected Error Responses

### Registration Errors

- Email exists: 409 Conflict
- Invalid data: 400 Bad Request

### Login Errors

- Invalid credentials: 401 Unauthorized
- Invalid format: 400 Bad Request

### Authorization Errors

- No token: 401 Unauthorized
- Invalid token: 401 Unauthorized
- Insufficient permissions: 403 Forbidden

## Testing Regular User Flow

### Register Regular User

```json
{
  "email": "user@example.com",
  "password": "User123!",
  "firstName": "Regular",
  "lastName": "User",
  "role": "user"
}
```

### Test Role-Based Access

1. Login as regular user
2. Try accessing admin-only endpoints (should get 403 Forbidden)
3. Try accessing user-level endpoints (should succeed)

## Troubleshooting

### Common Issues

1. **Database Connection**

   - Verify PostgreSQL is running
   - Check database credentials in `.env`

2. **Token Issues**

   - Verify token format includes 'Bearer '
   - Check token expiration
   - Verify JWT_SECRET in `.env`

3. **Validation Errors**
   - Check request payload format
   - Verify all required fields are included
   - Ensure password meets complexity requirements
