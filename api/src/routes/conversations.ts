import { Hono } from 'hono';
import { z } from 'zod';
import { conversationService } from '../services/conversation.service';
import { chatService } from '../services/chat.service';
import { asyncHandler } from '../middleware/error-handler';
import { logger } from '../lib/logger';

const app = new Hono();

// バリデーションスキーマ
const createConversationSchema = z.object({
  sessionId: z.string().uuid().optional(),
});

const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message content cannot be empty')
    .max(5000, 'Message content is too long'),
});

/**
 * POST /api/conversations
 * 新しい会話を作成
 */
app.post(
  '/',
  asyncHandler(async (c) => {
    const body = await c.req.json();
    const validated = createConversationSchema.parse(body);

    const conversation = await conversationService.create(validated.sessionId);

    logger.info(
      { conversationId: conversation.id, sessionId: conversation.sessionId },
      'New conversation created via API'
    );

    return c.json(
      {
        id: conversation.id,
        sessionId: conversation.sessionId,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
      201
    );
  })
);

/**
 * GET /api/conversations/:conversationId
 * 会話とメッセージを取得
 */
app.get(
  '/:conversationId',
  asyncHandler(async (c) => {
    const conversationId = c.req.param('conversationId');

    const { conversation, messages } = await conversationService.getById(
      conversationId
    );

    logger.debug(
      { conversationId, messageCount: messages.length },
      'Conversation retrieved via API'
    );

    return c.json({
      conversation: {
        id: conversation.id,
        sessionId: conversation.sessionId,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
      messages: messages.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        role: msg.role,
        content: msg.content,
        metadata: msg.metadata,
        createdAt: msg.createdAt,
      })),
    });
  })
);

/**
 * POST /api/conversations/:conversationId/messages
 * メッセージを送信してAI応答を取得
 */
app.post(
  '/:conversationId/messages',
  asyncHandler(async (c) => {
    const conversationId = c.req.param('conversationId');
    const body = await c.req.json();
    const validated = sendMessageSchema.parse(body);

    logger.info({ conversationId }, 'Sending message via API');

    const { userMessage, assistantMessage } = await chatService.sendMessage(
      conversationId,
      validated.content
    );

    return c.json({
      userMessage: {
        id: userMessage.id,
        conversationId: userMessage.conversationId,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      },
      assistantMessage: {
        id: assistantMessage.id,
        conversationId: assistantMessage.conversationId,
        role: assistantMessage.role,
        content: assistantMessage.content,
        metadata: assistantMessage.metadata,
        createdAt: assistantMessage.createdAt,
      },
    });
  })
);

/**
 * DELETE /api/conversations/:conversationId
 * 会話を削除
 */
app.delete(
  '/:conversationId',
  asyncHandler(async (c) => {
    const conversationId = c.req.param('conversationId');

    await conversationService.delete(conversationId);

    logger.info({ conversationId }, 'Conversation deleted via API');

    return c.json({ message: 'Conversation deleted successfully' });
  })
);

export default app;
