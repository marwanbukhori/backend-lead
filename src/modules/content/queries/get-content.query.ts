import { IQuery } from '@nestjs/cqrs';

export class GetContentQuery implements IQuery {
  constructor(public readonly contentId: string) {}
}
