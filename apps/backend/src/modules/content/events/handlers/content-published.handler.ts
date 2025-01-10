import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ContentPublishedEvent } from '../content-published.event';
import { Logger } from '@nestjs/common';

@EventsHandler(ContentPublishedEvent)
export class ContentPublishedHandler implements IEventHandler<ContentPublishedEvent> {
  private readonly logger = new Logger(ContentPublishedHandler.name);

  handle(event: ContentPublishedEvent) {
    this.logger.log(`Content ${event.contentId} has been published`);
    // Here you could trigger other side effects:
    // - Send notifications
    // - Update search index
    // - Generate static pages
    // - etc.
  }
}
