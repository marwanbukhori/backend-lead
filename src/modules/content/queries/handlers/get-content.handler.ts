import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetContentQuery } from '../get-content.query';
import { Content } from '../../entities/content.entity';

@QueryHandler(GetContentQuery)
export class GetContentHandler implements IQueryHandler<GetContentQuery> {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  async execute(query: GetContentQuery): Promise<Content> {
    const content = await this.contentRepository.findOne({
      where: { id: query.contentId },
      relations: ['topic'],
    });

    if (!content) {
      throw new NotFoundException(`Content #${query.contentId} not found`);
    }

    return content;
  }
}
