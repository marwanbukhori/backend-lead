import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { Category } from './entities/category.entity';
import { DocumentSection } from './entities/document-section.entity';
import { Bookmark } from './entities/bookmark.entity';

interface TableOfContentsItem {
  title: string;
  description: string;
  path: string;
  tags: string[];
  category: string;
  isBookmarked?: boolean;
}

interface TableOfContentsSection {
  title: string;
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
    const doc = await this.documentRepository.findOne({
      where: { path },
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
    return Object.entries(docsByCategory).map(([category, docs]) => ({
      title: category,
      items: docs.map(doc => ({
        title: doc.title,
        description: doc.content.split('\n')[2] || "No description available",
        path: `/docs${doc.path}`,
        tags: doc.tags || [],
        category: doc.category?.name || 'Uncategorized',
        isBookmarked: doc.isBookmarked,
      }))
    }));
  }

  async createDoc(doc: Partial<Document>): Promise<Document> {
    return this.documentRepository.save(doc);
  }

  async updateDoc(path: string, doc: Partial<Document>): Promise<Document> {
    const existingDoc = await this.getDoc(path);
    const updatedDoc = { ...existingDoc, ...doc };
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
}
