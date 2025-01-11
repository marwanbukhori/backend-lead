# Source Of Truth

A comprehensive knowledge platform built with NestJS and Vue.js, designed to be the definitive source of truth for backend and cloud programming concepts. This platform aims to provide structured, maintainable, and accessible documentation for development teams.

## Project Status & Milestones

### Completed Features ✅

- [x] Project setup and architecture
- [x] Authentication system
  - User registration with email/password
  - JWT-based login system
  - Protected routes implementation
- [x] Database integration with PostgreSQL
- [x] CORS and security configurations
- [x] Comprehensive documentation structure

### In Progress 🚧

- [ ] Documentation content management
  - Content creation endpoints
  - Content organization system
  - Version control for documentation
- [ ] User profile management
- [ ] Search functionality
- [ ] Content categorization system

### Future Milestones 🎯

- [ ] Interactive code examples
- [ ] User progress tracking
- [ ] Community features
  - Comments and discussions
  - User contributions
- [ ] Advanced search with filters
- [ ] API documentation generator
- [ ] Integration with cloud services

## Quick Start with Docker

1. Clone the repository:

```bash
git clone https://github.com/yourusername/source-of-truth.git
cd source-of-truth
```

2. Copy environment files:

```bash
cp .env.example .env
```

3. Start with Docker Compose:

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

4. Set up the database:

```bash
# Run migrations
docker-compose exec backend npm run migration:run

# Seed initial data
docker-compose exec backend npm run seed
```

5. Access the application:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api

Default credentials:

- Email: admin@example.com
- Password: admin123

## Manual Setup (Without Docker)

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
# Copy example env file
cp .env.example .env

# Update with your configurations
# Required variables:
# - DATABASE_URL
# - JWT_SECRET
# - CORS_ORIGIN
```

3. Start development servers:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only
- `npm run test` - Run tests
- `npm run migration:run` - Run database migrations

## Documentation Structure

```
notes/
├── dev/               # Development documentation
│   ├── api/          # API documentation
│   └── database/     # Database schemas and migrations
├── frontend/         # Frontend implementation
├── ops/              # Operations and deployment
└── concepts/         # Core concepts and architecture
```

## Core Documentation

- [Authentication Guide](notes/dev/api/auth.md)
- [API Documentation](notes/dev/api/README.md)
- [Frontend Guide](notes/frontend/AUTH.md)
- [Operations Setup](notes/ops/setup/AUTH_SETUP.md)
- [Architecture Overview](notes/ARCHITECTURE.md)

## Project Structure

```
source-of-truth/
├── apps/
│   ├── backend/       # NestJS application
│   │   ├── src/
│   │   ├── test/
│   │   └── package.json
│   └── frontend/      # Vue.js application
│       ├── src/
│       ├── public/
│       └── package.json
├── notes/            # Documentation
└── package.json      # Root package.json
```

## Contributing

See our [Contributing Guide](notes/contributing/WORKFLOW.md) for details on:

- Development workflow
- Code style guidelines
- Pull request process
- Documentation standards

## Security

For security considerations and setup, see:

- [Authentication Setup](notes/ops/setup/AUTH_SETUP.md)
- [Security Best Practices](notes/dev/security/README.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
