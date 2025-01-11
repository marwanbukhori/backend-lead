import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocsController } from './docs.controller';
import { DocsService } from './docs.service';
import { Document } from './entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document])
  ],
  controllers: [DocsController],
  providers: [DocsService],
  exports: [DocsService]
})
export class DocsModule {}
