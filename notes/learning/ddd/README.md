# Domain-Driven Design

## Overview

This section covers Domain-Driven Design principles and their implementation in our learning platform.

## Core Concepts

### Bounded Contexts
```typescript
// Course Management Context
@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Lesson, Progress]),
    UserContextModule, // Importing from another context
  ],
})
export class CourseContextModule {}

// User Management Context
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Authentication]),
  ],
})
export class UserContextModule {}
```

### Aggregates
```typescript
// Course Aggregate Root
@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  // Child entities within the aggregate
  @OneToMany(() => Lesson, lesson => lesson.course, {
    cascade: true,
  })
  lessons: Lesson[];

  // Domain methods that maintain invariants
  addLesson(lesson: Lesson) {
    if (this.lessons.length >= 50) {
      throw new DomainException('Course cannot have more than 50 lessons');
    }
    this.lessons.push(lesson);
  }

  updateContent(data: UpdateCourseDto) {
    // Validate and update course content
    if (!this.isValidContent(data)) {
      throw new DomainException('Invalid course content');
    }
    // Update logic
  }
}
```

### Value Objects
```typescript
// Email Value Object
export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new InvalidEmailException(email);
    }
    this.value = email;
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// Usage in Entity
@Entity()
export class User {
  @Column(() => Email)
  email: Email;
}
```

### Domain Events
```typescript
// Event Definition
export class CourseCreatedEvent {
  constructor(
    public readonly courseId: number,
    public readonly instructorId: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}

// Event Publishing
@Entity()
export class Course {
  @Inject(EventEmitter2)
  private eventEmitter: EventEmitter2;

  async create(data: CreateCourseDto): Promise<void> {
    // Course creation logic

    // Publish domain event
    this.eventEmitter.emit(
      'course.created',
      new CourseCreatedEvent(this.id, data.instructorId),
    );
  }
}

// Event Handler
@Injectable()
export class CourseCreatedHandler {
  @OnEvent('course.created')
  async handle(event: CourseCreatedEvent) {
    // Handle the event
    await this.notificationService.notifyInstructor(event.instructorId);
    await this.searchIndexService.indexCourse(event.courseId);
  }
}
```

## Domain Services
```typescript
@Injectable()
export class CourseEnrollmentService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async enrollStudent(courseId: number, studentId: number): Promise<void> {
    const course = await this.courseRepository.findOne(courseId);
    const student = await this.userRepository.findOne(studentId);

    if (!course || !student) {
      throw new DomainException('Course or student not found');
    }

    if (!this.canEnroll(course, student)) {
      throw new DomainException('Student cannot enroll in this course');
    }

    // Enrollment logic
    await this.courseRepository.addStudent(course, student);

    // Publish domain event
    this.eventEmitter.emit(
      'student.enrolled',
      new StudentEnrolledEvent(courseId, studentId),
    );
  }

  private canEnroll(course: Course, student: User): boolean {
    // Domain rules for enrollment
    return course.hasCapacity() &&
           !course.hasStudent(student) &&
           student.canEnrollInCourse(course);
  }
}
```

## Repositories
```typescript
@Injectable()
export class CourseRepository {
  constructor(
    @InjectRepository(Course)
    private readonly repository: Repository<Course>,
  ) {}

  async findByInstructor(instructorId: number): Promise<Course[]> {
    return this.repository.find({
      where: { instructorId },
      relations: ['lessons', 'students'],
    });
  }

  async save(course: Course): Promise<Course> {
    // Validate domain rules before saving
    if (!course.isValid()) {
      throw new DomainException('Invalid course state');
    }
    return this.repository.save(course);
  }
}
```

## Best Practices

1. **Ubiquitous Language**
   - Use consistent terminology across codebase
   - Document domain terms in a glossary
   - Align code naming with business concepts

2. **Aggregate Design**
   - Keep aggregates small and focused
   - Maintain consistency boundaries
   - Use eventual consistency between aggregates

3. **Domain Events**
   - Use events for cross-aggregate communication
   - Keep events immutable
   - Include all relevant context in events

4. **Testing**
```typescript
describe('CourseAggregate', () => {
  it('should maintain invariants when adding lessons', () => {
    const course = new Course();

    // Add maximum allowed lessons
    for (let i = 0; i < 50; i++) {
      course.addLesson(new Lesson());
    }

    // Attempt to add one more lesson
    expect(() => course.addLesson(new Lesson()))
      .toThrow(DomainException);
  });
});
```
