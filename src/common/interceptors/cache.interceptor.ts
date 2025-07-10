import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
// import { CacheTTL } from '@nestjs/cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  private readonly cache = new Map<string, { data: any; expiresAt: number }>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cacheKey = this.generateCacheKey(request);
    const cachedResponse = this.getFromCache(cacheKey);

    if (cachedResponse) {
      return of(cachedResponse);
    }

    return next.handle().pipe(
      tap(response => {
        const ttl = this.getTTL(context) || 60000; // Default 1 minute
        this.addToCache(cacheKey, response, ttl);
      }),
    );
  }

  private generateCacheKey(request: any): string {
    const { url, query } = request;
    return `${url}?${JSON.stringify(query)}`;
  }

  private getTTL(context: ExecutionContext): number | undefined {
    const handler = context.getHandler();
    // const ttl = Reflect.getMetadata(CacheTTL.KEY, handler);
    // return ttl;
    return undefined;
  }

  private getFromCache(key: string): any | undefined {
    const item = this.cache.get(key);

    if (!item) {
      return undefined;
    }

    if (item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return item.data;
  }

  private addToCache(key: string, data: any, ttl: number): void {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { data, expiresAt });
  }
}
