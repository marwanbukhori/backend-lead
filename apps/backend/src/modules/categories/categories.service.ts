import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findBySlug(slug: string): Promise<Category | null> {
    return this.categoryRepository.findOne({ where: { slug } });
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { slug: createCategoryDto.slug },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this slug already exists');
    }

    if (createCategoryDto.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: {
        order: 'ASC',
        name: 'ASC',
      },
      relations: ['parent', 'children'],
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    if (updateCategoryDto.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: updateCategoryDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }

      // Prevent circular reference
      if (parent.id === category.id) {
        throw new ConflictException('Category cannot be its own parent');
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Check if category has children
    const hasChildren = await this.categoryRepository.count({
      where: { parentId: id },
    });

    if (hasChildren > 0) {
      throw new ConflictException('Cannot delete category with subcategories');
    }

    await this.categoryRepository.remove(category);
  }
}
