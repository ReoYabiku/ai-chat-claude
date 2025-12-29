import { prisma } from '../lib/prisma';
import { Conversation } from '@prisma/client';
import { logger } from '../lib/logger';

export class ConversationRepository {
  /**
   * 新しい会話を作成
   * @param sessionId - セッションID
   * @param title - 会話タイトル（オプション）
   * @returns 作成された会話
   */
  async create(sessionId: string, title?: string): Promise<Conversation> {
    try {
      const conversation = await prisma.conversation.create({
        data: {
          sessionId,
          title: title || null,
        },
      });

      logger.info(
        { conversationId: conversation.id, sessionId },
        'Conversation created'
      );

      return conversation;
    } catch (error) {
      logger.error({ error, sessionId }, 'Failed to create conversation');
      throw new Error('Failed to create conversation');
    }
  }

  /**
   * IDで会話を検索
   * @param id - 会話ID
   * @returns 会話（見つからない場合はnull）
   */
  async findById(id: string): Promise<Conversation | null> {
    try {
      return await prisma.conversation.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error({ error, conversationId: id }, 'Failed to find conversation by ID');
      throw new Error('Failed to find conversation');
    }
  }

  /**
   * セッションIDで会話を検索
   * @param sessionId - セッションID
   * @returns 会話のリスト
   */
  async findBySessionId(sessionId: string): Promise<Conversation[]> {
    try {
      return await prisma.conversation.findMany({
        where: { sessionId },
        orderBy: { updatedAt: 'desc' },
      });
    } catch (error) {
      logger.error({ error, sessionId }, 'Failed to find conversations by session ID');
      throw new Error('Failed to find conversations');
    }
  }

  /**
   * 会話タイトルを更新
   * @param id - 会話ID
   * @param title - 新しいタイトル
   * @returns 更新された会話
   */
  async updateTitle(id: string, title: string): Promise<Conversation> {
    try {
      const conversation = await prisma.conversation.update({
        where: { id },
        data: { title },
      });

      logger.info({ conversationId: id, title }, 'Conversation title updated');

      return conversation;
    } catch (error) {
      logger.error({ error, conversationId: id }, 'Failed to update conversation title');
      throw new Error('Failed to update conversation title');
    }
  }

  /**
   * 会話を削除
   * @param id - 会話ID
   */
  async delete(id: string): Promise<void> {
    try {
      await prisma.conversation.delete({
        where: { id },
      });

      logger.info({ conversationId: id }, 'Conversation deleted');
    } catch (error) {
      logger.error({ error, conversationId: id }, 'Failed to delete conversation');
      throw new Error('Failed to delete conversation');
    }
  }
}

// シングルトンインスタンス
export const conversationRepository = new ConversationRepository();
