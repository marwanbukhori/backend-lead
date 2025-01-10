// import { Module, CacheModule as NestCacheModule } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import * as redisStore from 'cache-manager-redis-store';
// import { CacheService } from './cache.service';

// @Module({
//   imports: [
//     NestCacheModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: async (configService: ConfigService) => ({
//         store: redisStore,
//         host: configService.get('REDIS_HOST', 'localhost'),
//         port: configService.get('REDIS_PORT', 6379),
//         ttl: configService.get('REDIS_TTL', 3600), // 1 hour default
//         max: configService.get('REDIS_MAX_ITEMS', 100), // maximum number of items in cache
//       }),
//     }),
//   ],
//   providers: [CacheService],
//   exports: [CacheService],
// })
// export class CacheModule {}
