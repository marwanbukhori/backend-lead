import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContentCommand } from '../create-content.command';
import { Content } from '../../entities/content.entity';
import { TopicsService } from '../../../topics/topics.service';
import { ContentFactory } from '../../factories/content.factory';

@CommandHandler(CreateContentCommand)
export class CreateContentHandler implements ICommandHandler<CreateContentCommand> {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    private readonly topicsService: TopicsService,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CreateContentCommand): Promise<Content> {
    const { createContentDto } = command;

    // Verify topic exists
    await this.topicsService.findOne(createContentDto.topicId);

    // Use factory to create content aggregate
    const contentFactory = new ContentFactory(this.publisher);
    const content = contentFactory.create(createContentDto);

    // Save and return the content
    return this.contentRepository.save(content.toJSON());
  }
}
