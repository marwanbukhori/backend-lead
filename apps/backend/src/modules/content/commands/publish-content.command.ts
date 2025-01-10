import { ICommand } from '@nestjs/cqrs';

export class PublishContentCommand implements ICommand {
  constructor(public readonly contentId: string) {}
}
