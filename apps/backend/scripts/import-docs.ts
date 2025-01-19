import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DocsService } from '../src/modules/docs/docs.service';
import { CategoriesService } from '../src/modules/categories/categories.service';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

async function importDocs() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const docsService = app.get(DocsService);
  const categoriesService = app.get(CategoriesService);

  // Root notes directory path (relative to workspace root)
  const notesDir = path.join(__dirname, '../../../notes');

  // Function to recursively get all .md files
  const getMdFiles = (dir: string): string[] => {
    const files: string[] = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...getMdFiles(fullPath));
      } else if (path.extname(item).toLowerCase() === '.md') {
        files.push(fullPath);
      }
    }

    return files;
  };

  // Create or get categories
  async function getOrCreateCategory(name: string) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    let category = await categoriesService.findBySlug(slug);

    if (!category) {
      category = await categoriesService.create({
        name,
        slug,
        description: `${name} documentation`,
        order_index: 0,
      });
    }

    return category;
  }

  try {
    const mdFiles = getMdFiles(notesDir);
    console.log(`Found ${mdFiles.length} markdown files`);

    for (const file of mdFiles) {
      try {
        // Get relative path from notes directory
        const relativePath = path.relative(notesDir, file);
        // Remove .md extension and README
        const pathWithoutExt = relativePath
          .replace(/\.md$/, '')
          .replace(/\/README$/, '');

        // Skip certain files
        if (pathWithoutExt === 'README' || pathWithoutExt === 'ARCHITECTURE') {
          continue;
        }

        // Read file content
        const content = fs.readFileSync(file, 'utf-8');

        // Extract title from first line (assuming it's a # heading)
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : path.basename(pathWithoutExt);

        // Get category from first directory in path
        const pathParts = pathWithoutExt.split('/');
        const categoryName = pathParts[0]
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        const category = await getOrCreateCategory(categoryName);

        // Extract tags from directory structure
        const tags = pathParts.filter(Boolean);

        // Check if document already exists
        const existingDoc = await docsService.getDocByPath(pathWithoutExt);
        if (existingDoc) {
          // Update existing document instead of skipping
          const doc = await docsService.updateDoc(pathWithoutExt, {
            title,
            content,
            path: `/${pathWithoutExt}`,
            tags,
            categoryId: category.id,
            metadata: {
              importedAt: new Date().toISOString(),
              sourceFile: relativePath
            }
          });
          console.log(`Updated existing document: ${pathWithoutExt}`);
          continue;
        }

        // Create document
        const doc = await docsService.createDocument({
          id: uuidv4(),
          title,
          content,
          path: `/${pathWithoutExt}`,
          tags,
          categoryId: category.id,
          metadata: {
            importedAt: new Date().toISOString(),
            sourceFile: relativePath
          }
        });

        // Parse sections from content
        const sections = content.split('\n')
          .filter(line => line.startsWith('#'))
          .map((line, index) => {
            const level = line.match(/^#+/)[0].length;
            return {
              id: uuidv4(),
              documentId: doc.id,
              title: line.replace(/^#+\s+/, ''),
              content: '',
              level,
              order_index: index
            };
          });

        // Create sections
        if (sections.length > 0) {
          await Promise.all(sections.map(section =>
            docsService.createSection(section)
          ));
        }

        console.log(`Imported: ${pathWithoutExt}`);
      } catch (error) {
        console.error(`Error importing ${file}:`, error.message);
      }
    }

    console.log('Import completed');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await app.close();
  }
}

// Run the import
importDocs().catch(console.error);
