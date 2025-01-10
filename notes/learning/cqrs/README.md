# CQRS Pattern

## Overview

This section covers the Command Query Responsibility Segregation (CQRS) pattern implementation in our learning platform.

## Core Concepts

### Commands

```typescript
// Command Definition
export class CreateCourseCommand {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly instructorId: number
  ) {}
}

// Command Handler
@CommandHandler(CreateCourseCommand)
export class CreateCourseHandler
  implements ICommandHandler<CreateCourseCommand>
{
  constructor(
    private readonly repository: CourseRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateCourseCommand) {
    const course = new Course();
    course.title = command.title;
    course.description = command.description;
    course.instructorId = command.instructorId;

    await this.repository.save(course);

    // Publish event
    this.eventBus.publish(new CourseCreatedEvent(course.id));
  }
}
```

### Queries

```typescript
// Query Definition
export class GetCourseByIdQuery {
  constructor(public readonly id: number) {}
}

// Query Handler
@QueryHandler(GetCourseByIdQuery)
export class GetCourseByIdHandler implements IQueryHandler<GetCourseByIdQuery> {
  constructor(
    @InjectRepository(CourseView)
    private readonly viewRepository: Repository<CourseView>
  ) {}

  async execute(query: GetCourseByIdQuery) {
    return this.viewRepository.findOne(query.id);
  }
}
```

### Event Sourcing

```typescript
// Event Definition
export class CourseEvent {
  constructor(
    public readonly courseId: number,
    public readonly timestamp: Date = new Date()
  ) {}
}

export class CourseTitleChangedEvent extends CourseEvent {
  constructor(
    courseId: number,
    public readonly oldTitle: string,
    public readonly newTitle: string
  ) {
    super(courseId);
  }
}

// Event Sourced Aggregate
export class CourseAggregate extends AggregateRoot {
  private title: string;

  changeTitle(newTitle: string) {
    this.apply(new CourseTitleChangedEvent(this.id, this.title, newTitle));
  }

  onCourseTitleChanged(event: CourseTitleChangedEvent) {
    this.title = event.newTitle;
  }
}
```

### Event Store

```typescript
@Injectable()
export class EventStore {
  constructor(
    @InjectRepository(EventModel)
    private readonly repository: Repository<EventModel>
  ) {}

  async saveEvents(
    aggregateId: string,
    events: any[],
    expectedVersion?: number
  ) {
    const eventStream = await this.repository.find({
      where: { aggregateId },
      order: { version: "DESC" },
    });

    // Optimistic concurrency check
    if (expectedVersion && eventStream[0]?.version !== expectedVersion) {
      throw new ConcurrencyException();
    }

    let version = expectedVersion || 0;

    const eventRecords = events.map((event) => {
      version++;
      return {
        aggregateId,
        version,
        type: event.constructor.name,
        data: event,
        timestamp: new Date(),
      };
    });

    await this.repository.save(eventRecords);
  }
}
```

### Projections

```typescript
// Read Model
@Entity()
export class CourseView {
  @PrimaryColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  instructorName: string;

  @Column()
  studentCount: number;
}

// Projector
@Injectable()
export class CourseProjector {
  constructor(
    @InjectRepository(CourseView)
    private readonly viewRepository: Repository<CourseView>
  ) {}

  @EventsHandler(CourseCreatedEvent)
  async onCourseCreated(event: CourseCreatedEvent) {
    const view = new CourseView();
    view.id = event.courseId;
    // ... set other properties
    await this.viewRepository.save(view);
  }

  @EventsHandler(StudentEnrolledEvent)
  async onStudentEnrolled(event: StudentEnrolledEvent) {
    await this.viewRepository.increment(
      { id: event.courseId },
      "studentCount",
      1
    );
  }
}
```

## Implementation Example

### Controller

```typescript
@Controller("courses")
export class CourseController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  async createCourse(@Body() dto: CreateCourseDto) {
    return this.commandBus.execute(
      new CreateCourseCommand(dto.title, dto.description, dto.instructorId)
    );
  }

  @Get(":id")
  async getCourse(@Param("id") id: number) {
    return this.queryBus.execute(new GetCourseByIdQuery(id));
  }
}
```

## Testing

```typescript
describe("CreateCourseHandler", () => {
  let handler: CreateCourseHandler;
  let repository: MockType<Repository<Course>>;
  let eventBus: MockType<EventBus>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreateCourseHandler,
        {
          provide: getRepositoryToken(Course),
          useFactory: repositoryMockFactory,
        },
        {
          provide: EventBus,
          useFactory: () => ({
            publish: jest.fn(),
          }),
        },
      ],
    }).compile();

    handler = module.get<CreateCourseHandler>(CreateCourseHandler);
    repository = module.get(getRepositoryToken(Course));
    eventBus = module.get(EventBus);
  });

  it("should create course and publish event", async () => {
    const command = new CreateCourseCommand("Test Course", "Description", 1);
    await handler.execute(command);

    expect(repository.save).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalled();
  });
});
```

## Best Practices

1. **Command Validation**

   - Validate commands before processing
   - Use DTOs for command data
   - Implement custom validators

2. **Query Optimization**

   - Denormalize data for read models
   - Use appropriate indexes
   - Cache frequently accessed data

3. **Event Handling**

   - Make events immutable
   - Include all necessary context
   - Handle events idempotently

4. **Testing**
   - Test commands and queries separately
   - Mock dependencies appropriately
   - Test event handlers in isolation
