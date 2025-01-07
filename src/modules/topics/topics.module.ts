import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { Topic } from './entities/topic.entity';
import { CategoriesModule } from '../categories/categories.module';
import { TopicsSeeder } from './topics.seed';

@Module({
  imports: [TypeOrmModule.forFeature([Topic]), CategoriesModule],
  controllers: [TopicsController],
  providers: [TopicsService, TopicsSeeder],
  exports: [TopicsService, TopicsSeeder],
})
export class TopicsModule {}
