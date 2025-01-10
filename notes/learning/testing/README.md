# Testing Strategies

## Overview

This section covers comprehensive testing strategies and implementations in our learning platform.

## Unit Testing

### Service Testing

```typescript
describe("CourseService", () => {
  let service: CourseService;
  let repository: MockType<Repository<Course>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: getRepositoryToken(Course),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
    repository = module.get(getRepositoryToken(Course));
  });

  describe("createCourse", () => {
    it("should create a new course", async () => {
      const dto = {
        title: "Test Course",
        description: "Test Description",
        instructorId: 1,
      };

      const savedCourse = { id: 1, ...dto };
      jest.spyOn(repository, "save").mockResolvedValue(savedCourse);

      const result = await service.create(dto);
      expect(result).toEqual(savedCourse);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(dto)
      );
    });

    it("should throw error if title is empty", async () => {
      const dto = {
        title: "",
        description: "Test Description",
        instructorId: 1,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });
});
```

### Controller Testing

```typescript
describe("CourseController", () => {
  let controller: CourseController;
  let service: CourseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [
        {
          provide: CourseService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CourseController>(CourseController);
    service = module.get<CourseService>(CourseService);
  });

  describe("findAll", () => {
    it("should return array of courses", async () => {
      const result = [{ id: 1, title: "Course 1" }];
      jest.spyOn(service, "findAll").mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
    });
  });
});
```

## Integration Testing

### Database Integration

```typescript
describe("CourseRepository Integration", () => {
  let repository: Repository<Course>;
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection({
      type: "postgres",
      database: "test_db",
      entities: [Course],
      synchronize: true,
    });

    repository = connection.getRepository(Course);
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    await repository.clear();
  });

  it("should save and retrieve course", async () => {
    const course = new Course();
    course.title = "Test Course";
    course.description = "Description";

    await repository.save(course);
    const found = await repository.findOne({ where: { title: "Test Course" } });

    expect(found).toBeDefined();
    expect(found?.title).toBe("Test Course");
  });
});
```

### API Integration Testing

```typescript
describe("Course API Integration", () => {
  let app: INestApplication;
  let repository: Repository<Course>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "postgres",
          database: "test_db",
          entities: [Course],
          synchronize: true,
        }),
        CourseModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    repository = moduleFixture.get(getRepositoryToken(Course));
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /courses", () => {
    it("should create course", () => {
      return request(app.getHttpServer())
        .post("/courses")
        .send({
          title: "New Course",
          description: "Description",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe("New Course");
        });
    });
  });
});
```

## E2E Testing

### Setup

```typescript
// test/e2e/courses.e2e-spec.ts
describe("Courses (e2e)", () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get JWT token for authenticated requests
    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        username: "test@example.com",
        password: "password",
      });

    jwtToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Course Creation Flow", () => {
    it("should create and retrieve course", async () => {
      // Create course
      const createResponse = await request(app.getHttpServer())
        .post("/courses")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          title: "E2E Test Course",
          description: "Description",
        })
        .expect(201);

      const courseId = createResponse.body.id;

      // Verify course was created
      await request(app.getHttpServer())
        .get(`/courses/${courseId}`)
        .set("Authorization", `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe("E2E Test Course");
        });
    });
  });
});
```

## Performance Testing

### Load Testing with Artillery

```yaml
# load-test.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 5
      rampTo: 50
  defaults:
    headers:
      Authorization: "Bearer {{token}}"

scenarios:
  - name: "Course browsing flow"
    flow:
      - get:
          url: "/courses"
      - think: 1
      - get:
          url: "/courses/{{courseId}}"
      - think: 2
      - get:
          url: "/courses/{{courseId}}/lessons"
```

## Test Coverage

```typescript
// jest.config.js
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## Best Practices

1. **Test Organization**

   - Group related tests
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)

2. **Test Data Management**

   - Use factories for test data
   - Clean up after tests
   - Use meaningful test data

3. **Mocking**

   - Mock external dependencies
   - Use proper typing for mocks
   - Verify mock interactions

4. **Continuous Integration**
   - Run tests on every commit
   - Maintain test coverage
   - Monitor test performance
