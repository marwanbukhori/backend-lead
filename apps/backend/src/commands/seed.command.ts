import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { CategoriesSeeder } from '../modules/categories/categories.seed';
import { TopicsSeeder } from '../modules/topics/topics.seed';
import { ContentSeeder } from '../modules/content/content.seed';
import { DocsSeeder } from '../modules/docs/docs.seed';

@Injectable()
@Command({
  name: 'seed',
  description: 'Seed the database with initial data',
})
export class SeedCommand extends CommandRunner {
  constructor(
    private readonly categoriesSeeder: CategoriesSeeder,
    private readonly topicsSeeder: TopicsSeeder,
    private readonly contentSeeder: ContentSeeder,
    private readonly docsSeeder: DocsSeeder,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');

      console.log('📚 Seeding categories...');
      await this.categoriesSeeder.seed();
      console.log('✅ Categories seeded successfully');

      console.log('📝 Seeding topics...');
      await this.topicsSeeder.seed();
      console.log('✅ Topics seeded successfully');

      console.log('📄 Seeding content...');
      await this.contentSeeder.seed();
      console.log('✅ Content seeded successfully');

      console.log('📖 Seeding docs...');
      await this.docsSeeder.seed();
      console.log('✅ Docs seeded successfully');

      console.log('✨ Database seeding completed successfully');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }
}
