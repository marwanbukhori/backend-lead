import { IEvent } from '@nestjs/cqrs';

export class ContentPublishedEvent implements IEvent {
  constructor(public readonly contentId: string) {}
}
