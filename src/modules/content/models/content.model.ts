import { AggregateRoot } from '@nestjs/cqrs';
import { ContentStatus } from '../entities/content.entity';
import { ContentPublishedEvent } from '../events/content-published.event';
import { BadRequestException } from '@nestjs/common';

export class ContentModel extends AggregateRoot {
  public id: string;
  public topicId: string;
  public title: string;
  public body: string;
  public codeExamples?: {
    language: string;
    code: string;
    description?: string;
  }[];
  public order: number;
  public status: ContentStatus;
  public publishedAt: Date | null;
  public version: number;

  constructor(content: Partial<ContentModel>) {
    super();
    Object.assign(this, content);
  }

  publish() {
    if (this.status === ContentStatus.PUBLISHED) {
      throw new BadRequestException('Content is already published');
    }

    this.status = ContentStatus.PUBLISHED;
    this.publishedAt = new Date();

    // Apply the event
    this.apply(new ContentPublishedEvent(this.id));
  }

  unpublish() {
    if (this.status !== ContentStatus.PUBLISHED) {
      throw new BadRequestException('Content is not published');
    }

    this.status = ContentStatus.DRAFT;
    this.publishedAt = null;
  }

  archive() {
    if (this.status === ContentStatus.ARCHIVED) {
      throw new BadRequestException('Content is already archived');
    }

    this.status = ContentStatus.ARCHIVED;
  }

  toJSON() {
    return {
      id: this.id,
      topicId: this.topicId,
      title: this.title,
      body: this.body,
      codeExamples: this.codeExamples,
      order: this.order,
      status: this.status,
      publishedAt: this.publishedAt,
      version: this.version,
    };
  }
}
