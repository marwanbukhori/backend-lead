# Dependency Injection in NestJS

## Overview

Dependency Injection (DI) is a fundamental concept in NestJS that enables loose coupling between components and promotes better code organization, testability, and maintainability.

## Key Concepts

### 1. Constructor-based Injection

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
  ) {}
}
```

### 2. Property-based Injection

```typescript
@Injectable()
export class UserService {
  @Inject(UserRepository)
  private readonly userRepository: UserRepository;
}
```

### 3. Custom Providers

```typescript
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useValue: {
        apiUrl: 'http://api.example.com',
        timeout: 3000,
      },
    },
  ],
})
```

### 4. Provider Scopes

```typescript
@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(@Inject(REQUEST) private request: Request) {}
}
```

## Best Practices

1. **Always use constructor injection** when possible

   - More testable
   - Clearer dependencies
   - TypeScript support

2. **Use interfaces for abstraction**

```typescript
export interface IUserService {
  findOne(id: number): Promise<User>;
}

@Injectable()
export class UserService implements IUserService {
  findOne(id: number): Promise<User> {
    // implementation
  }
}
```

3. **Avoid circular dependencies**

   - Use forwardRef() when necessary
   - Better to restructure code to avoid circles

4. **Use proper scope**
   - DEFAULT (singleton) for stateless services
   - REQUEST for request-specific data
   - TRANSIENT when new instance always needed

## Common Pitfalls

1. Circular dependencies
2. Wrong scope selection
3. Missing provider registration
4. Incorrect use of async providers

## Implementation Example

```typescript
// user/interfaces/user-service.interface.ts
export interface IUserService {
  findOne(id: number): Promise<User>;
  create(user: CreateUserDto): Promise<User>;
}

// user/user.service.ts
@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    @Inject('CONFIG') private readonly config: Config,
  ) {}

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.save(createUserDto);
    await this.mailService.sendWelcomeEmail(user.email);
    return user;
  }
}

// user/user.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User]), MailModule],
  providers: [
    UserService,
    {
      provide: 'CONFIG',
      useFactory: (configService: ConfigService) => ({
        apiUrl: configService.get('API_URL'),
        timeout: configService.get('TIMEOUT'),
      }),
      inject: [ConfigService],
    },
  ],
  exports: [UserService],
})
export class UserModule {}
```

## Testing

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: MockType<Repository<User>>;
  let mailService: MockType<MailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: MailService,
          useFactory: mailServiceMockFactory,
        },
        {
          provide: 'CONFIG',
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(getRepositoryToken(User));
    mailService = module.get(MailService);
  });

  it('should find a user', async () => {
    const user = { id: 1, email: 'test@example.com' };
    repository.findOne.mockReturnValue(user);
    expect(await service.findOne(1)).toBe(user);
  });
});
```

## Key Takeaways

1. DI is central to NestJS architecture
2. Proper use of DI improves:
   - Code maintainability
   - Testability
   - Modularity
3. Choose appropriate scopes based on needs
4. Always consider testing when designing DI structure
