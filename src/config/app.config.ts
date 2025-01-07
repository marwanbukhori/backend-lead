import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api',
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    title: process.env.SWAGGER_TITLE || 'Senior Backend API',
    description:
      process.env.SWAGGER_DESCRIPTION || 'The Senior Backend API description',
    version: process.env.SWAGGER_VERSION || '1.0',
  },
  cors: {
    enabled: process.env.CORS_ENABLED === 'true',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
}));
