import type { MiddlewareHandler } from 'hono';
import { env } from '../utils/env-validation';
import Redis from 'ioredis';

// Redis client (only create if URL provided)
let redis: Redis | null = null;

if (env.REDIS_URL) {
  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });

  redis.on('connect', () => {
    console.log('✓ Redis connected for rate limiting');
  });
}

// Redis-based store for production
class RedisStore {
  private redis: Redis;
  private windowMs: number;

  constructor(redis: Redis, windowMs: number) {
    this.redis = redis;
    this.windowMs = windowMs;
  }

  async increment(key: string): Promise<{ count: number; resetTime: Date }> {
    const redisKey = `rate-limit:${key}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Use Redis sorted set for sliding window
    const multi = this.redis.multi();

    // Remove old entries
    multi.zremrangebyscore(redisKey, 0, windowStart);

    // Add current request
    multi.zadd(redisKey, now, `${now}`);

    // Count requests in window
    multi.zcard(redisKey);

    // Set expiry
    multi.expire(redisKey, Math.ceil(this.windowMs / 1000));

    const results = await multi.exec();
    const count = (results?.[2]?.[1] as number) || 0;

    return {
      count,
      resetTime: new Date(now + this.windowMs),
    };
  }
}

// In-memory store for development
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>();
  private windowMs: number;

  constructor(windowMs: number) {
    this.windowMs = windowMs;
  }

  async increment(key: string): Promise<{ count: number; resetTime: Date }> {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      const resetTime = now + this.windowMs;
      this.store.set(key, { count: 1, resetTime });
      return { count: 1, resetTime: new Date(resetTime) };
    }

    record.count++;
    return { count: record.count, resetTime: new Date(record.resetTime) };
  }
}

export function rateLimiter(): MiddlewareHandler {
  const store = redis
    ? new RedisStore(redis, env.RATE_LIMIT_WINDOW_MS)
    : new MemoryStore(env.RATE_LIMIT_WINDOW_MS);

  if (!redis && env.NODE_ENV === 'production') {
    console.warn('⚠️  WARNING: Using in-memory rate limiter in production!');
    console.warn('   Set REDIS_URL for distributed rate limiting.');
  }

  return async (c, next) => {
    const key =
      c.req.header('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const result = await store.increment(key);

    c.header('X-RateLimit-Limit', env.RATE_LIMIT_MAX.toString());
    c.header(
      'X-RateLimit-Remaining',
      Math.max(0, env.RATE_LIMIT_MAX - result.count).toString()
    );
    c.header('X-RateLimit-Reset', result.resetTime.toISOString());

    if (result.count > env.RATE_LIMIT_MAX) {
      return c.json(
        {
          error: 'Too many requests',
          retryAfter: result.resetTime.toISOString(),
        },
        429
      );
    }

    await next();
  };
}

// Export for cleanup in tests
export function closeRedis(): void {
  if (redis) {
    redis.disconnect();
  }
}
