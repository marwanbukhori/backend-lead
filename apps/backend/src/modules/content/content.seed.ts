import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content, ContentStatus } from './entities/content.entity';
import { TopicsService } from '../topics/topics.service';

@Injectable()
export class ContentSeeder {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    private readonly topicsService: TopicsService,
  ) {}

  async seed() {
    // Get all topics first
    const topics = await this.topicsService.findAll();
    const topicMap = new Map(topics.map(topic => [topic.slug, topic]));

    const contents = [
      // REST API Content
      {
        topicSlug: 'intro-to-rest',
        contents: [
          {
            title: 'What is REST?',
            body: 'REST (Representational State Transfer) is an architectural style for designing networked applications. It relies on a stateless, client-server protocol, almost always HTTP...',
            order: 1,
            status: ContentStatus.PUBLISHED,
            codeExamples: [
              {
                language: 'http',
                code: 'GET /api/users HTTP/1.1\nHost: example.com\nAccept: application/json',
                description: 'Example of a REST API request',
              },
            ],
          },
          {
            title: 'REST Constraints',
            body: 'REST architecture is defined by six constraints: Client-Server, Stateless, Cacheable, Uniform Interface, Layered System, and Code on Demand (optional)...',
            order: 2,
            status: ContentStatus.PUBLISHED,
          },
        ],
      },
      // SQL Content
      {
        topicSlug: 'sql-query-fundamentals',
        contents: [
          {
            title: 'Basic SQL Queries',
            body: 'SQL (Structured Query Language) is used to communicate with a database. Common SQL commands include SELECT, INSERT, UPDATE, DELETE...',
            order: 1,
            status: ContentStatus.PUBLISHED,
            codeExamples: [
              {
                language: 'sql',
                code: 'SELECT * FROM users WHERE age >= 18 ORDER BY name;',
                description: 'Basic SELECT query with conditions and ordering',
              },
            ],
          },
        ],
      },
      // JWT Content
      {
        topicSlug: 'jwt-structure-flow',
        contents: [
          {
            title: 'Understanding JWT Structure',
            body: 'A JSON Web Token consists of three parts: Header, Payload, and Signature. Each part is base64url encoded and separated by dots...',
            order: 1,
            status: ContentStatus.PUBLISHED,
            codeExamples: [
              {
                language: 'typescript',
                code: 'const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: "1h" });',
                description: 'Creating a JWT token in Node.js',
              },
            ],
          },
        ],
      },
      // Testing Content
      {
        topicSlug: 'testing-fundamentals',
        contents: [
          {
            title: 'Introduction to Testing',
            body: 'Software testing is the process of evaluating a system to find differences between expected and actual behavior...',
            order: 1,
            status: ContentStatus.PUBLISHED,
            codeExamples: [
              {
                language: 'typescript',
                code: `describe('UserService', () => {
  it('should create a new user', async () => {
    const user = await userService.create(userData);
    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
  });
});`,
                description: 'Example of a Jest unit test',
              },
            ],
          },
        ],
      },
      // Caching Content
      {
        topicSlug: 'caching-basics',
        contents: [
          {
            title: 'Caching Fundamentals',
            body: 'Caching is a technique that stores a copy of a given resource and serves it back when requested...',
            order: 1,
            status: ContentStatus.PUBLISHED,
            codeExamples: [
              {
                language: 'typescript',
                code: `@CacheKey('users')
@CacheTTL(300)
async getAllUsers() {
  return this.userRepository.find();
}`,
                description: 'Example of caching in NestJS',
              },
            ],
          },
        ],
      },
    ];

    for (const topicContent of contents) {
      const topic = topicMap.get(topicContent.topicSlug);
      if (!topic) continue;

      for (const contentData of topicContent.contents) {
        const existingContent = await this.contentRepository.findOne({
          where: {
            topicId: topic.id,
            title: contentData.title,
          },
        });

        if (!existingContent) {
          const content = this.contentRepository.create({
            ...contentData,
            topicId: topic.id,
            publishedAt: contentData.status === ContentStatus.PUBLISHED ? new Date() : null,
          });
          await this.contentRepository.save(content);
        }
      }
    }
  }
}
