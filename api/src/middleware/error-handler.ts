import { Context } from 'hono';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * エラーハンドリングミドルウェア
 * すべてのエラーをキャッチして適切なレスポンスを返す
 */
export function errorHandler(err: Error, c: Context) {
  logger.error({ error: err }, 'Error occurred');

  // Zodバリデーションエラー
  if (err instanceof ZodError) {
    const error: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    };

    return c.json({ error }, 400);
  }

  // カスタムエラー処理
  if (err.message === 'Conversation not found') {
    const error: ApiError = {
      code: 'NOT_FOUND',
      message: 'The requested conversation was not found',
    };

    return c.json({ error }, 404);
  }

  if (err.message === 'Message not found') {
    const error: ApiError = {
      code: 'NOT_FOUND',
      message: 'The requested message was not found',
    };

    return c.json({ error }, 404);
  }

  // AI APIエラー
  if (err.message.includes('AI') || err.message.includes('generate')) {
    const error: ApiError = {
      code: 'AI_SERVICE_ERROR',
      message: 'Failed to generate AI response. Please try again.',
    };

    return c.json({ error }, 502);
  }

  // データベースエラー
  if (
    err.message.includes('Prisma') ||
    err.message.includes('database') ||
    err.message.includes('MongoDB')
  ) {
    const error: ApiError = {
      code: 'DATABASE_ERROR',
      message: 'Database operation failed',
    };

    return c.json({ error }, 500);
  }

  // デフォルトの内部サーバーエラー
  const error: ApiError = {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  };

  return c.json({ error }, 500);
}

/**
 * 非同期エラーをキャッチするラッパー関数
 */
export function asyncHandler(
  fn: (c: Context) => Promise<Response>
): (c: Context) => Promise<Response> {
  return async (c: Context) => {
    try {
      return await fn(c);
    } catch (error) {
      return errorHandler(error as Error, c);
    }
  };
}
