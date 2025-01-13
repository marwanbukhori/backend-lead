import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Document } from './document.entity';

@Entity('document_sections')
export class DocumentSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Document, document => document.sections)
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Column({ name: 'document_id' })
  documentId: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  content: string;

  @Column()
  order_index: number;

  @ManyToOne(() => DocumentSection, { nullable: true })
  @JoinColumn({ name: 'parent_section_id' })
  parentSection: DocumentSection;

  @Column({ name: 'parent_section_id', nullable: true })
  parentSectionId: string;

  @Column({ default: 1 })
  level: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
