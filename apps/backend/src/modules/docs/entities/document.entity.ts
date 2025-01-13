import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Category } from './category.entity';
import { DocumentSection } from './document-section.entity';
import { IsOptional } from 'class-validator';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ unique: true })
  path: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Index('IDX_document_search_vector', { synchronize: false })
  @Column({
    name: 'search_vector',
    type: 'tsvector',
    generatedType: 'STORED',
    asExpression: `setweight(to_tsvector('english', title), 'A') || setweight(to_tsvector('english', COALESCE(content, '')), 'B')`
  })
  searchVector: any;

  @Column({ default: 0 })
  order_index: number;

  @Column({ default: 'published' })
  status: string;

  @Column({ default: 0 })
  views: number;

  @Column({ nullable: true })
  estimated_read_time: number;

  @OneToMany(() => DocumentSection, section => section.document)
  sections: DocumentSection[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
