import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @Column()
  category: string;

  @Column('text')
  description: string;

  @Column('simple-array', { default: [] })
  tags: string[];

  @Column('integer', { default: 0 })
  views: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
