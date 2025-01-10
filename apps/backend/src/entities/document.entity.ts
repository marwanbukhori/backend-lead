import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Bookmark } from './bookmark.entity';
import { ReadingProgress } from './reading-progress.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ unique: true })
  path: string;

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Column({ default: 0 })
  views: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Bookmark, bookmark => bookmark.document)
  bookmarks: Bookmark[];

  @OneToMany(() => ReadingProgress, progress => progress.document)
  reading_progress: ReadingProgress[];
}
