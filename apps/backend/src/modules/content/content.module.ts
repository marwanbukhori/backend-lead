import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Content } from './entities/content.entity';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { TopicsModule } from '../topics/topics.module';
import { ContentSeeder } from './content.seed';

// Command Handlers
import { CreateContentHandler } from './commands/handlers/create-content.handler';
import { PublishContentHandler } from './commands/handlers/publish-content.handler';

// Query Handlers
import { GetContentHandler } from './queries/handlers/get-content.handler';
import { GetPublishedContentHandler } from './queries/handlers/get-published-content.handler';

// Event Handlers
import { ContentPublishedHandler } from './events/handlers/content-published.handler';

const CommandHandlers = [CreateContentHandler, PublishContentHandler];
const QueryHandlers = [GetContentHandler, GetPublishedContentHandler];
const EventHandlers = [ContentPublishedHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Content]),
    TopicsModule,
    CqrsModule,
  ],
  providers: [
    ContentService,
    ContentSeeder,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  controllers: [ContentController],
  exports: [ContentService, ContentSeeder]
})
export class ContentModule {}
