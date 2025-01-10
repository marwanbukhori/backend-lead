import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Document } from './document.entity';

@Entity('reading_progress')
export class ReadingProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.reading_progress)
  user: User;

  @ManyToOne(() => Document, document => document.reading_progress)
  document: Document;

  @Column({ default: 0 })
  progress: number;

  @Column({ type: 'timestamp', nullable: true })
  last_read_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
