# Caching Strategies in NestJS

## Overview

Caching is a crucial performance optimization technique that stores frequently accessed data in memory for faster retrieval. NestJS provides built-in caching mechanisms and supports various caching strategies.

## Key Concepts

### 1. In-Memory Caching

```typescript
// app.module.ts
@Module({
  imports: [
    CacheModule.register({
      ttl: 5, // seconds
      max: 10, // maximum number of items in cache
    }),
  ],
})
export class AppModule {}
```

### 2. Redis Caching

```typescript
// app.module.ts
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
  ],
})
export class AppModule {}
```

### 3. Cache Decorators

```typescript
@Injectable()
export class UserService {
  @CacheKey('all_users')
  @CacheTTL(30)
  @UseInterceptors(CacheInterceptor)
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
```

### 4. Cache-Aside Pattern

```typescript
@Injectable()
export class ProductService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly productRepository: ProductRepository,
  ) {}

  async findOne(id: number): Promise<Product> {
    // Try to get from cache
    const cachedProduct = await this.cacheManager.get(`product_${id}`);
    if (cachedProduct) {
      return cachedProduct;
    }

    // If not in cache, get from database
    const product = await this.productRepository.findOne(id);

    // Store in cache
    await this.cacheManager.set(`product_${id}`, product, { ttl: 300 });

    return product;
  }
}
```

## Best Practices

1. **Choose the Right Caching Strategy**

   - In-memory for small, frequently accessed data
   - Redis for distributed systems
   - Cache-aside for complex scenarios

2. **Set Appropriate TTL**

   - Short TTL for frequently changing data
   - Longer TTL for static data
   - Consider business requirements

3. **Cache Invalidation**

```typescript
@Injectable()
export class ProductService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    // Update in database
    const updated = await this.productRepository.update(id, data);

    // Invalidate cache
    await this.cacheManager.del(`product_${id}`);

    return updated;
  }
}
```

4. **Handle Cache Failures Gracefully**

```typescript
@Injectable()
export class CacheService {
  async getCacheValue<T>(
    key: string,
    fallbackFn: () => Promise<T>,
  ): Promise<T> {
    try {
      const cached = await this.cacheManager.get<T>(key);
      if (cached) return cached;
    } catch (error) {
      // Log cache error but continue with fallback
      this.logger.error(`Cache error: ${error.message}`);
    }

    const value = await fallbackFn();
    try {
      await this.cacheManager.set(key, value);
    } catch (error) {
      this.logger.error(`Failed to set cache: ${error.message}`);
    }
    return value;
  }
}
```

## Implementation Example

### Complex Caching Strategy

```typescript
@Injectable()
export class ProductService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly productRepository: ProductRepository,
    private readonly logger: Logger,
  ) {}

  async getProductWithCategories(id: number): Promise<ProductWithCategories> {
    const cacheKey = `product_with_categories_${id}`;

    try {
      // Try to get from cache
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return cached;
      }
    } catch (error) {
      this.logger.error(`Cache error: ${error.message}`);
    }

    // Get from database with relations
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    try {
      // Store in cache with TTL
      await this.cacheManager.set(cacheKey, product, { ttl: 300 });
    } catch (error) {
      this.logger.error(`Failed to set cache: ${error.message}`);
    }

    return product;
  }

  async updateProduct(id: number, data: UpdateProductDto): Promise<Product> {
    const updated = await this.productRepository.update(id, data);

    // Invalidate related caches
    const keysToInvalidate = [
      `product_${id}`,
      `product_with_categories_${id}`,
      'all_products',
    ];

    await Promise.all(
      keysToInvalidate.map((key) =>
        this.cacheManager
          .del(key)
          .catch((error) =>
            this.logger.error(
              `Failed to invalidate cache key ${key}: ${error.message}`,
            ),
          ),
      ),
    );

    return updated;
  }
}
```

## Testing

```typescript
describe('ProductService', () => {
  let service: ProductService;
  let cacheManager: Cache;
  let repository: MockType<Repository<Product>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    repository = module.get(getRepositoryToken(Product));
  });

  it('should return cached product if available', async () => {
    const cachedProduct = { id: 1, name: 'Test Product' };
    jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedProduct);

    const result = await service.findOne(1);
    expect(result).toEqual(cachedProduct);
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  it('should fetch from database if cache miss', async () => {
    const product = { id: 1, name: 'Test Product' };
    jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
    repository.findOne.mockResolvedValue(product);

    const result = await service.findOne(1);
    expect(result).toEqual(product);
    expect(cacheManager.set).toHaveBeenCalled();
  });
});
```

## Key Takeaways

1. Choose appropriate caching strategy based on:

   - Data access patterns
   - System architecture
   - Consistency requirements

2. Consider cache invalidation carefully:

   - When to invalidate
   - What keys to invalidate
   - Cascade invalidation

3. Handle cache failures gracefully:

   - Log errors
   - Provide fallbacks
   - Don't let cache failures break the application

4. Monitor cache performance:
   - Hit/miss ratios
   - Cache size
   - Invalidation patterns
