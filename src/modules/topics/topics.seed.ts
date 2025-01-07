import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic, TopicDifficulty } from './entities/topic.entity';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class TopicsSeeder {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async seed() {
    // Get all categories first
    const categories = await this.categoriesService.findAll();
    const categoryMap = new Map(categories.map(cat => [cat.slug, cat]));

    const topics = [
      // API Design Topics
      {
        categorySlug: 'rest-api-principles',
        topics: [
          {
            title: 'Introduction to REST',
            slug: 'intro-to-rest',
            description: 'Understanding the basics of REST architecture',
            order: 1,
            difficulty: TopicDifficulty.BEGINNER,
          },
          {
            title: 'HTTP Methods and Status Codes',
            slug: 'http-methods-status-codes',
            description: 'Deep dive into HTTP methods and response status codes',
            order: 2,
            difficulty: TopicDifficulty.BEGINNER,
          },
          {
            title: 'RESTful Resource Design',
            slug: 'restful-resource-design',
            description: 'Best practices for designing RESTful resources',
            order: 3,
            difficulty: TopicDifficulty.INTERMEDIATE,
          },
        ],
      },
      // Database Topics
      {
        categorySlug: 'sql-basics',
        topics: [
          {
            title: 'SQL Query Fundamentals',
            slug: 'sql-query-fundamentals',
            description: 'Learn basic SQL queries and operations',
            order: 1,
            difficulty: TopicDifficulty.BEGINNER,
          },
          {
            title: 'Joins and Relationships',
            slug: 'joins-and-relationships',
            description: 'Understanding different types of SQL joins',
            order: 2,
            difficulty: TopicDifficulty.INTERMEDIATE,
          },
        ],
      },
      // Authentication Topics
      {
        categorySlug: 'jwt-authentication',
        topics: [
          {
            title: 'JWT Structure and Flow',
            slug: 'jwt-structure-flow',
            description: 'Understanding JWT tokens and authentication flow',
            order: 1,
            difficulty: TopicDifficulty.BEGINNER,
          },
          {
            title: 'Implementing JWT Authentication',
            slug: 'implementing-jwt-auth',
            description: 'Step-by-step guide to implement JWT authentication',
            order: 2,
            difficulty: TopicDifficulty.INTERMEDIATE,
          },
          {
            title: 'JWT Security Best Practices',
            slug: 'jwt-security-practices',
            description: 'Advanced security considerations for JWT',
            order: 3,
            difficulty: TopicDifficulty.ADVANCED,
          },
        ],
      },
      // Testing Topics
      {
        categorySlug: 'unit-testing',
        topics: [
          {
            title: 'Testing Fundamentals',
            slug: 'testing-fundamentals',
            description: 'Introduction to software testing principles',
            order: 1,
            difficulty: TopicDifficulty.BEGINNER,
          },
          {
            title: 'Writing Effective Unit Tests',
            slug: 'writing-unit-tests',
            description: 'Best practices for writing maintainable unit tests',
            order: 2,
            difficulty: TopicDifficulty.INTERMEDIATE,
          },
        ],
      },
      // Performance Topics
      {
        categorySlug: 'caching-strategies',
        topics: [
          {
            title: 'Caching Basics',
            slug: 'caching-basics',
            description: 'Understanding caching concepts and strategies',
            order: 1,
            difficulty: TopicDifficulty.BEGINNER,
          },
          {
            title: 'Cache Invalidation Strategies',
            slug: 'cache-invalidation',
            description: 'Advanced cache invalidation patterns',
            order: 2,
            difficulty: TopicDifficulty.ADVANCED,
          },
        ],
      },
    ];

    for (const categoryTopics of topics) {
      const category = categoryMap.get(categoryTopics.categorySlug);
      if (!category) continue;

      for (const topicData of categoryTopics.topics) {
        const existingTopic = await this.topicRepository.findOne({
          where: { slug: topicData.slug },
        });

        if (!existingTopic) {
          await this.topicRepository.save(
            this.topicRepository.create({
              ...topicData,
              categoryId: category.id,
            }),
          );
        }
      }
    }
  }
}
