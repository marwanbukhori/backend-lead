import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Document } from './document.entity';

@Entity('bookmarks')
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.bookmarks)
  user: User;

  @ManyToOne(() => Document, document => document.bookmarks)
  document: Document;

  @CreateDateColumn()
  created_at: Date;
}
