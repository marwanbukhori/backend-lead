import { IQuery } from '@nestjs/cqrs';

export class GetPublishedContentQuery implements IQuery {
  constructor(public readonly topicId?: string) {}
}
