import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { initialSeed } from './database/seeds/initial.seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  const command = process.argv[2];

  switch (command) {
    case 'seed':
      console.log('Seeding database...');
      await initialSeed(dataSource);
      console.log('Database seeded successfully!');
      break;
    default:
      console.log('Unknown command');
  }

  await app.close();
}

bootstrap();
