import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TopicsModule } from './modules/topics/topics.module';
import { ContentModule } from './modules/content/content.module';
import { CommandsModule } from './commands/commands.module';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (databaseConfig) => ({
        ...databaseConfig,
        autoLoadEntities: true,
      }),
      inject: [databaseConfig.KEY],
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    TopicsModule,
    ContentModule,
    CommandsModule,
  ],
})
export class AppModule {}
