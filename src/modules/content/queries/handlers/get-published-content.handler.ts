import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GetPublishedContentQuery } from '../get-published-content.query';
import { Content, ContentStatus } from '../../entities/content.entity';

@QueryHandler(GetPublishedContentQuery)
export class GetPublishedContentHandler
  implements IQueryHandler<GetPublishedContentQuery>
{
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async execute(query: GetPublishedContentQuery): Promise<Content[]> {
    const cacheKey = `published_content_${query.topicId || 'all'}`;

    // Try to get from cache first
    const cachedContent = await this.cacheManager.get<Content[]>(cacheKey);
    if (cachedContent) {
      return cachedContent;
    }

    // If not in cache, get from database
    const queryBuilder = this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.topic', 'topic')
      .where('content.status = :status', { status: ContentStatus.PUBLISHED });

    if (query.topicId) {
      queryBuilder.andWhere('content.topicId = :topicId', {
        topicId: query.topicId,
      });
    }

    const content = await queryBuilder
      .orderBy('content.order', 'ASC')
      .addOrderBy('content.title', 'ASC')
      .getMany();

    // Store in cache
    await this.cacheManager.set(cacheKey, content);

    return content;
  }
}
