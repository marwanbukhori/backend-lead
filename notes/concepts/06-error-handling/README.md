# Error Handling in NestJS

## Overview

Proper error handling is crucial for building robust applications. NestJS provides several mechanisms for handling errors consistently across your application.

## Key Concepts

### 1. Exception Filters

```typescript
// filters/http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    const error = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorResponse['message'] || exception.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception.stack,
      }),
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      error.stack,
      'HttpException',
    );

    response.status(status).json(error);
  }
}
```

### 2. Custom Exceptions

```typescript
// exceptions/business-error.exception.ts
export class BusinessException extends HttpException {
  constructor(
    message: string,
    errorCode: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        message,
        errorCode,
        statusCode,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

// exceptions/resource-not-found.exception.ts
export class ResourceNotFoundException extends NotFoundException {
  constructor(resource: string, id: string | number) {
    super(`${resource} with id ${id} not found`);
  }
}

// Usage
throw new BusinessException(
  'Insufficient funds',
  'INSUFFICIENT_FUNDS',
  HttpStatus.BAD_REQUEST,
);
```

### 3. Validation Pipes

```typescript
// pipes/validation.pipe.ts
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (!metadata.metatype || !this.toValidate(metadata.metatype)) {
      return value;
    }

    const object = plainToClass(metadata.metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = this.formatErrors(errors);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: messages,
      });
    }

    return value;
  }

  private formatErrors(errors: ValidationError[]): ValidationErrorMessage[] {
    return errors.map((err) => ({
      field: err.property,
      messages: Object.values(err.constraints),
    }));
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

### 4. Error Logging

```typescript
// interceptors/error-logging.interceptor.ts
@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest();
        this.logger.error(
          `Error in ${request.method} ${request.url}`,
          error.stack,
          'ErrorLoggingInterceptor',
        );
        throw error;
      }),
    );
  }
}
```

## Best Practices

### 1. Centralized Error Handling

```typescript
// app.module.ts
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorLoggingInterceptor,
    },
  ],
})
export class AppModule {}
```

### 2. Error Response Standardization

```typescript
// interfaces/error-response.interface.ts
export interface ErrorResponse {
  statusCode: number;
  message: string;
  errorCode?: string;
  timestamp: string;
  path: string;
  method: string;
  details?: Record<string, any>;
}

// filters/all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.createErrorResponse(exception, request);

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : '',
      'AllExceptionsFilter',
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private createErrorResponse(
    exception: unknown,
    request: Request,
  ): ErrorResponse {
    if (exception instanceof HttpException) {
      return {
        statusCode: exception.getStatus(),
        message: exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        ...(exception instanceof BusinessException && {
          errorCode: exception.getResponse()['errorCode'],
        }),
      };
    }

    // Handle unexpected errors
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };
  }
}
```

## Implementation Example

### Complete Error Handling System

```typescript
// services/users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: Logger,
  ) {}

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new ResourceNotFoundException('User', id);
      }
      return user;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error finding user with id ${id}`,
        error.stack,
        'UsersService',
      );
      throw new InternalServerErrorException(
        'An error occurred while finding the user',
      );
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new BusinessException(
          'User with this email already exists',
          'USER_EXISTS',
          HttpStatus.CONFLICT,
        );
      }

      const user = this.userRepository.create(createUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      this.logger.error('Error creating user', error.stack, 'UsersService');
      throw new InternalServerErrorException(
        'An error occurred while creating the user',
      );
    }
  }
}

// controllers/users.controller.ts
@Controller('users')
@UseFilters(new HttpExceptionFilter(new Logger()))
@UseInterceptors(new ErrorLoggingInterceptor(new Logger()))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }
}
```

## Testing

```typescript
describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
    filter = new HttpExceptionFilter(logger);
  });

  it('should format error response correctly', () => {
    const mockException = new HttpException(
      'Test error',
      HttpStatus.BAD_REQUEST,
    );
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        }),
        getRequest: () => ({
          url: '/test',
          method: 'GET',
        }),
      }),
    } as ExecutionContext;

    const mockResponse = mockContext.switchToHttp().getResponse();

    filter.catch(mockException, mockContext as any);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Test error',
      }),
    );
  });
});

describe('ValidationPipe', () => {
  let pipe: ValidationPipe;

  beforeEach(() => {
    pipe = new ValidationPipe();
  });

  it('should throw BadRequestException when validation fails', async () => {
    class TestDto {
      @IsString()
      name: string;
    }

    const metadata = {
      metatype: TestDto,
      type: 'body',
      data: '',
    };

    await expect(pipe.transform({ name: 123 }, metadata)).rejects.toThrow(
      BadRequestException,
    );
  });
});
```

## Key Takeaways

1. Error Handling Strategy:

   - Use custom exceptions for business logic
   - Implement global exception filters
   - Standardize error responses
   - Proper error logging

2. Validation:

   - Use validation pipes
   - Implement DTO validation
   - Handle validation errors consistently
   - Provide clear validation messages

3. Logging:

   - Implement structured logging
   - Log appropriate error details
   - Use different log levels
   - Include request context

4. Best Practices:
   - Centralize error handling
   - Use typed exceptions
   - Implement proper error hierarchy
   - Handle async errors properly
   - Secure error messages in production
