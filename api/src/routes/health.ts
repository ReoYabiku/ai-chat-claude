import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

const app = new Hono();

/**
 * GET /api/health
 * ヘルスチェックエンドポイント
 */
app.get('/', async (c) => {
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  // データベース接続チェック
  try {
    await prisma.$connect();
    logger.debug('Health check: Database connection OK');
  } catch (error) {
    logger.error({ error }, 'Health check: Database connection failed');
    return c.json(
      {
        ...status,
        status: 'error',
        error: 'Database connection failed',
      },
      503
    );
  }

  return c.json(status);
});

/**
 * GET /api/health/ready
 * Readinessプローブ（Kubernetes用）
 */
app.get('/ready', async (c) => {
  try {
    await prisma.$connect();
    return c.json({ ready: true });
  } catch (error) {
    logger.error({ error }, 'Readiness check failed');
    return c.json({ ready: false }, 503);
  }
});

/**
 * GET /api/health/live
 * Livenessプローブ（Kubernetes用）
 */
app.get('/live', (c) => {
  return c.json({ alive: true });
});

export default app;
