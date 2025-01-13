import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { Document } from '../../modules/docs/entities/document.entity';
import { Category } from '../../modules/docs/entities/category.entity';
import { DocumentSection } from '../../modules/docs/entities/document-section.entity';
import { UserRole } from '../../common/constants';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs/promises';
import * as path from 'path';

export const initialSeed = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);
  const categoryRepository = dataSource.getRepository(Category);
  const documentRepository = dataSource.getRepository(Document);
  const sectionRepository = dataSource.getRepository(DocumentSection);

  // Create admin user
  const adminUser = await userRepository.save({
    email: 'admin@example.com',
    password_hash: await bcrypt.hash('admin123', 10),
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    isEmailVerified: true,
  });

  // Create demo user
  await userRepository.save({
    email: 'demo@example.com',
    password_hash: await bcrypt.hash('demo123', 10),
    firstName: 'Demo',
    lastName: 'User',
    role: UserRole.USER,
    isEmailVerified: true,
  });

  // Create categories
  const categories = await categoryRepository.save([
    {
      name: 'Core Concepts',
      slug: 'core-concepts',
      description: 'Fundamental backend engineering concepts',
      order_index: 0,
    },
    {
      name: 'Development Guides',
      slug: 'development-guides',
      description: 'Practical development guides and tutorials',
      order_index: 1,
    },
    {
      name: 'Best Practices',
      slug: 'best-practices',
      description: 'Backend engineering best practices',
      order_index: 2,
    }
  ]);

  const categoriesMap = categories.reduce((acc, cat) => {
    acc[cat.name] = cat;
    return acc;
  }, {} as Record<string, Category>);

  // Helper function to parse markdown content
  const parseMarkdownSections = (content: string) => {
    const lines = content.split('\n');
    const sections: { title: string; content: string; level: number }[] = [];
    let currentSection: { title: string; content: string[]; level: number } | null = null;

    for (const line of lines) {
      if (line.startsWith('#')) {
        // If we have a current section, save it
        if (currentSection) {
          sections.push({
            title: currentSection.title,
            content: currentSection.content.join('\n'),
            level: currentSection.level,
          });
        }

        // Start a new section
        const level = line.match(/^#+/)[0].length;
        const title = line.replace(/^#+\s+/, '');
        currentSection = { title, content: [], level };
      } else if (currentSection) {
        currentSection.content.push(line);
      }
    }

    // Don't forget to add the last section
    if (currentSection) {
      sections.push({
        title: currentSection.title,
        content: currentSection.content.join('\n'),
        level: currentSection.level,
      });
    }

    return sections;
  };

  // Function to read markdown files
  const readMarkdownFile = async (filePath: string) => {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.error(`Error reading markdown file ${filePath}:`, error);
      return null;
    }
  };

  // Document definitions with paths to markdown files
  const documentDefinitions = [
    {
      title: 'API Design in NestJS',
      markdownPath: '../../notes/concepts/05-api-design/README.md',
      path: '/concepts/api-design',
      category: categoriesMap['Core Concepts'],
      tags: ['api', 'design', 'nestjs', 'rest', 'graphql'],
      order_index: 0,
    },
    {
      title: 'Git Workflow Guide',
      markdownPath: '../../notes/development/git-workflow.md',
      path: '/development/git-workflow',
      category: categoriesMap['Development Guides'],
      tags: ['git', 'workflow', 'version-control'],
      order_index: 0,
    },
    {
      title: 'Code Review Best Practices',
      markdownPath: '../../notes/best-practices/code-reviews.md',
      path: '/best-practices/code-reviews',
      category: categoriesMap['Best Practices'],
      tags: ['code-review', 'best-practices', 'collaboration'],
      order_index: 0,
    }
  ];

  // Create documents and their sections
  for (const def of documentDefinitions) {
    const content = await readMarkdownFile(def.markdownPath);
    if (!content) {
      console.warn(`Skipping ${def.title} - markdown file not found`);
      continue;
    }

    // Create the document
    const document = await documentRepository.save({
      ...def,
      content,
      metadata: {},
      estimated_read_time: Math.ceil(content.split(/\s+/).length / 200), // Rough estimate: 200 words per minute
    });

    // Parse and create sections
    const sections = parseMarkdownSections(content);
    const documentSections = sections.map((section, index) => ({
      document,
      title: section.title,
      content: section.content.trim(),
      order_index: index,
      level: section.level,
    }));

    await sectionRepository.save(documentSections);
  }
};
