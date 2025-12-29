import { prisma } from '../lib/prisma';
import { Message, Role } from '@prisma/client';
import { logger } from '../lib/logger';

export interface CreateMessageData {
  conversationId: string;
  role: Role;
  content: string;
  metadata?: Record<string, any>;
}

export class MessageRepository {
  /**
   * 新しいメッセージを作成
   * @param data - メッセージデータ
   * @returns 作成されたメッセージ
   */
  async create(data: CreateMessageData): Promise<Message> {
    try {
      const message = await prisma.message.create({
        data: {
          conversationId: data.conversationId,
          role: data.role,
          content: data.content,
          metadata: data.metadata || null,
        },
      });

      logger.debug(
        {
          messageId: message.id,
          conversationId: data.conversationId,
          role: data.role,
        },
        'Message created'
      );

      return message;
    } catch (error) {
      logger.error(
        { error, conversationId: data.conversationId },
        'Failed to create message'
      );
      throw new Error('Failed to create message');
    }
  }

  /**
   * 会話IDでメッセージを検索
   * @param conversationId - 会話ID
   * @returns メッセージのリスト（作成日時の昇順）
   */
  async findByConversationId(conversationId: string): Promise<Message[]> {
    try {
      return await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      logger.error(
        { error, conversationId },
        'Failed to find messages by conversation ID'
      );
      throw new Error('Failed to find messages');
    }
  }

  /**
   * 会話のメッセージ数をカウント
   * @param conversationId - 会話ID
   * @returns メッセージ数
   */
  async count(conversationId: string): Promise<number> {
    try {
      return await prisma.message.count({
        where: { conversationId },
      });
    } catch (error) {
      logger.error(
        { error, conversationId },
        'Failed to count messages'
      );
      throw new Error('Failed to count messages');
    }
  }

  /**
   * IDでメッセージを検索
   * @param id - メッセージID
   * @returns メッセージ（見つからない場合はnull）
   */
  async findById(id: string): Promise<Message | null> {
    try {
      return await prisma.message.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error({ error, messageId: id }, 'Failed to find message by ID');
      throw new Error('Failed to find message');
    }
  }

  /**
   * メッセージを削除
   * @param id - メッセージID
   */
  async delete(id: string): Promise<void> {
    try {
      await prisma.message.delete({
        where: { id },
      });

      logger.info({ messageId: id }, 'Message deleted');
    } catch (error) {
      logger.error({ error, messageId: id }, 'Failed to delete message');
      throw new Error('Failed to delete message');
    }
  }
}

// シングルトンインスタンス
export const messageRepository = new MessageRepository();
