import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content, ContentStatus } from './entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { TopicsService } from '../topics/topics.service';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    private readonly topicsService: TopicsService,
  ) {}

  async create(createContentDto: CreateContentDto): Promise<Content> {
    // Verify topic exists
    await this.topicsService.findOne(createContentDto.topicId);

    const content = this.contentRepository.create(createContentDto);
    return this.contentRepository.save(content);
  }

  async findAll(): Promise<Content[]> {
    return this.contentRepository.find({
      relations: ['topic'],
      order: {
        order: 'ASC',
        title: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.contentRepository.findOne({
      where: { id },
      relations: ['topic'],
    });

    if (!content) {
      throw new NotFoundException(`Content #${id} not found`);
    }

    return content;
  }

  async findByTopic(topicId: string): Promise<Content[]> {
    // Verify topic exists
    await this.topicsService.findOne(topicId);

    return this.contentRepository.find({
      where: { topicId },
      relations: ['topic'],
      order: {
        order: 'ASC',
        title: 'ASC',
      },
    });
  }

  async update(id: string, updateContentDto: UpdateContentDto): Promise<Content> {
    const content = await this.findOne(id);

    if (updateContentDto.topicId) {
      // Verify new topic exists
      await this.topicsService.findOne(updateContentDto.topicId);
    }

    Object.assign(content, updateContentDto);
    return this.contentRepository.save(content);
  }

  async remove(id: string): Promise<void> {
    const content = await this.findOne(id);
    await this.contentRepository.remove(content);
  }

  async publish(id: string): Promise<Content> {
    const content = await this.findOne(id);

    if (content.status === ContentStatus.PUBLISHED) {
      throw new BadRequestException('Content is already published');
    }

    content.status = ContentStatus.PUBLISHED;
    content.publishedAt = new Date();
    return this.contentRepository.save(content);
  }

  async unpublish(id: string): Promise<Content> {
    const content = await this.findOne(id);

    if (content.status !== ContentStatus.PUBLISHED) {
      throw new BadRequestException('Content is not published');
    }

    content.status = ContentStatus.DRAFT;
    return this.contentRepository.save(content);
  }

  async archive(id: string): Promise<Content> {
    const content = await this.findOne(id);

    if (content.status === ContentStatus.ARCHIVED) {
      throw new BadRequestException('Content is already archived');
    }

    content.status = ContentStatus.ARCHIVED;
    return this.contentRepository.save(content);
  }

  async findPublished(): Promise<Content[]> {
    return this.contentRepository.find({
      where: { status: ContentStatus.PUBLISHED },
      relations: ['topic'],
      order: {
        order: 'ASC',
        title: 'ASC',
      },
    });
  }

  async findByTopicAndStatus(
    topicId: string,
    status: ContentStatus,
  ): Promise<Content[]> {
    // Verify topic exists
    await this.topicsService.findOne(topicId);

    return this.contentRepository.find({
      where: { topicId, status },
      relations: ['topic'],
      order: {
        order: 'ASC',
        title: 'ASC',
      },
    });
  }
}
