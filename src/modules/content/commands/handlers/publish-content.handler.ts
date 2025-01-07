import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublishContentCommand } from '../publish-content.command';
import { Content } from '../../entities/content.entity';
import { ContentFactory } from '../../factories/content.factory';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(PublishContentCommand)
export class PublishContentHandler implements ICommandHandler<PublishContentCommand> {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: PublishContentCommand): Promise<Content> {
    const { contentId } = command;

    // Find the content
    const content = await this.contentRepository.findOne({
      where: { id: contentId },
    });

    if (!content) {
      throw new NotFoundException(`Content #${contentId} not found`);
    }

    // Use factory to reconstitute the aggregate
    const contentFactory = new ContentFactory(this.publisher);
    const contentAggregate = contentFactory.reconstitute(content);

    // Publish the content
    contentAggregate.publish();
    contentAggregate.commit();

    // Save and return the updated content
    return this.contentRepository.save(contentAggregate.toJSON());
  }
}
