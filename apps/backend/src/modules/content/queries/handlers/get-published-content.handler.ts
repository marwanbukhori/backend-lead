import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetPublishedContentQuery } from '../get-published-content.query';
import { Content, ContentStatus } from '../../entities/content.entity';

@QueryHandler(GetPublishedContentQuery)
export class GetPublishedContentHandler
  implements IQueryHandler<GetPublishedContentQuery>
{
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  async execute(query: GetPublishedContentQuery): Promise<Content[]> {
    const queryBuilder = this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.topic', 'topic')
      .where('content.status = :status', { status: ContentStatus.PUBLISHED });

    if (query.topicId) {
      queryBuilder.andWhere('content.topicId = :topicId', {
        topicId: query.topicId,
      });
    }

    return queryBuilder
      .orderBy('content.order', 'ASC')
      .addOrderBy('content.title', 'ASC')
      .getMany();
  }
}
