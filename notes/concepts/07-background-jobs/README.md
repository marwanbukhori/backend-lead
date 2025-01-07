# Background Jobs and Message Queues in NestJS

## Overview

Background jobs and message queues are essential for handling time-consuming tasks, scheduling operations, and maintaining system responsiveness. NestJS provides excellent integration with Bull queue for handling these scenarios.

## Key Concepts

### 1. Basic Queue Setup

```typescript
// app.module.ts
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'emails',
    }),
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
})
export class AppModule {}

// email/email.processor.ts
@Processor('emails')
export class EmailProcessor {
  constructor(private readonly logger: Logger) {}

  @Process()
  async handleEmail(job: Job<EmailJobData>) {
    this.logger.debug('Processing email job: ' + job.id);
    await this.sendEmail(job.data);
    this.logger.debug('Email job completed: ' + job.id);
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onComplete(job: Job) {
    this.logger.debug(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
  }
}
```

### 2. Job Scheduling

```typescript
// scheduling/scheduled-jobs.service.ts
@Injectable()
export class ScheduledJobsService {
  constructor(
    @InjectQueue('emails') private readonly emailQueue: Queue,
    private readonly logger: Logger,
  ) {}

  async scheduleEmail(data: EmailJobData, delay: number) {
    const job = await this.emailQueue.add(data, {
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });

    this.logger.debug(`Scheduled email job: ${job.id}`);
    return job;
  }

  @Cron('0 0 * * *') // Run at midnight every day
  async scheduleDailyReport() {
    const job = await this.emailQueue.add(
      'daily-report',
      {
        type: 'daily-report',
        recipients: ['admin@example.com'],
      },
      {
        priority: 1,
        attempts: 5,
      },
    );

    this.logger.debug(`Scheduled daily report job: ${job.id}`);
  }
}
```

### 3. Queue Events and Monitoring

```typescript
// monitoring/queue-monitor.service.ts
@Injectable()
export class QueueMonitorService {
  constructor(
    @InjectQueue('emails') private readonly emailQueue: Queue,
    private readonly logger: Logger,
  ) {
    this.setupQueueMonitoring();
  }

  private setupQueueMonitoring() {
    this.emailQueue.on('completed', (job) => {
      this.logger.debug(`Job ${job.id} completed successfully`);
    });

    this.emailQueue.on('failed', (job, error) => {
      this.logger.error(`Job ${job.id} failed: ${error.message}`, error.stack);
    });

    this.emailQueue.on('stalled', (job) => {
      this.logger.warn(`Job ${job.id} is stalled`);
    });
  }

  async getQueueMetrics(): Promise<QueueMetrics> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      timestamp: new Date().toISOString(),
    };
  }
}
```

### 4. Concurrent Processing

```typescript
// processors/concurrent.processor.ts
@Processor('emails')
export class EmailProcessor {
  constructor(private readonly logger: Logger) {}

  @Process({
    name: 'high-priority',
    concurrency: 3,
  })
  async handleHighPriority(job: Job<EmailJobData>) {
    // Process high priority emails with higher concurrency
  }

  @Process({
    name: 'normal',
    concurrency: 1,
  })
  async handleNormal(job: Job<EmailJobData>) {
    // Process normal emails with lower concurrency
  }
}
```

## Best Practices

### 1. Job Retries and Backoff

```typescript
// services/resilient-jobs.service.ts
@Injectable()
export class ResilientJobsService {
  constructor(@InjectQueue('emails') private emailQueue: Queue) {}

  async addJobWithRetry(data: EmailJobData) {
    return this.emailQueue.add(data, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1000, // Initial delay
      },
      removeOnComplete: true, // Remove successful jobs
      removeOnFail: false, // Keep failed jobs for inspection
    });
  }

  async addPriorityJob(data: EmailJobData, priority: number) {
    return this.emailQueue.add(data, {
      priority,
      timeout: 5000, // Job timeout
      attempts: 3,
    });
  }
}
```

### 2. Dead Letter Queue

```typescript
// services/dead-letter.service.ts
@Injectable()
export class DeadLetterService {
  constructor(
    @InjectQueue('emails') private emailQueue: Queue,
    @InjectQueue('dead-letter') private deadLetterQueue: Queue,
    private readonly logger: Logger,
  ) {
    this.handleFailedJobs();
  }

  private async handleFailedJobs() {
    this.emailQueue.on('failed', async (job, error) => {
      if (job.attemptsMade >= job.opts.attempts) {
        await this.moveToDeadLetter(job, error);
      }
    });
  }

  private async moveToDeadLetter(job: Job, error: Error) {
    await this.deadLetterQueue.add(
      'failed-job',
      {
        originalJob: {
          id: job.id,
          data: job.data,
          opts: job.opts,
        },
        error: {
          message: error.message,
          stack: error.stack,
        },
        failedAt: new Date().toISOString(),
      },
      {
        removeOnComplete: false,
      },
    );

    this.logger.warn(`Job ${job.id} moved to dead letter queue`);
  }
}
```

