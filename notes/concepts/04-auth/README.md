# Authentication & Authorization in NestJS

## Overview

Authentication and authorization are crucial security aspects of any backend application. NestJS provides robust support for various authentication strategies and role-based access control.

## Key Concepts

### 1. JWT Authentication

```typescript
// auth/auth.module.ts
@Module({
  imports: [
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}

// auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      roles: payload.roles,
    };
  }
}
```

### 2. Role-based Access Control (RBAC)

```typescript
// decorators/roles.decorator.ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// Usage in controller
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  @Get('admin-data')
  @Roles(Role.ADMIN)
  getAdminData() {
    return 'Admin data';
  }
}
```

### 3. OAuth2 Integration

```typescript
// auth/google.strategy.ts
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { emails, name } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
    };
    return this.authService.findOrCreateUser(user);
  }
}
```

### 4. Session Management

```typescript
// main.ts
const app = await NestFactory.create(AppModule);
app.use(
  session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60000,
      secure: process.env.NODE_ENV === 'production',
    },
  }),
);

// auth/session.serializer.ts
@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: any, done: (err: Error, user: any) => void): any {
    done(null, user);
  }

  deserializeUser(
    payload: any,
    done: (err: Error, payload: string) => void,
  ): any {
    done(null, payload);
  }
}
```

## Best Practices

### 1. Password Hashing

```typescript
// auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
```

### 2. Token Management

```typescript
@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async createAccessToken(user: User): Promise<string> {
    const payload = { username: user.username, sub: user.id };
    return this.jwtService.sign(payload);
  }

  async createRefreshToken(user: User): Promise<string> {
    const refreshToken = this.refreshTokenRepo.create({
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await this.refreshTokenRepo.save(refreshToken);
    return refreshToken.token;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepo.delete({ token });
  }
}
```

## Implementation Example

### Complete Authentication Flow

```typescript
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenService: TokenService,
    private readonly logger: Logger,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      const user = await this.validateUser(
        loginDto.username,
        loginDto.password,
      );
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const [accessToken, refreshToken] = await Promise.all([
        this.tokenService.createAccessToken(user),
        this.tokenService.createRefreshToken(user),
      ]);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          roles: user.roles,
        },
      };
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`);
      throw error;
    }
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    const refreshToken = await this.tokenService.validateRefreshToken(token);
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(refreshToken.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Revoke old refresh token and create new ones
    await this.tokenService.revokeRefreshToken(token);
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.tokenService.createAccessToken(user),
      this.tokenService.createRefreshToken(user),
    ]);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        username: user.username,
        roles: user.roles,
      },
    };
  }

  async logout(token: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(token);
  }
}
```

## Testing

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let tokenService: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            createAccessToken: jest.fn(),
            createRefreshToken: jest.fn(),
            validateRefreshToken: jest.fn(),
            revokeRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    tokenService = module.get<TokenService>(TokenService);
  });

  describe('login', () => {
    it('should return tokens when credentials are valid', async () => {
      const user = {
        id: 1,
        username: 'test',
        password: await bcrypt.hash('password', 10),
      };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(tokenService, 'createAccessToken')
        .mockResolvedValue('access-token');
      jest
        .spyOn(tokenService, 'createRefreshToken')
        .mockResolvedValue('refresh-token');

      const result = await service.login({
        username: 'test',
        password: 'password',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });
  });
});
```

## Key Takeaways

1. Security is paramount:

   - Always hash passwords
   - Use secure session configuration
   - Implement proper token management
   - Regular security audits

2. Authentication strategy selection:

   - JWT for stateless authentication
   - Sessions for traditional web apps
   - OAuth for third-party integration
   - Consider your specific use case

3. Authorization implementation:

   - Use role-based access control
   - Implement proper guards
   - Fine-grained permissions
   - Audit trails

4. Best practices:
   - Secure password storage
   - Token refresh mechanism
   - Rate limiting
   - Error handling
   - Logging and monitoring
