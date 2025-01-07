import { ICommand } from '@nestjs/cqrs';
import { CreateContentDto } from '../dto/create-content.dto';

export class CreateContentCommand implements ICommand {
  constructor(public readonly createContentDto: CreateContentDto) {}
}
