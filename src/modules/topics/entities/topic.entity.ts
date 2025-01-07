import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../categories/entities/category.entity';

export enum TopicDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('topics')
export class Topic {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'category_id' })
  categoryId: string;

  @ApiProperty()
  @Column({ length: 200 })
  title: string;

  @ApiProperty()
  @Column({ length: 200, unique: true })
  slug: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty()
  @Column({ name: 'order_number', default: 0 })
  order: number;

  @ApiProperty({ enum: TopicDifficulty })
  @Column({
    type: 'enum',
    enum: TopicDifficulty,
    default: TopicDifficulty.BEGINNER,
  })
  difficulty: TopicDifficulty;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
