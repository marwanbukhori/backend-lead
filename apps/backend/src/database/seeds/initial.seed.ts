import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { Document } from '../../modules/docs/entities/document.entity';
import { UserRole } from '../../common/constants';
import * as bcrypt from 'bcrypt';

export const initialSeed = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);
  const documentRepository = dataSource.getRepository(Document);

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

  // Create documents
  await documentRepository.save([
    {
      title: 'Best Practices for Code Reviews',
      content: '# Best Practices for Code Reviews\n\nCode reviews are essential...',
      path: '/best-practices/code-reviews',
      category: 'Best Practices',
      description: 'Learn effective code review techniques and best practices',
      tags: ['code-review', 'collaboration', 'quality'],
    },
    {
      title: 'Git Workflow Guide',
      content: '# Git Workflow Guide\n\nA consistent git workflow...',
      path: '/guides/git-workflow',
      category: 'Development Guides',
      description: 'Master the git workflow used in professional development',
      tags: ['git', 'workflow', 'version-control'],
    },
    {
      title: 'API Design Principles',
      content: '# API Design Principles\n\nGood API design...',
      path: '/core/api-design',
      category: 'Core Concepts',
      description: 'Understanding fundamental API design principles',
      tags: ['api', 'design', 'architecture'],
    },
    {
      title: 'Database Optimization',
      content: '# Database Optimization\n\nOptimizing database performance...',
      path: '/guides/database-optimization',
      category: 'Development Guides',
      description: 'Learn techniques for optimizing database performance',
      tags: ['database', 'performance', 'optimization'],
    }
  ]);
};
