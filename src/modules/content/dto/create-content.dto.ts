import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContentStatus } from '../entities/content.entity';

class CodeExample {
  @ApiProperty({ example: 'typescript' })
  @IsString()
  language: string;

  @ApiProperty({ example: 'console.log("Hello World!");' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: 'A simple hello world example' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateContentDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  topicId: string;

  @ApiProperty({ example: 'Introduction to REST APIs' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'REST (Representational State Transfer) is an architectural style...',
  })
  @IsString()
  body: string;

  @ApiPropertyOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodeExample)
  @IsOptional()
  codeExamples?: CodeExample[];

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    enum: ContentStatus,
    example: ContentStatus.DRAFT,
  })
  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus = ContentStatus.DRAFT;
}
