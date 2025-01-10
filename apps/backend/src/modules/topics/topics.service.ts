import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createTopicDto: CreateTopicDto): Promise<Topic> {
    // Verify category exists
    await this.categoriesService.findOne(createTopicDto.categoryId);

    const existingTopic = await this.topicRepository.findOne({
      where: { slug: createTopicDto.slug },
    });

    if (existingTopic) {
      throw new ConflictException('Topic with this slug already exists');
    }

    const topic = this.topicRepository.create(createTopicDto);
    return this.topicRepository.save(topic);
  }

  async findAll(): Promise<Topic[]> {
    return this.topicRepository.find({
      relations: ['category'],
      order: {
        order: 'ASC',
        title: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Topic> {
    const topic = await this.topicRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!topic) {
      throw new NotFoundException(`Topic #${id} not found`);
    }

    return topic;
  }

  async findByCategory(categoryId: string): Promise<Topic[]> {
    // Verify category exists
    await this.categoriesService.findOne(categoryId);

    return this.topicRepository.find({
      where: { categoryId },
      relations: ['category'],
      order: {
        order: 'ASC',
        title: 'ASC',
      },
    });
  }

  async update(id: string, updateTopicDto: UpdateTopicDto): Promise<Topic> {
    const topic = await this.findOne(id);

    if (updateTopicDto.categoryId) {
      // Verify new category exists
      await this.categoriesService.findOne(updateTopicDto.categoryId);
    }

    if (updateTopicDto.slug && updateTopicDto.slug !== topic.slug) {
      const existingTopic = await this.topicRepository.findOne({
        where: { slug: updateTopicDto.slug },
      });

      if (existingTopic) {
        throw new ConflictException('Topic with this slug already exists');
      }
    }

    Object.assign(topic, updateTopicDto);
    return this.topicRepository.save(topic);
  }

  async remove(id: string): Promise<void> {
    const topic = await this.findOne(id);
    await this.topicRepository.remove(topic);
  }
}
