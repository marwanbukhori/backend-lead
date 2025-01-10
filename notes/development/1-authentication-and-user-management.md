# Authentication and User Management

## Overview

The authentication system is implemented using JWT tokens with a full-stack approach:

- Backend: NestJS with Passport and JWT
- Frontend: Vue.js with Pinia for state management

## Backend Implementation (apps/backend)

### 1. Authentication Module

```typescript
// apps/backend/src/modules/auth/auth.module.ts
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: { expiresIn: "1h" },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
```

### 2. JWT Strategy

```typescript
// apps/backend/src/modules/auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get("JWT_SECRET"),
    });
  }

  async validate(payload: any) {
    return this.usersService.findById(payload.sub);
  }
}
```

## Frontend Implementation (apps/frontend)

### 1. Auth Store

```typescript
// apps/frontend/src/stores/auth.ts
export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    loading: false,
  }),

  actions: {
    async login(credentials) {
      this.loading = true;
      try {
        const response = await authApi.login(credentials);
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem("token", this.token);
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
    },
  },
});
```

### 2. API Integration

```typescript
// apps/frontend/src/api/auth.ts
import apiClient from "./axios";

export const authApi = {
  login: (credentials) => apiClient.post("/auth/login", credentials),

  register: (userData) => apiClient.post("/auth/register", userData),
};
```

## Authentication Flow

1. User submits login credentials
2. Backend validates and returns JWT
3. Frontend stores token in localStorage
4. Token is included in subsequent API requests
5. Backend validates token on protected routes

## Protected Routes

### Backend

```typescript
// apps/backend/src/modules/content/content.controller.ts
@Controller("content")
@UseGuards(JwtAuthGuard)
export class ContentController {
  // Protected routes
}
```

### Frontend

```typescript
// apps/frontend/src/router/index.ts
const routes = [
  {
    path: "/content",
    component: () => import("../views/ContentView.vue"),
    meta: { requiresAuth: true },
  },
];

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else {
    next();
  }
});
```

## Security Considerations

1. Token Storage

   - Use secure HttpOnly cookies for production
   - Implement token refresh mechanism
   - Clear tokens on logout

2. Password Security

   - Hash passwords with bcrypt
   - Implement password strength validation
   - Add rate limiting for login attempts

3. CORS Configuration
   - Configure allowed origins
   - Handle credentials properly
   - Set appropriate headers
