# Swagger (OpenAPI) Documentation

## Overview

We have implemented Swagger/OpenAPI documentation for our API using `@nestjs/swagger`. This provides interactive API documentation that allows developers to understand and test the API endpoints directly from the browser.

## Access Swagger UI

- Development URL: `http://localhost:3000/api/docs`
- The UI provides a visual interface to:
  - View all available endpoints
  - Test API calls directly
  - See request/response schemas
  - View authentication requirements

## How to Use Swagger UI

### 1. Authentication

1. Click the "Authorize" button at the top
2. Enter your JWT token in the format: `Bearer your-token-here`
3. Click "Authorize" to apply the token to all secured endpoints

### 2. Testing Endpoints

1. Choose an endpoint from the list
2. Click "Try it out"
3. Fill in the required parameters
4. Click "Execute" to make the request
5. View the response below

## Implementation Details

### 1. Main Swagger Configuration (`src/main.ts`)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Senior Backend API')
    .setDescription('NestJS Senior Backend Demo API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
```

### 2. Decorator Usage

#### Controller Level

```typescript
@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {}
```

#### Endpoint Level

```typescript
@Post()
@ApiOperation({ summary: 'Create a new user' })
@ApiResponse({
  status: 201,
  description: 'User created successfully',
  type: User
})
@ApiResponse({ status: 400, description: 'Bad request' })
create(@Body() createUserDto: CreateUserDto) {}
```

#### DTO Level

```typescript
export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;
}
```

### 3. Custom Decorators

#### Paginated Response

```typescript
export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(PaginatedDto),
    ApiOkResponse({
      description: 'Successfully received model list',
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
```

## Best Practices

1. **Documentation**

   - Always provide clear summaries and descriptions
   - Include example values in ApiProperty decorators
   - Document all possible response statuses

2. **Organization**

   - Group related endpoints using ApiTags
   - Use consistent naming conventions
   - Organize endpoints logically

3. **Security**

   - Document authentication requirements
   - Mark sensitive fields appropriately
   - Use @ApiSecurity for custom auth methods

4. **Response Models**
   - Define and document response types
   - Use appropriate schemas for arrays and objects
   - Include pagination information where applicable

## Common Decorators

- `@ApiTags()`: Group endpoints
- `@ApiOperation()`: Describe endpoint purpose
- `@ApiResponse()`: Document responses
- `@ApiProperty()`: Document DTO properties
- `@ApiBearerAuth()`: Mark endpoints requiring JWT
- `@ApiParam()`: Document URL parameters
- `@ApiQuery()`: Document query parameters
- `@ApiBody()`: Document request body
- `@ApiHeader()`: Document required headers
