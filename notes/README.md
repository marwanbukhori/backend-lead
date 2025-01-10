# Source Of Truth Documentation

## Overview

This documentation covers both the knowledge base materials and development guides for Source Of Truth, a comprehensive platform built with NestJS and Vue.js for maintaining and sharing development knowledge.

## Learning Materials

### Core Concepts

- [Domain-Driven Design](./learning/ddd/README.md)

  - Bounded Contexts
  - Aggregates
  - Value Objects
  - Domain Events

- [CQRS Pattern](./learning/cqrs/README.md)

  - Commands vs Queries
  - Event Sourcing
  - Event Store
  - Projections

- [Event-Driven Architecture](./learning/event-driven/README.md)

  - Event Bus
  - Message Queues
  - Event Handlers
  - Asynchronous Processing

- [Authentication & Authorization](./learning/auth/README.md)

  - JWT Authentication
  - OAuth 2.0
  - Role-Based Access Control
  - Security Best Practices

- [Caching Strategies](./learning/caching/README.md)
  - Redis Implementation
  - Cache Invalidation
  - Cache Patterns
  - Performance Optimization

### Best Practices

- [API Design](./learning/api-design/README.md)

  - RESTful Principles
  - GraphQL Alternatives
  - API Versioning
  - Documentation

- [Testing Strategies](./learning/testing/README.md)
  - Unit Testing
  - Integration Testing
  - E2E Testing
  - Test-Driven Development

## Development Documentation

### Architecture

- [System Overview](./dev/architecture/OVERVIEW.md)

  - System Components
  - Data Flow
  - Technology Stack
  - Design Decisions

- [Backend Architecture](./dev/architecture/BACKEND.md)

  - NestJS Modules
  - Database Design
  - Service Layer
  - API Layer

- [Frontend Architecture](./dev/architecture/FRONTEND.md)
  - Vue.js Components
  - State Management
  - Routing
  - API Integration

### Implementation Guides

- [Backend Development](./dev/guides/BACKEND.md)

  - Module Development
  - Entity Creation
  - Service Implementation
  - Testing Guide

- [Frontend Development](./dev/guides/FRONTEND.md)
  - Component Development
  - Store Management
  - Route Configuration
  - Testing Guide

### API Documentation

- [API Reference](./dev/api/README.md)
  - Authentication
  - Users
  - Topics
  - Content
  - Categories

### Database

- [Database Guide](./dev/database/README.md)
  - Schema Design
  - Migrations
  - Seeding
  - Backup & Recovery

## DevOps & Deployment

### Setup

- [Local Development](./ops/setup/LOCAL.md)

  - Prerequisites
  - Installation Steps
  - Configuration
  - Troubleshooting

- [Production Deployment](./ops/setup/PRODUCTION.md)
  - Server Setup
  - Environment Config
  - SSL/TLS Setup
  - Monitoring

### CI/CD

- [Pipeline Configuration](./ops/cicd/PIPELINE.md)
  - Build Process
  - Testing
  - Deployment
  - Rollback Procedures

### Monitoring

- [System Monitoring](./ops/monitoring/README.md)
  - Logging
  - Error Tracking
  - Performance Metrics
  - Alerts

## Contributing

- [Development Workflow](./contributing/WORKFLOW.md)
  - Git Strategy
  - Code Standards
  - PR Process
  - Review Guidelines

## Quick Links

- Backend API: http://localhost:3000
- Frontend App: http://localhost:5173
- API Docs: http://localhost:3000/api
- Database Admin: http://localhost:5432

## Directory Structure

```
notes/
├── learning/           # Learning materials and concepts
│   ├── ddd/           # Domain-Driven Design
│   ├── cqrs/          # CQRS Pattern
│   ├── event-driven/  # Event-Driven Architecture
│   ├── auth/          # Authentication & Authorization
│   ├── caching/       # Caching Strategies
│   ├── api-design/    # API Design
│   └── testing/       # Testing Strategies
├── dev/               # Development documentation
│   ├── architecture/  # System architecture
│   ├── guides/        # Implementation guides
│   ├── api/           # API documentation
│   └── database/      # Database documentation
├── ops/               # DevOps & deployment
│   ├── setup/         # Setup guides
│   ├── cicd/          # CI/CD configuration
│   └── monitoring/    # System monitoring
└── contributing/      # Contributing guidelines
```
