import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ContentController } from './content.controller';
import { Content } from './entities/content.entity';
import { TopicsModule } from '../topics/topics.module';
import { ContentSeeder } from './content.seed';
import cacheConfig from '../../config/cache.config';

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
    CacheModule.registerAsync({
      imports: [ConfigModule.forFeature(cacheConfig)],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get('cache'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ContentController],
  providers: [
    ContentSeeder,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [ContentSeeder],
})
export class ContentModule {}
