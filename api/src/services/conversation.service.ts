import { v4 as uuidv4 } from 'uuid';
import { conversationRepository } from '../repositories/conversation.repository';
import { messageRepository } from '../repositories/message.repository';
import { Conversation, Message } from '@prisma/client';
import { logger } from '../lib/logger';

export interface ConversationWithMessages {
  conversation: Conversation;
  messages: Message[];
}

export class ConversationService {
  /**
   * 新しい会話を作成
   * @param sessionId - セッションID（オプション、未指定の場合は自動生成）
   * @returns 作成された会話
   */
  async create(sessionId?: string): Promise<Conversation> {
    const actualSessionId = sessionId || uuidv4();

    logger.info({ sessionId: actualSessionId }, 'Creating new conversation');

    return await conversationRepository.create(actualSessionId);
  }

  /**
   * IDで会話とメッセージを取得
   * @param conversationId - 会話ID
   * @returns 会話とメッセージ
   * @throws 会話が見つからない場合
   */
  async getById(conversationId: string): Promise<ConversationWithMessages> {
    const conversation = await conversationRepository.findById(conversationId);

    if (!conversation) {
      logger.warn({ conversationId }, 'Conversation not found');
      throw new Error('Conversation not found');
    }

    const messages = await messageRepository.findByConversationId(conversationId);

    logger.debug(
      { conversationId, messageCount: messages.length },
      'Conversation retrieved'
    );

    return {
      conversation,
      messages,
    };
  }

  /**
   * セッションIDで全会話を取得
   * @param sessionId - セッションID
   * @returns 会話のリスト
   */
  async getBySessionId(sessionId: string): Promise<Conversation[]> {
    logger.debug({ sessionId }, 'Fetching conversations by session ID');

    return await conversationRepository.findBySessionId(sessionId);
  }

  /**
   * 会話タイトルを更新
   * @param conversationId - 会話ID
   * @param title - 新しいタイトル
   * @returns 更新された会話
   */
  async updateTitle(conversationId: string, title: string): Promise<Conversation> {
    logger.info({ conversationId, title }, 'Updating conversation title');

    return await conversationRepository.updateTitle(conversationId, title);
  }

  /**
   * 会話を削除
   * @param conversationId - 会話ID
   */
  async delete(conversationId: string): Promise<void> {
    logger.info({ conversationId }, 'Deleting conversation');

    await conversationRepository.delete(conversationId);
  }

  /**
   * 会話が存在するか確認
   * @param conversationId - 会話ID
   * @returns 存在する場合true
   */
  async exists(conversationId: string): Promise<boolean> {
    const conversation = await conversationRepository.findById(conversationId);
    return conversation !== null;
  }
}

// シングルトンインスタンス
export const conversationService = new ConversationService();
