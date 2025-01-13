import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { DocsModule } from './modules/docs/docs.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TopicsModule } from './modules/topics/topics.module';
import { ContentModule } from './modules/content/content.module';
import { CommandsModule } from './commands/commands.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        dropSchema: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    DocsModule,
    CategoriesModule,
    TopicsModule,
    ContentModule,
    CommandsModule,
  ],
})
export class AppModule {}
