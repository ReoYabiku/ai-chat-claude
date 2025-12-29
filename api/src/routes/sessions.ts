import { Hono } from 'hono';
import { conversationService } from '../services/conversation.service';
import { asyncHandler } from '../middleware/error-handler';
import { logger } from '../lib/logger';

const app = new Hono();

/**
 * GET /api/sessions/:sessionId/conversations
 * セッションIDに紐づく全会話を取得
 */
app.get(
  '/:sessionId/conversations',
  asyncHandler(async (c) => {
    const sessionId = c.req.param('sessionId');

    logger.debug({ sessionId }, 'Fetching conversations by session ID via API');

    const conversations = await conversationService.getBySessionId(sessionId);

    return c.json({
      sessionId,
      conversations: conversations.map((conv) => ({
        id: conv.id,
        sessionId: conv.sessionId,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      })),
    });
  })
);

export default app;
