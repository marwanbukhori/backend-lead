import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Document } from '../../entities/document.entity';

export class InitialDatabaseSeed {
  public async run(dataSource: DataSource): Promise<void> {
    // Create admin user
    const adminUser = await dataSource
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({
        email: 'admin@example.com',
        password_hash: await bcrypt.hash('admin123', 10),
        name: 'Admin User',
        role: 'admin',
      })
      .execute();

    // Create demo user
    const demoUser = await dataSource
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({
        email: 'demo@example.com',
        password_hash: await bcrypt.hash('demo123', 10),
        name: 'Demo User',
        role: 'user',
      })
      .execute();

    // Create sample documents
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(Document)
      .values([
        {
          title: 'Getting Started with Backend Development',
          content: '# Backend Development Guide\n\nThis is a comprehensive guide...',
          path: '/guides/backend/getting-started',
          tags: ['backend', 'guide', 'introduction'],
          metadata: () => `'{"author": "${adminUser.identifiers[0].id}", "difficulty": "beginner"}'`
        },
        {
          title: 'Authentication Best Practices',
          content: '# Authentication Guide\n\nSecurity best practices...',
          path: '/guides/security/authentication',
          tags: ['security', 'authentication', 'jwt'],
          metadata: () => `'{"author": "${adminUser.identifiers[0].id}", "difficulty": "intermediate"}'`
        }
      ])
      .execute();
  }
}
