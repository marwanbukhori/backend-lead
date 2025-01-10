# Authentication Setup Guide

## Environment Configuration

1. Set up required environment variables:

```bash
# JWT Configuration
JWT_SECRET=your_secure_secret_here
JWT_EXPIRATION=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## Security Setup

### 1. JWT Secret Generation

For production, generate a secure JWT secret:

```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'));"
```

### 2. Database Security

1. Ensure database user has minimal required permissions
2. Enable SSL for database connections in production
3. Regular backup of user data

### 3. Rate Limiting Setup

The authentication endpoints are protected by rate limiting:

```typescript
// Default configuration
- 100 requests per IP per 15 minutes for registration
- 5 requests per IP per 15 minutes for login attempts
```

## Monitoring

### 1. Authentication Metrics

Monitor these authentication-related events:

- Failed login attempts
- Registration rate
- Token validation failures
- Session duration

### 2. Security Alerts

Set up alerts for:

- Multiple failed login attempts from same IP
- Unusual registration patterns
- JWT validation errors
- Database connection issues

## Deployment Checklist

- [ ] JWT secret is securely configured
- [ ] CORS origins are properly set
- [ ] Database connection is secure
- [ ] Rate limiting is enabled
- [ ] Monitoring is configured
- [ ] SSL/TLS is enabled
- [ ] Security headers are configured

## Maintenance

1. Regular tasks:

   - Rotate JWT secrets
   - Review failed login attempts
   - Update CORS configurations
   - Check rate limiting effectiveness

2. Security updates:
   - Keep dependencies updated
   - Review security best practices
   - Update password hashing configurations if needed
