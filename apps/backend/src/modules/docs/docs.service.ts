import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { Category } from './entities/category.entity';
import { DocumentSection } from './entities/document-section.entity';
import { Bookmark } from './entities/bookmark.entity';
import * as crypto from 'crypto';

interface TableOfContentsItem {
  id: string;
  title: string;
  description: string;
  path: string;
  tags: string[];
  category: string;
  isBookmarked?: boolean;
}

interface TableOfContentsSection {
  title: string;
  id: string;
  items: TableOfContentsItem[];
}

@Injectable()
export class DocsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(DocumentSection)
    private readonly sectionRepository: Repository<DocumentSection>,
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
  ) {}

  async getAllDocs(): Promise<Document[]> {
    return this.documentRepository.find({
      relations: ['category', 'sections'],
      order: {
        category: { order_index: 'ASC' },
        order_index: 'ASC',
      },
    });
  }

  async getCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { order_index: 'ASC' },
      relations: ['documents'],
    });
  }

  async getDoc(path: string): Promise<Document> {
    // Remove /docs prefix if it exists
    const cleanPath = path.replace(/^\/docs/, '');

    const doc = await this.documentRepository.findOne({
      where: { path: cleanPath },
      relations: ['category', 'sections'],
    });

    if (!doc) {
      throw new NotFoundException(`Document not found for path: ${path}`);
    }

    // Increment views
    doc.views += 1;
    await this.documentRepository.save(doc);

    return doc;
  }

  async searchDocs(query: string): Promise<Document[]> {
    return this.documentRepository
      .createQueryBuilder('doc')
      .where(`doc.search_vector @@ plainto_tsquery('english', :query)`, { query })
      .orderBy('ts_rank(doc.search_vector, plainto_tsquery(:query))', 'DESC')
      .setParameter('query', query)
      .getMany();
  }

  async getTableOfContents(userId?: string): Promise<TableOfContentsSection[]> {
    const docs = await this.getAllDocs();
    let bookmarks: Bookmark[] = [];

    if (userId) {
      bookmarks = await this.getBookmarks(userId);
    }

    const bookmarkedDocIds = new Set(bookmarks.map(b => b.documentId));

    // Group documents by category
    const docsByCategory = docs.reduce((acc, doc) => {
      const category = doc.category?.name || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push({
        ...doc,
        isBookmarked: bookmarkedDocIds.has(doc.id),
      });
      return acc;
    }, {} as Record<string, (Document & { isBookmarked: boolean })[]>);

    // Format into sections
    return Object.entries(docsByCategory)
      .sort(([a], [b]) => a.localeCompare(b))  // Sort categories alphabetically
      .map(([category, docs]) => ({
        title: category,
        id: category.toLowerCase().replace(/\s+/g, '-'),  // Add ID for scrolling
        items: docs.map(doc => ({
          id: doc.id,
          title: doc.title,
          description: doc.content.split('\n')[2] || "No description available",
          // Store path without /docs prefix, it will be added by the frontend
          path: doc.path.replace(/^\/docs/, ''),
          tags: doc.tags || [],
          category: doc.category?.name || 'Uncategorized',
          isBookmarked: doc.isBookmarked,
        }))
      }));
  }

  async createDoc(doc: Partial<Document>): Promise<Document> {
    return this.documentRepository.save(doc);
  }

  async updateDoc(path: string, doc: Partial<Document> & { sections?: Array<{
    title: string;
    content: string;
    level: number;
    order_index: number;
  }> }): Promise<Document> {
    const existingDoc = await this.getDoc(path);
    const updatedDoc = { ...existingDoc, ...doc };

    // If sections are provided, update them
    if (doc.sections) {
      // Delete existing sections
      await this.sectionRepository.delete({ documentId: existingDoc.id });

      // Create new sections
      const sections = doc.sections.map(section => ({
        ...section,
        id: crypto.randomUUID(),
        documentId: existingDoc.id
      }));
      await this.sectionRepository.save(sections);
    }

    return this.documentRepository.save(updatedDoc);
  }

  async getBookmarks(userId: string): Promise<Bookmark[]> {
    return this.bookmarkRepository.find({
      where: { userId },
      relations: ['document', 'document.category'],
      order: { order_index: 'ASC' },
    });
  }

  async addBookmark(userId: string, documentId: string, notes?: string): Promise<Bookmark> {
    const document = await this.documentRepository.findOne({ where: { id: documentId } });
    if (!document) {
      throw new NotFoundException(`Document not found with id: ${documentId}`);
    }

    const bookmark = this.bookmarkRepository.create({
      userId,
      documentId,
      notes,
    });

    return this.bookmarkRepository.save(bookmark);
  }

  async removeBookmark(userId: string, documentId: string): Promise<void> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { userId, documentId },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.bookmarkRepository.remove(bookmark);
  }

  async updateBookmarkOrder(userId: string, bookmarkIds: string[]): Promise<void> {
    await Promise.all(
      bookmarkIds.map((id, index) =>
        this.bookmarkRepository.update({ id, userId }, { order_index: index }),
      ),
    );
  }

  async getDocByPath(path: string): Promise<Document | null> {
    return this.documentRepository.findOne({ where: { path } });
  }

  async createDocument(doc: {
    id: string;
    title: string;
    content: string;
    path: string;
    tags: string[];
    categoryId: string;
    metadata: any;
  }): Promise<Document> {
    const document = this.documentRepository.create(doc);
    return this.documentRepository.save(document);
  }

  async createSection(section: {
    id: string;
    documentId: string;
    title: string;
    content: string;
    level: number;
    order_index: number;
  }): Promise<DocumentSection> {
    const docSection = this.sectionRepository.create(section);
    return this.sectionRepository.save(docSection);
  }

  async getDocById(id: string): Promise<Document> {
    const doc = await this.documentRepository.findOne({
      where: { id },
      relations: ['category', 'sections'],
    });

    if (!doc) {
      throw new NotFoundException(`Document not found with id: ${id}`);
    }

    // Increment views
    doc.views += 1;
    await this.documentRepository.save(doc);

    return doc;
  }

  async updateDocById(id: string, doc: Partial<Document> & { sections?: Array<{
    title: string;
    content: string;
    level: number;
    order_index: number;
  }> }): Promise<Document> {
    console.log('Service: Updating document with ID:', id);

    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['category', 'sections']
    });

    if (!document) {
      throw new NotFoundException(`Document not found with id: ${id}`);
    }

    try {
      // 1. Update the document
      const { sections: _, ...docWithoutSections } = doc;
      await this.documentRepository
        .createQueryBuilder()
        .update(Document)
        .set(docWithoutSections)
        .where("id = :id", { id })
        .execute();

      // 2. Update the section with document's new title/content
      if (document.sections?.[0]) {
        const sectionUpdate = {
          // Use document's new title and content for the section
          title: doc.title || document.title,
          content: doc.content || document.content,
          // Keep existing level and order if not provided
          level: document.sections[0].level,
          order_index: document.sections[0].order_index
        };

        console.log('Updating section with:', sectionUpdate);

        await this.sectionRepository
          .createQueryBuilder()
          .update(DocumentSection)
          .set(sectionUpdate)
          .where("document_id = :docId", { docId: id })
          .execute();
      }

      // 3. Return updated document with sections
      return this.documentRepository.findOne({
        where: { id },
        relations: ['category', 'sections']
      });
    } catch (error) {
      console.error('Service: Error details:', error);
      throw error;
    }
  }
}
