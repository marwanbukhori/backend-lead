import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { TopicDifficulty } from '../entities/topic.entity';

export class CreateTopicDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'REST API Principles' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'rest-api-principles' })
  @IsString()
  @MaxLength(200)
  slug: string;

  @ApiPropertyOptional({
    example: 'Understanding REST architectural principles and constraints',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    enum: TopicDifficulty,
    example: TopicDifficulty.BEGINNER,
  })
  @IsEnum(TopicDifficulty)
  @IsOptional()
  difficulty?: TopicDifficulty = TopicDifficulty.BEGINNER;
}
