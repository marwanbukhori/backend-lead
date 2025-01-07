# CQRS in NestJS

## Overview

Command Query Responsibility Segregation (CQRS) is an architectural pattern that separates read and write operations for a data store. NestJS provides a dedicated `@nestjs/cqrs` package for implementing this pattern.

## Key Concepts

### 1. Commands and Command Handlers

```typescript
// commands/create-user.command.ts
export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly name: string,
  ) {}
}

// handlers/create-user.handler.ts
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { email, password, name } = command;

    const user = await this.userRepository.create({
      email,
      password,
      name,
    });

    // Publish domain event
    this.eventBus.publish(new UserCreatedEvent(user));

    return user;
  }
}
```

### 2. Queries and Query Handlers

```typescript
// queries/get-user.query.ts
export class GetUserQuery {
  constructor(public readonly userId: string) {}
}

// handlers/get-user.handler.ts
@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserQuery): Promise<User> {
    return this.userRepository.findById(query.userId);
  }
}
```

### 3. Events and Event Handlers

```typescript
// events/user-created.event.ts
export class UserCreatedEvent {
  constructor(public readonly user: User) {}
}

// handlers/user-created.handler.ts
@EventHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  constructor(private readonly logger: Logger) {}

  handle(event: UserCreatedEvent) {
    this.logger.log(`User created: ${event.user.email}`);
    // Handle side effects (e.g., send welcome email, notify other services)
  }
}
```

### 4. Sagas (Event Orchestration)

```typescript
// sagas/users.saga.ts
@Injectable()
export class UsersSaga {
  @Saga()
  userCreated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(UserCreatedEvent),
      map((event) => {
        // Return a new command to be executed
        return new SendWelcomeEmailCommand(event.user);
      }),
    );
  };
}
```

## Best Practices

### 1. Command Bus Pattern

```typescript
// users/users.controller.ts
@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.commandBus.execute(
      new CreateUserCommand(
        createUserDto.email,
        createUserDto.password,
        createUserDto.name,
      ),
    );
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserQuery(id));
  }
}
```

### 2. Event Sourcing

```typescript
// events/user.events.ts
export class UserEmailChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly oldEmail: string,
    public readonly newEmail: string,
  ) {}
}

// models/user.model.ts
export class User extends AggregateRoot {
  private email: string;
  private password: string;
  private name: string;

  changeEmail(newEmail: string) {
    const oldEmail = this.email;
    this.email = newEmail;

    this.apply(new UserEmailChangedEvent(this.id, oldEmail, newEmail));
  }

  private onUserEmailChanged(event: UserEmailChangedEvent) {
    this.email = event.newEmail;
  }
}
```

## Implementation Example

### Complete CQRS Implementation

```typescript
// users/users.module.ts
@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [
    // Command Handlers
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,

    // Query Handlers
    GetUserHandler,
    GetUsersHandler,

    // Event Handlers
    UserCreatedHandler,
    UserUpdatedHandler,

    // Sagas
    UsersSaga,

    // Services
    UsersService,
  ],
})
export class UsersModule {}

// users/commands/impl/update-user.command.ts
export class UpdateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly updateData: Partial<User>,
  ) {}
}

// users/commands/handlers/update-user.handler.ts
@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    private readonly repository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    const { userId, updateData } = command;

    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    // Update user and apply domain events
    if (updateData.email && updateData.email !== user.email) {
      user.changeEmail(updateData.email);
    }

    // Save and publish events
    const updatedUser = await this.repository.save(user);
    user.commit();

    return updatedUser;
  }
}

// users/queries/impl/get-users.query.ts
export class GetUsersQuery {
  constructor(public readonly filter: UserFilter) {}
}

// users/queries/handlers/get-users.handler.ts
@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(private readonly repository: UserRepository) {}

  async execute(query: GetUsersQuery): Promise<User[]> {
    return this.repository.findAll(query.filter);
  }
}

// users/events/handlers/user-updated.handler.ts
@EventHandler(UserUpdatedEvent)
export class UserUpdatedHandler implements IEventHandler<UserUpdatedEvent> {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logger: Logger,
  ) {}

  async handle(event: UserUpdatedEvent) {
    this.logger.log(`User updated: ${event.userId}`);

    if (event.changes.email) {
      await this.notificationService.sendEmailChangeNotification(
        event.userId,
        event.changes.email,
      );
    }
  }
}

// users/sagas/users.saga.ts
@Injectable()
export class UsersSaga {
  @Saga()
  userUpdated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(UserUpdatedEvent),
      filter((event) => !!event.changes.email),
      map((event) => {
        return new SendEmailVerificationCommand(
          event.userId,
          event.changes.email,
        );
      }),
    );
  };
}
```

## Testing

```typescript
describe('UpdateUserHandler', () => {
  let handler: UpdateUserHandler;
  let repository: MockType<UserRepository>;
  let eventBus: MockType<EventBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserHandler,
        {
          provide: UserRepository,
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

    handler = module.get<UpdateUserHandler>(UpdateUserHandler);
    repository = module.get(UserRepository);
    eventBus = module.get(EventBus);
  });

  it('should update user and publish events', async () => {
    const user = new User();
    user.id = '1';
    user.email = 'old@example.com';

    repository.findById.mockResolvedValue(user);
    repository.save.mockResolvedValue({
      ...user,
      email: 'new@example.com',
    });

    const command = new UpdateUserCommand('1', {
      email: 'new@example.com',
    });

    const result = await handler.execute(command);

    expect(result.email).toBe('new@example.com');
    expect(repository.save).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(UserEmailChangedEvent),
    );
  });
});
```

## Key Takeaways

1. CQRS Benefits:

   - Separation of concerns
   - Scalability options
   - Better performance optimization
   - Clear domain modeling

2. Implementation Considerations:

   - Command validation
   - Event handling
   - Saga patterns
   - Event sourcing

3. Performance Optimization:

   - Read/Write separation
   - Caching strategies
   - Event store optimization
   - Query optimization

4. Best Practices:
   - Keep commands and queries separate
   - Use domain events
   - Implement proper validation
   - Handle concurrency
   - Maintain event consistency
