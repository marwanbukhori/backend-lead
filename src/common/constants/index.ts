export const VALIDATION_PIPE_OPTIONS = {
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
};

export const SWAGGER_CONFIG = {
  title: 'Senior Backend API',
  description: 'NestJS Senior Backend Demo API',
  version: '1.0',
};

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
