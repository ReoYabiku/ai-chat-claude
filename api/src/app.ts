import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import conversationsRoutes from './routes/conversations';
import sessionsRoutes from './routes/sessions';
import healthRoutes from './routes/health';
import { errorHandler } from './middleware/error-handler';
import { rateLimiter } from './middleware/rate-limit';
import { logger } from './lib/logger';
import { env } from './utils/env-validation';

// Honoアプリケーションの初期化
const app = new Hono();

// グローバルミドルウェア

// 1. CORS設定
const allowedOrigins =
  env.NODE_ENV === 'production'
    ? env.ALLOWED_ORIGINS
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(
  '/*',
  cors({
    origin: (origin) => {
      // オリジンなし（モバイルアプリやcurlなど）は許可
      if (!origin) return origin;

      // 許可リストにあれば許可
      if (allowedOrigins.includes(origin)) return origin;

      // 開発環境では拒否されたオリジンをログ出力
      if (env.NODE_ENV === 'development') {
        console.warn(`CORS: Rejected origin: ${origin}`);
      }

      return allowedOrigins[0] || '';
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
  })
);

// 2. リクエストロギング
app.use('/*', honoLogger());

// 3. JSONのプリティプリント（開発環境のみ）
if (env.NODE_ENV === 'development') {
  app.use('/*', prettyJSON());
}

// 4. レート制限（API エンドポイントのみ）
app.use('/api/*', rateLimiter());

// ルート登録
app.route('/api/conversations', conversationsRoutes);
app.route('/api/sessions', sessionsRoutes);
app.route('/api/health', healthRoutes);

// ルートエンドポイント
app.get('/', (c) => {
  return c.json({
    name: 'AI Chat Claude API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/health',
  });
});

// 404ハンドラー
app.notFound((c) => {
  logger.warn({ path: c.req.path }, 'Route not found');
  return c.json(
    {
      error: {
        code: 'NOT_FOUND',
        message: 'The requested endpoint was not found',
      },
    },
    404
  );
});

// エラーハンドリングミドルウェア
app.onError(errorHandler);

logger.info('Hono application initialized');

export default app;
