import { registerAs } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { CacheModuleOptions } from '@nestjs/cache-manager';
import type { RedisClientOptions } from 'redis';

export default registerAs('cache', (): CacheModuleOptions => ({
  store: 'redis',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  ttl: parseInt(process.env.CACHE_TTL, 10) || 60 * 60, // 1 hour
  max: parseInt(process.env.CACHE_MAX_ITEMS, 10) || 100,
  isGlobal: true,
}));
