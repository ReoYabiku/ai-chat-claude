import { serve } from '@hono/node-server';
import app from './app';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import { env } from './utils/env-validation';

// サーバー起動
async function startServer() {
  try {
    // データベース接続確認
    await prisma.$connect();
    logger.info('Database connection established');

    // ポート設定（環境変数は起動時にバリデーション済み）
    const port = env.PORT;

    // サーバー起動
    serve(
      {
        fetch: app.fetch,
        port,
      },
      (info) => {
        logger.info(
          {
            port: info.port,
            environment: env.NODE_ENV,
          },
          `Server is running on http://localhost:${info.port}`
        );
      }
    );
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// グレースフルシャットダウン
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// 未処理のエラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
  logger.error(
    { reason, promise },
    'Unhandled Rejection at Promise'
  );
});

process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught Exception');
  process.exit(1);
});

// サーバー起動
startServer();
