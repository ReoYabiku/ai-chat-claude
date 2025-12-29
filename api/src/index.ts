import { serve } from '@hono/node-server';
import app from './app';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';

// 環境変数の検証
function validateEnvironment() {
  const requiredEnvVars = ['DATABASE_URL', 'CLAUDE_API_KEY'];
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    logger.error(
      { missingVars: missing },
      'Missing required environment variables'
    );
    process.exit(1);
  }
}

// サーバー起動
async function startServer() {
  try {
    // 環境変数チェック
    validateEnvironment();

    // データベース接続確認
    await prisma.$connect();
    logger.info('Database connection established');

    // ポート設定
    const port = parseInt(process.env.PORT || '3001', 10);

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
            environment: process.env.NODE_ENV || 'development',
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
