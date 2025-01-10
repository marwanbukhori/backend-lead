import { EventPublisher } from '@nestjs/cqrs';
import { ContentModel } from '../models/content.model';
import { Content } from '../entities/content.entity';
import { CreateContentDto } from '../dto/create-content.dto';

export class ContentFactory {
  constructor(private readonly publisher: EventPublisher) {}

  create(createContentDto: CreateContentDto): ContentModel {
    const content = new ContentModel(createContentDto);
    return this.publisher.mergeObjectContext(content);
  }

  reconstitute(content: Content): ContentModel {
    const contentModel = new ContentModel(content);
    return this.publisher.mergeObjectContext(contentModel);
  }
}