## Implementation Example

### Complete Queue System

```typescript
// email/email.module.ts
@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'emails',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
        },
      },
      {
        name: 'dead-letter',
        defaultJobOptions: {
          removeOnComplete: false,
        },
      },
    ),
  ],
  providers: [
    EmailProcessor,
    EmailService,
    QueueMonitorService,
    DeadLetterService,
  ],
})
export class EmailModule {}

// email/email.service.ts
@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('emails') private readonly emailQueue: Queue,
    private readonly logger: Logger,
  ) {}

  async sendWelcomeEmail(user: User): Promise<Job<EmailJobData>> {
    const jobData: EmailJobData = {
      type: 'welcome',
      to: user.email,
      data: {
        name: user.name,
        verificationLink: `https://example.com/verify/${user.verificationToken}`,
      },
    };

    return this.emailQueue.add('welcome-email', jobData, {
      priority: 1,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  async sendBulkEmails(
    emails: EmailJobData[],
  ): Promise<Array<Job<EmailJobData>>> {
    const jobs = emails.map((email) =>
      this.emailQueue.add('bulk-email', email, {
        priority: 2,
        attempts: 3,
      }),
    );

    return Promise.all(jobs);
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    const job = await this.emailQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    const state = await job.getState();
    const progress = await job.progress();

    return {
      id: job.id,
      state,
      progress,
      data: job.data,
      attempts: job.attemptsMade,
      failedReason: job.failedReason,
      timestamp: job.timestamp,
    };
  }
}

// email/email.processor.ts
@Processor('emails')
export class EmailProcessor {
  constructor(
    private readonly emailProvider: EmailProvider,
    private readonly logger: Logger,
  ) {}

  @Process('welcome-email')
  async processWelcomeEmail(job: Job<EmailJobData>) {
    this.logger.debug(`Processing welcome email for job ${job.id}`);

    try {
      await this.emailProvider.send({
        to: job.data.to,
        template: 'welcome',
        data: job.data.data,
      });

      await job.progress(100);
      this.logger.debug(`Welcome email sent for job ${job.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email for job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process('bulk-email')
  async processBulkEmail(job: Job<EmailJobData>) {
    this.logger.debug(`Processing bulk email for job ${job.id}`);

    try {
      await this.emailProvider.sendBulk(job.data);
      await job.progress(100);
      this.logger.debug(`Bulk email sent for job ${job.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send bulk email for job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
```

## Testing

```typescript
describe('EmailService', () => {
  let service: EmailService;
  let queue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'emails',
        }),
      ],
      providers: [EmailService, Logger],
    }).compile();

    service = module.get<EmailService>(EmailService);
    queue = module.get<Queue>('emails');
  });

  describe('sendWelcomeEmail', () => {
    it('should add welcome email job to queue', async () => {
      const user = {
        email: 'test@example.com',
        name: 'Test User',
        verificationToken: 'token123',
      };

      const addSpy = jest.spyOn(queue, 'add');

      await service.sendWelcomeEmail(user);

      expect(addSpy).toHaveBeenCalledWith(
        'welcome-email',
        expect.objectContaining({
          type: 'welcome',
          to: user.email,
        }),
        expect.any(Object),
      );
    });
  });

  describe('getJobStatus', () => {
    it('should return job status', async () => {
      const mockJob = {
        id: '123',
        getState: jest.fn().mockResolvedValue('completed'),
        progress: jest.fn().mockResolvedValue(100),
        data: { type: 'welcome' },
        attemptsMade: 1,
        failedReason: null,
        timestamp: Date.now(),
      };

      jest.spyOn(queue, 'getJob').mockResolvedValue(mockJob as any);

      const status = await service.getJobStatus('123');

      expect(status).toEqual({
        id: '123',
        state: 'completed',
        progress: 100,
        data: { type: 'welcome' },
        attempts: 1,
        failedReason: null,
        timestamp: expect.any(Number),
      });
    });
  });
});
```

## Key Takeaways

1. Queue Management:

   - Use appropriate queue configuration
   - Implement proper error handling
   - Monitor queue health
   - Handle failed jobs properly

2. Job Processing:

   - Configure job options properly
   - Implement retry strategies
   - Use concurrency control
   - Monitor job progress

3. Error Handling:

   - Implement dead letter queues
   - Log failed jobs
   - Implement proper retry strategies
   - Monitor queue errors

4. Best Practices:
   - Clean up completed jobs
   - Implement job priorities
   - Use appropriate concurrency
   - Monitor queue performance
   - Implement proper logging
