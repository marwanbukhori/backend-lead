import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';

@Injectable()
export class DocsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async getAllDocs(): Promise<Document[]> {
    return this.documentRepository.find();
  }

  async getCategories(): Promise<string[]> {
    const docs = await this.getAllDocs();
    const categories = new Set<string>();

    for (const doc of docs) {
      if (doc.category) {
        categories.add(doc.category);
      }
    }

    return Array.from(categories);
  }

  async getDoc(path: string): Promise<Document> {
    const doc = await this.documentRepository.findOne({ where: { path } });
    if (!doc) {
      throw new Error('Document not found');
    }

    // Increment views
    doc.views += 1;
    await this.documentRepository.save(doc);

    return doc;
  }

  async createDoc(doc: Partial<Document>): Promise<Document> {
    return this.documentRepository.save(doc);
  }

  async updateDoc(path: string, doc: Partial<Document>): Promise<Document> {
    const existingDoc = await this.getDoc(path);
    const updatedDoc = { ...existingDoc, ...doc };
    return this.documentRepository.save(updatedDoc);
  }
}
