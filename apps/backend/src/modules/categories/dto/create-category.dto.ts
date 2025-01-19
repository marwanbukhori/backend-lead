import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  order_index?: number;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}
