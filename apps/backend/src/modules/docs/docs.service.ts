import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as matter from 'gray-matter';
import { glob } from 'glob';

@Injectable()
export class DocsService {
  private readonly docsDir = join(process.cwd(), 'notes');

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async getDocContent(path: string): Promise<any> {
    try {
      const fullPath = join(this.docsDir, path);
      const content = await fs.readFile(fullPath, 'utf-8');
      const { data, content: markdown } = matter(content);

      return {
        metadata: data,
        content: markdown,
      };
    } catch (error) {
      throw new NotFoundException(`Documentation not found: ${path}`);
    }
  }

  async getTableOfContents(): Promise<any> {
    const structure = [
      {
        title: 'Core Concepts',
        items: await this.getDocsInDirectory('learning'),
      },
      {
        title: 'Development Guides',
        items: await this.getDocsInDirectory('dev'),
      },
      {
        title: 'DevOps & Deployment',
        items: await this.getDocsInDirectory('ops'),
      },
      {
        title: 'Best Practices',
        items: await this.getDocsInDirectory('best-practices'),
      },
    ];

    return structure;
  }

  private async getDocsInDirectory(dir: string): Promise<any[]> {
    const pattern = join(this.docsDir, dir, '**/*.md');
    const files = await glob(pattern);

    return Promise.all(
      files.map(async (file) => {
        const content = await fs.readFile(file, 'utf-8');
        const { data } = matter(content);
        const relativePath = file.replace(this.docsDir + '/', '');

        return {
          title: data.title || this.getTitleFromPath(relativePath),
          description: data.description || '',
          path: `/${relativePath.replace('.md', '')}`,
          file: relativePath,
        };
      }),
    );
  }

  private getTitleFromPath(path: string): string {
    const filename = path.split('/').pop() || '';
    return filename
      .replace('.md', '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  async search(query: string): Promise<any[]> {
    const result = await this.elasticsearchService.search({
      index: 'documentation',
      body: {
        query: {
          multi_match: {
            query,
            fields: ['title^3', 'content', 'description^2'],
            fuzziness: 'AUTO',
          },
        },
        highlight: {
          fields: {
            content: { fragment_size: 150, number_of_fragments: 3 },
            title: { fragment_size: 150, number_of_fragments: 1 },
          },
        },
      },
    });

    return result.hits.hits.map((hit: any) => ({
      id: hit._id,
      score: hit._score,
      title: hit._source.title,
      description: hit._source.description,
      path: hit._source.path,
      highlights: hit.highlight,
    }));
  }

  async indexAllDocuments(): Promise<void> {
    const pattern = join(this.docsDir, '**/*.md');
    const files = await glob(pattern);

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const { data, content: markdown } = matter(content);
      const relativePath = file.replace(this.docsDir + '/', '');

      await this.elasticsearchService.index({
        index: 'documentation',
        body: {
          title: data.title || this.getTitleFromPath(relativePath),
          description: data.description || '',
          content: markdown,
          path: `/${relativePath.replace('.md', '')}`,
          file: relativePath,
          lastUpdated: new Date(),
        },
      });
    }
  }
}
