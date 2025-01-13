import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { Category } from './entities/category.entity';
import { DocumentSection } from './entities/document-section.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class DocsSeeder {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(DocumentSection)
    private readonly sectionRepository: Repository<DocumentSection>,
  ) {}

  async seed() {
    const categories = await this.createCategories();
    await this.createDocuments(categories);
  }

  private async createCategories() {
    const categoriesData = [
      {
        name: 'Core Concepts',
        slug: 'core',
        description: 'Fundamental concepts and principles',
        order_index: 1,
      },
      {
        name: 'Development Guides',
        slug: 'guides',
        description: 'Step-by-step development guides',
        order_index: 2,
      },
      {
        name: 'Best Practices',
        slug: 'best-practices',
        description: 'Recommended practices and patterns',
        order_index: 3,
      },
    ];

    const categories: Record<string, Category> = {};

    for (const data of categoriesData) {
      const category = this.categoryRepository.create(data);
      categories[data.slug] = await this.categoryRepository.save(category);
    }

    return categories;
  }

  private async createDocuments(categories: Record<string, Category>) {
    const documentDefinitions = [
      {
        title: 'API Design in NestJS',
        path: '/concepts/api-design',
        markdownPath: 'notes/concepts/05-api-design/README.md',
        category: categories['core'],
        tags: ['nestjs', 'api', 'rest', 'design'],
      },
      {
        title: 'Git Workflow Guide',
        path: '/guides/git-workflow',
        markdownPath: 'notes/development/git-workflow.md',
        category: categories['guides'],
        tags: ['git', 'workflow', 'version-control'],
      },
      {
        title: 'Code Review Best Practices',
        path: '/best-practices/code-reviews',
        markdownPath: 'notes/best-practices/code-reviews.md',
        category: categories['best-practices'],
        tags: ['code-review', 'collaboration', 'quality'],
      },
    ];

    for (const def of documentDefinitions) {
      try {
        const content = await this.readMarkdownFile(def.markdownPath);
        if (!content) continue;

        const sections = this.parseMarkdownSections(content);
        const doc = this.documentRepository.create({
          ...def,
          content,
          views: 0,
          estimated_read_time: Math.ceil(content.split(/\s+/).length / 200), // Assuming 200 words per minute
        });

        const savedDoc = await this.documentRepository.save(doc);

        // Create document sections
        for (const section of sections) {
          const docSection = this.sectionRepository.create({
            document: savedDoc,
            title: section.title,
            content: section.content,
            level: section.level,
            order_index: section.order_index,
          });
          await this.sectionRepository.save(docSection);
        }
      } catch (error) {
        console.warn(`Warning: Could not create document from ${def.markdownPath}:`, error.message);
      }
    }
  }

  private async readMarkdownFile(filePath: string): Promise<string | null> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return content;
    } catch (error) {
      console.warn(`Warning: Could not read markdown file ${filePath}:`, error.message);
      return null;
    }
  }

  private parseMarkdownSections(content: string) {
    const lines = content.split('\n');
    const sections: Array<{
      title: string;
      content: string;
      level: number;
      order_index: number;
    }> = [];

    let currentSection: typeof sections[0] | null = null;
    let order = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headerMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }

        currentSection = {
          title: headerMatch[2],
          content: '',
          level: headerMatch[1].length,
          order_index: order++,
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }
}
