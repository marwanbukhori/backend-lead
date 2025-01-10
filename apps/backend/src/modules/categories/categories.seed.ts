import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesSeeder {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async seed() {
    const categories = [
      {
        name: 'API Design',
        slug: 'api-design',
        description: 'Learn about REST API principles, versioning, and best practices',
        order: 1,
        subcategories: [
          {
            name: 'REST API Principles',
            slug: 'rest-api-principles',
            description: 'Understanding REST architectural principles and constraints',
            order: 1,
          },
          {
            name: 'API Versioning',
            slug: 'api-versioning',
            description: 'Different strategies for API versioning and their trade-offs',
            order: 2,
          },
          {
            name: 'Error Handling',
            slug: 'error-handling',
            description: 'Best practices for API error handling and status codes',
            order: 3,
          },
        ],
      },
      {
        name: 'Database Management',
        slug: 'database-management',
        description: 'Master database design, SQL, and optimization techniques',
        order: 2,
        subcategories: [
          {
            name: 'SQL Basics',
            slug: 'sql-basics',
            description: 'Fundamental SQL concepts and queries',
            order: 1,
          },
          {
            name: 'Database Design',
            slug: 'database-design',
            description: 'Database modeling, normalization, and relationships',
            order: 2,
          },
          {
            name: 'Query Optimization',
            slug: 'query-optimization',
            description: 'Techniques for improving database query performance',
            order: 3,
          },
        ],
      },
      {
        name: 'Authentication & Authorization',
        slug: 'auth',
        description: 'Implement secure user authentication and authorization',
        order: 3,
        subcategories: [
          {
            name: 'JWT Authentication',
            slug: 'jwt-authentication',
            description: 'JSON Web Token based authentication implementation',
            order: 1,
          },
          {
            name: 'OAuth 2.0',
            slug: 'oauth2',
            description: 'OAuth 2.0 flows and implementation strategies',
            order: 2,
          },
          {
            name: 'Role-Based Access Control',
            slug: 'rbac',
            description: 'Implementing RBAC in your applications',
            order: 3,
          },
        ],
      },
      {
        name: 'Testing',
        slug: 'testing',
        description: 'Learn different testing strategies and best practices',
        order: 4,
        subcategories: [
          {
            name: 'Unit Testing',
            slug: 'unit-testing',
            description: 'Writing effective unit tests for your code',
            order: 1,
          },
          {
            name: 'Integration Testing',
            slug: 'integration-testing',
            description: 'Testing component interactions and integrations',
            order: 2,
          },
          {
            name: 'E2E Testing',
            slug: 'e2e-testing',
            description: 'End-to-end testing strategies and tools',
            order: 3,
          },
        ],
      },
      {
        name: 'Performance',
        slug: 'performance',
        description: 'Optimize your application for better performance',
        order: 5,
        subcategories: [
          {
            name: 'Caching Strategies',
            slug: 'caching-strategies',
            description: 'Different caching approaches and their use cases',
            order: 1,
          },
          {
            name: 'Database Indexing',
            slug: 'database-indexing',
            description: 'Understanding and implementing database indexes',
            order: 2,
          },
          {
            name: 'Load Balancing',
            slug: 'load-balancing',
            description: 'Distributing traffic across multiple servers',
            order: 3,
          },
        ],
      },
    ];

    for (const categoryData of categories) {
      const { subcategories, ...mainCategory } = categoryData;
      let category = await this.categoryRepository.findOne({
        where: { slug: mainCategory.slug },
      });

      if (!category) {
        category = await this.categoryRepository.save(
          this.categoryRepository.create(mainCategory),
        );
      }

      if (subcategories) {
        for (const subCategoryData of subcategories) {
          const existingSubCategory = await this.categoryRepository.findOne({
            where: { slug: subCategoryData.slug },
          });

          if (!existingSubCategory) {
            await this.categoryRepository.save(
              this.categoryRepository.create({
                ...subCategoryData,
                parentId: category.id,
              }),
            );
          }
        }
      }
    }
  }
}
