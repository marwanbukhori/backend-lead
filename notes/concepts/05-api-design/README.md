# API Design in NestJS

## Overview

API design is crucial for creating maintainable, scalable, and user-friendly web services. NestJS provides excellent tools and patterns for implementing RESTful APIs and GraphQL endpoints.

## Key Concepts

### 1. RESTful Best Practices

```typescript
// users/users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  async findAll(
    @Query() query: ListUsersDto,
  ): Promise<PaginatedResponse<User>> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Return a user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 204, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersService.remove(id);
  }
}
```

### 2. GraphQL Implementation

```typescript
// users/users.resolver.ts
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  async users(
    @Args('filter', { nullable: true }) filter: UserFilterInput,
  ): Promise<User[]> {
    return this.usersService.findAll(filter);
  }

  @Query(() => User)
  async user(@Args('id', { type: () => Int }) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.usersService.create(input);
  }

  @ResolveField()
  async posts(@Parent() user: User): Promise<Post[]> {
    return this.postsService.findByUserId(user.id);
  }
}

// users/dto/user.input.ts
@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(8)
  password: string;

  @Field(() => [String], { nullable: true })
  roles?: string[];
}
```

### 3. API Versioning

```typescript
// main.ts
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});

// users/users.controller.ts
@Controller({
  version: '1',
  path: 'users',
})
export class UsersV1Controller {}

@Controller({
  version: '2',
  path: 'users',
})
export class UsersV2Controller {}
```

### 4. Rate Limiting

```typescript
// app.module.ts
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
})
export class AppModule {}

// users/users.controller.ts
@Controller('users')
@UseGuards(ThrottlerGuard)
export class UsersController {
  @Throttle(5, 60)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
```

## Best Practices

### 1. Request Validation

```typescript
// users/dto/create-user.dto.ts
export class CreateUserDto {
  @IsEmail()
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message: 'Password too weak',
  })
  @ApiProperty({
    example: 'Password123',
    description: 'The password of the user',
  })
  password: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    example: ['user', 'admin'],
    description: 'The roles of the user',
    required: false,
  })
  roles?: string[];
}
```

### 2. Response Serialization

```typescript
// users/entities/user.entity.ts
export class User {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

// users/users.controller.ts
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  @Get()
  async findAll(): Promise<User[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => new User(user));
  }
}
```

## Implementation Example

### Complete API Implementation

```typescript
// users/users.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CacheModule.register(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

// users/users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async findAll(query: ListUsersDto): Promise<PaginatedResponse<User>> {
    const cacheKey = `users_${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const [items, total] = await this.userRepository.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { [query.sortBy]: query.sortOrder },
      where: query.filter,
    });

    const result = {
      items,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        pages: Math.ceil(total / query.limit),
      },
    };

    await this.cacheManager.set(cacheKey, result, { ttl: 300 });
    return result;
  }

  async findOne(id: number): Promise<User> {
    const cacheKey = `user_${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    await this.cacheManager.set(cacheKey, user, { ttl: 300 });
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }
}

// users/interceptors/transform.interceptor.ts
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        meta: {
          timestamp: new Date().toISOString(),
          path: context.switchToHttp().getRequest().url,
        },
      })),
    );
  }
}
```

## Testing

```typescript
describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [{ id: 1, name: 'Test User' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll({})).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = { email: 'test@example.com', password: 'password' };
      const result = { id: 1, ...createUserDto };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createUserDto)).toBe(result);
    });
  });
});
```

## Key Takeaways

1. API Design Principles:

   - Use consistent naming conventions
   - Implement proper HTTP methods
   - Handle errors uniformly
   - Document endpoints thoroughly

2. Request/Response Handling:

   - Validate input data
   - Transform responses
   - Implement pagination
   - Use proper status codes

3. Performance Considerations:

   - Implement caching
   - Use rate limiting
   - Optimize database queries
   - Handle concurrent requests

4. Best Practices:
   - Version your APIs
   - Use DTOs for validation
   - Implement proper error handling
   - Document with Swagger/OpenAPI
   - Write comprehensive tests
