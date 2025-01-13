import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocsController } from './docs.controller';
import { DocsService } from './docs.service';
import { Document } from './entities/document.entity';
import { Category } from './entities/category.entity';
import { DocumentSection } from './entities/document-section.entity';
import { Bookmark } from './entities/bookmark.entity';
import { DocsSeeder } from './docs.seed';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Category, DocumentSection, Bookmark])
  ],
  controllers: [DocsController],
  providers: [DocsService, DocsSeeder],
  exports: [DocsService, DocsSeeder]
})
export class DocsModule {}
