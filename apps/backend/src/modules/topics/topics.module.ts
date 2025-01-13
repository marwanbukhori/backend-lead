import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { TopicsSeeder } from './topics.seed';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Topic]),
    CategoriesModule,
  ],
  providers: [
    TopicsService,
    TopicsSeeder,
  ],
  controllers: [TopicsController],
  exports: [TopicsService, TopicsSeeder]
})
export class TopicsModule {}
