# Caching Strategies

## Overview

This section covers caching implementation and strategies in our learning platform, focusing on practical implementations using NestJS.

## Redis Implementation

### Basic Configuration

```typescript
// app.module.ts
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: "localhost",
      port: 6379,
    }),
  ],
})
export class AppModule {}
```

### Cache Decorators

```typescript
@Injectable()
export class UserService {
  @CacheKey("all_users")
  @CacheTTL(30)
  @UseInterceptors(CacheInterceptor)
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
```

## Cache Patterns

### Cache-Aside Pattern

```typescript
@Injectable()
export class ProductService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly productRepository: ProductRepository
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

### Write-Through

```typescript
@Injectable()
export class ProductService {
  async update(id: number, data: UpdateProductDto): Promise<Product> {
    // Update in database
    const updated = await this.productRepository.update(id, data);

    // Update cache
    await this.cacheManager.set(`product_${id}`, updated, { ttl: 300 });

    return updated;
  }
}
```

### Write-Behind

```typescript
@Injectable()
export class ProductService {
  @InjectQueue("cache-updates") private cacheQueue: Queue;

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    // Update cache immediately
    await this.cacheManager.set(`product_${id}`, data);

    // Queue database update
    await this.cacheQueue.add("update-product", {
      id,
      data,
    });

    return data;
  }
}
```

## Cache Invalidation

### Time-based Expiration

```typescript
@Injectable()
export class CacheService {
  async setCacheWithTTL<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.cacheManager.set(key, value, { ttl });
  }
}
```

### Event-based Invalidation

```typescript
@Injectable()
export class ProductService {
  @OnEvent("product.updated")
  async handleProductUpdate(payload: ProductUpdatedEvent) {
    await this.cacheManager.del(`product_${payload.id}`);
  }
}
```

## Error Handling & Resilience

```typescript
@Injectable()
export class CacheService {
  async getCacheValue<T>(
    key: string,
    fallbackFn: () => Promise<T>
  ): Promise<T> {
    try {
      const cached = await this.cacheManager.get<T>(key);
      if (cached) return cached;
    } catch (error) {
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

## Testing Cache Implementation

```typescript
describe("ProductService", () => {
  let service: ProductService;
  let cacheManager: Cache;

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
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it("should return cached value when available", async () => {
    const mockProduct = { id: 1, name: "Test Product" };
    jest.spyOn(cacheManager, "get").mockResolvedValue(mockProduct);

    const result = await service.findOne(1);
    expect(result).toEqual(mockProduct);
  });
});
```

## Best Practices

- Cache key design: Use consistent naming conventions
- TTL strategies: Align with data volatility
- Memory management: Monitor cache size and eviction
- Monitoring: Track cache hit/miss rates
- Error handling: Implement graceful fallbacks
- Testing: Include cache scenarios in tests
