# API Design

## Overview

This section covers API design principles and implementation in our learning platform.

## RESTful Principles

### Resource Naming

```typescript
@Controller("courses")
export class CourseController {
  @Get()
  findAll() {}

  @Get(":id")
  findOne(@Param("id") id: string) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {}

  @Put(":id")
  update(@Param("id") id: string, @Body() updateCourseDto: UpdateCourseDto) {}

  @Delete(":id")
  remove(@Param("id") id: string) {}
}
```

### Request/Response DTOs

```typescript
// Create DTO
export class CreateCourseDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @IsString()
  @MaxLength(500)
  description: string;

  @IsNumber()
  @IsPositive()
  instructorId: number;
}

// Response DTO
export class CourseResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  @Type(() => InstructorDto)
  instructor: InstructorDto;

  @Expose()
  createdAt: Date;
}
```

## GraphQL Implementation

### Schema Definition

```typescript
@ObjectType()
export class Course {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => [Lesson])
  lessons: Lesson[];

  @Field(() => Instructor)
  instructor: Instructor;
}

@InputType()
export class CreateCourseInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  instructorId: number;
}
```

### Resolvers

```typescript
@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query(() => [Course])
  async courses(): Promise<Course[]> {
    return this.courseService.findAll();
  }

  @Query(() => Course)
  async course(@Args("id") id: number): Promise<Course> {
    return this.courseService.findOne(id);
  }

  @Mutation(() => Course)
  async createCourse(@Args("input") input: CreateCourseInput): Promise<Course> {
    return this.courseService.create(input);
  }

  @ResolveField(() => Instructor)
  async instructor(@Parent() course: Course): Promise<Instructor> {
    return this.instructorService.findOne(course.instructorId);
  }
}
```

## API Versioning

### URL Versioning

```typescript
// main.ts
app.enableVersioning({
  type: VersioningType.URI,
  prefix: "v",
});

// controller.ts
@Controller({
  version: "1",
  path: "courses",
})
export class CourseControllerV1 {}

@Controller({
  version: "2",
  path: "courses",
})
export class CourseControllerV2 {}
```

### Header Versioning

```typescript
// main.ts
app.enableVersioning({
  type: VersioningType.HEADER,
  header: "X-API-Version",
});

// controller.ts
@Controller({
  version: "1",
  path: "courses",
})
export class CourseController {}
```

## Documentation

### OpenAPI/Swagger

```typescript
@ApiTags("courses")
@Controller("courses")
export class CourseController {
  @ApiOperation({ summary: "Create a new course" })
  @ApiResponse({
    status: 201,
    description: "Course has been created successfully",
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {}

  @ApiOperation({ summary: "Get course by id" })
  @ApiParam({ name: "id", description: "Course ID" })
  @ApiResponse({
    status: 200,
    description: "Course found",
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: "Course not found" })
  @Get(":id")
  findOne(@Param("id") id: string) {}
}
```

## Error Handling

### Global Exception Filter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### Custom Exceptions

```typescript
export class CourseNotFoundException extends NotFoundException {
  constructor(courseId: number) {
    super(`Course with ID ${courseId} not found`);
  }
}

export class InvalidCourseDataException extends BadRequestException {
  constructor(errors: string[]) {
    super({
      message: "Invalid course data",
      errors,
    });
  }
}
```

## Security

### Rate Limiting

```typescript
@Controller("courses")
@UseGuards(AuthGuard)
export class CourseController {
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 60) // 5 requests per minute
  @Get()
  findAll() {}
}
```

### Request Validation

```typescript
export class CreateCourseDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @ApiProperty({
    description: "Course title",
    minLength: 3,
    maxLength: 100,
  })
  title: string;

  @IsString()
  @MaxLength(500)
  @ApiProperty({
    description: "Course description",
    maxLength: 500,
  })
  description: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: "Instructor ID",
    minimum: 1,
  })
  instructorId: number;
}
```

## Best Practices

1. **API Design**

   - Use consistent naming conventions
   - Follow HTTP method semantics
   - Implement proper status codes
   - Version your APIs

2. **Security**

   - Implement rate limiting
   - Validate all inputs
   - Use proper authentication
   - Handle errors gracefully

3. **Documentation**

   - Keep API docs up to date
   - Include examples
   - Document error responses
   - Use clear descriptions

4. **Performance**
   - Implement caching
   - Use pagination
   - Optimize queries
   - Monitor response times
