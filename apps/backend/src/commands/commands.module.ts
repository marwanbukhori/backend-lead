import { Module } from '@nestjs/common';
import { CategoriesModule } from '../modules/categories/categories.module';
import { TopicsModule } from '../modules/topics/topics.module';
import { ContentModule } from '../modules/content/content.module';
import { DocsModule } from '../modules/docs/docs.module';
import { SeedCommand } from './seed.command';

@Module({
  imports: [CategoriesModule, TopicsModule, ContentModule, DocsModule],
  providers: [SeedCommand],
})
export class CommandsModule {}
