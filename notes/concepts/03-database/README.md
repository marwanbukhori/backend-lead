# Database Patterns in NestJS

## Overview

Database patterns are essential for building scalable and maintainable applications. NestJS with TypeORM provides robust support for implementing various database patterns and best practices.

## Key Concepts

### 1. Repository Pattern

```typescript
// user/user.repository.ts
@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOne({ where: { email } });
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.create(createUserDto);
    return this.save(user);
  }
}
```

### 2. Unit of Work Pattern

```typescript
@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly connection: Connection,
  ) {}

  async createOrderWithPayment(
    orderData: CreateOrderDto,
    paymentData: CreatePaymentDto,
  ): Promise<Order> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.save(Order, orderData);
      const payment = await queryRunner.manager.save(Payment, {
        ...paymentData,
        orderId: order.id,
      });

      await queryRunner.commitTransaction();
      return order;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Transaction failed');
    } finally {
      await queryRunner.release();
    }
  }
}
```

### 3. Database Transactions

```typescript
@Injectable()
export class TransferService {
  async transfer(
    fromAccountId: number,
    toAccountId: number,
    amount: number,
  ): Promise<void> {
    return this.connection.transaction(async (manager) => {
      const fromAccount = await manager.findOne(Account, fromAccountId, {
        lock: { mode: 'pessimistic_write' },
      });
      const toAccount = await manager.findOne(Account, toAccountId, {
        lock: { mode: 'pessimistic_write' },
      });

      if (fromAccount.balance < amount) {
        throw new BadRequestException('Insufficient funds');
      }

      fromAccount.balance -= amount;
      toAccount.balance += amount;

      await manager.save([fromAccount, toAccount]);
    });
  }
}
```

### 4. Optimistic Locking

```typescript
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  stock: number;

  @VersionColumn()
  version: number;
}

@Injectable()
export class ProductService {
  async updateStock(id: number, quantity: number): Promise<Product> {
    try {
      const product = await this.productRepository.findOne(id);
      product.stock += quantity;
      return await this.productRepository.save(product);
    } catch (error) {
      if (error.name === 'OptimisticLockError') {
        throw new ConflictException(
          'Product was updated by another transaction',
        );
      }
      throw error;
    }
  }
}
```

## Best Practices

### 1. Connection Pooling

```typescript
// app.module.ts
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      // Connection pool settings
      extra: {
        max: 25, // Maximum number of connections
        min: 5, // Minimum number of connections
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    }),
  ],
})
export class AppModule {}
```

### 2. Query Optimization

```typescript
@Injectable()
export class ProductService {
  // Bad: N+1 problem
  async getProductsWithCategories(): Promise<Product[]> {
    const products = await this.productRepository.find();
    // This will execute N additional queries
    for (const product of products) {
      product.categories = await this.categoryRepository.find({
        where: { productId: product.id },
      });
    }
    return products;
  }

  // Good: Using relations
  async getProductsWithCategories(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['categories'],
      join: {
        alias: 'product',
        leftJoinAndSelect: {
          categories: 'product.categories',
        },
      },
    });
  }

  // Better: Using QueryBuilder with specific selections
  async getProductsWithCategories(): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .select(['product.id', 'product.name', 'category.id', 'category.name'])
      .where('product.isActive = :isActive', { isActive: true })
      .cache(true) // Enable query caching
      .getMany();
  }
}
```

## Implementation Example

### Complex Database Operations

```typescript
@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly connection: Connection,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    return this.connection.transaction(async (manager) => {
      // Create order
      const order = manager.create(Order, {
        userId: createOrderDto.userId,
        status: OrderStatus.PENDING,
      });
      await manager.save(order);

      // Process order items
      const orderItems: OrderItem[] = [];
      for (const item of createOrderDto.items) {
        // Lock product for update
        const product = await manager.findOne(Product, item.productId, {
          lock: { mode: 'pessimistic_write' },
        });

        if (!product || product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product?.name}`,
          );
        }

        // Update product stock
        product.stock -= item.quantity;
        await manager.save(product);

        // Create order item
        const orderItem = manager.create(OrderItem, {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
        orderItems.push(orderItem);
      }

      // Save order items
      await manager.save(orderItems);

      // Calculate total
      order.total = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      await manager.save(order);

      return order;
    });
  }
}
```

## Testing

```typescript
describe('OrderService', () => {
  let service: OrderService;
  let connection: Connection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: Connection,
          useValue: {
            transaction: jest.fn(),
            createQueryRunner: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    connection = module.get<Connection>(Connection);
  });

  it('should create order with transaction', async () => {
    const createOrderDto = {
      userId: 1,
      items: [{ productId: 1, quantity: 2 }],
    };

    const mockTransaction = jest
      .fn()
      .mockImplementation((callback) => callback());
    jest.spyOn(connection, 'transaction').mockImplementation(mockTransaction);

    await service.createOrder(createOrderDto);
    expect(connection.transaction).toHaveBeenCalled();
  });
});
```

## Key Takeaways

1. Use appropriate patterns for data access:

   - Repository Pattern for data access abstraction
   - Unit of Work for transaction management
   - Optimistic/Pessimistic locking for concurrency

2. Optimize database operations:

   - Use connection pooling
   - Avoid N+1 queries
   - Implement proper indexing
   - Use query caching when appropriate

3. Handle transactions properly:

   - Use transaction boundaries correctly
   - Implement proper error handling
   - Consider isolation levels
   - Handle deadlocks gracefully

4. Consider scalability:
   - Implement proper connection pooling
   - Use read replicas when necessary
   - Implement caching strategies
   - Monitor query performance
