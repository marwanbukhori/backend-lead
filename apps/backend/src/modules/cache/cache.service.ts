// import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
// import { Cache } from 'cache-manager';

// @Injectable()
// export class CacheService {
//   constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

//   async get<T>(key: string): Promise<T | undefined> {
//     return await this.cacheManager.get<T>(key);
//   }

//   async set(key: string, value: any, ttl?: number): Promise<void> {
//     await this.cacheManager.set(key, value, { ttl });
//   }

//   async del(key: string): Promise<void> {
//     await this.cacheManager.del(key);
//   }

//   async reset(): Promise<void> {
//     await this.cacheManager.reset();
//   }

//   // Document caching
//   async getDocument(path: string) {
//     return await this.get<any>(`doc:${path}`);
//   }

//   async setDocument(path: string, document: any) {
//     await this.set(`doc:${path}`, document, 3600); // Cache for 1 hour
//   }

//   // Search results caching
//   async getSearchResults(query: string) {
//     return await this.get<any[]>(`search:${query}`);
//   }

//   async setSearchResults(query: string, results: any[]) {
//     await this.set(`search:${query}`, results, 1800); // Cache for 30 minutes
//   }

//   // User session caching
//   async getUserSession(userId: string) {
//     return await this.get<any>(`session:${userId}`);
//   }

//   async setUserSession(userId: string, session: any) {
//     await this.set(`session:${userId}`, session, 86400); // Cache for 24 hours
//   }

//   // Rate limiting
//   async incrementRequestCount(key: string): Promise<number> {
//     const count = await this.get<number>(`ratelimit:${key}`) || 0;
//     await this.set(`ratelimit:${key}`, count + 1, 60); // Reset after 1 minute
//     return count + 1;
//   }
// }
