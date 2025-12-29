import { Context, Next } from 'hono';
import { logger } from '../lib/logger';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// 定期的にストアをクリーンアップ（メモリリーク防止）
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60000); // 1分ごとにクリーンアップ

/**
 * レート制限ミドルウェア
 * @param options - レート制限オプション
 */
export function rateLimiter(options?: {
  max?: number;
  windowMs?: number;
  keyGenerator?: (c: Context) => string;
}) {
  const max = options?.max || parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
  const windowMs =
    options?.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
  const keyGenerator =
    options?.keyGenerator ||
    ((c: Context) => {
      // デフォルトはIPアドレスベース
      return (
        c.req.header('x-forwarded-for') ||
        c.req.header('x-real-ip') ||
        'unknown'
      );
    });

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    // ストアの初期化または更新
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
    } else {
      store[key].count += 1;
    }

    const current = store[key];

    // レスポンスヘッダーを設定
    c.header('X-RateLimit-Limit', max.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, max - current.count).toString());
    c.header(
      'X-RateLimit-Reset',
      Math.ceil(current.resetTime / 1000).toString()
    );

    // レート制限超過チェック
    if (current.count > max) {
      logger.warn(
        { key, count: current.count, max },
        'Rate limit exceeded'
      );

      return c.json(
        {
          error: {
            code: 'RATE_LIMIT',
            message: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil((current.resetTime - now) / 1000),
          },
        },
        429
      );
    }

    await next();
  };
}

/**
 * ストアの統計情報を取得（デバッグ用）
 */
export function getRateLimitStats() {
  return {
    totalKeys: Object.keys(store).length,
    store: { ...store },
  };
}

/**
 * ストアをクリア（テスト用）
 */
export function clearRateLimitStore() {
  Object.keys(store).forEach((key) => delete store[key]);
}
