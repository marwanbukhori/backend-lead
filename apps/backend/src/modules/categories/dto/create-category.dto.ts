import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Database Management' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'database-management' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({
    example: 'Learn about database design and management',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}
