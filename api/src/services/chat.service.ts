import { messageRepository } from '../repositories/message.repository';
import { conversationRepository } from '../repositories/conversation.repository';
import { generateChatResponse, streamChatResponse, generateConversationTitle, ChatMessage } from '../lib/mastra';
import { Message, Role } from '@prisma/client';
import { logger } from '../lib/logger';
import { AI_MODEL } from '../lib/constants';

/**
 * Prisma Role を Mastra ChatMessage role に変換
 */
function roleToMastraRole(role: Role): 'user' | 'assistant' | 'system' {
  switch (role) {
    case Role.USER:
      return 'user';
    case Role.ASSISTANT:
      return 'assistant';
    case Role.SYSTEM:
      return 'system';
    default:
      return 'user';
  }
}

export interface SendMessageResult {
  userMessage: Message;
  assistantMessage: Message;
}

export class ChatService {
  /**
   * ユーザーメッセージを送信し、AI応答を生成
   * @param conversationId - 会話ID
   * @param userContent - ユーザーメッセージ内容
   * @returns ユーザーメッセージとAI応答
   */
  async sendMessage(
    conversationId: string,
    userContent: string
  ): Promise<SendMessageResult> {
    logger.info({ conversationId }, 'Processing user message');

    // 会話が存在するか確認
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) {
      logger.error({ conversationId }, 'Conversation not found');
      throw new Error('Conversation not found');
    }

    // ユーザーメッセージを保存
    const userMessage = await messageRepository.create({
      conversationId,
      role: Role.USER,
      content: userContent,
    });

    logger.debug(
      { conversationId, messageId: userMessage.id },
      'User message saved'
    );

    // 会話履歴を取得
    const messageHistory = await messageRepository.findByConversationId(
      conversationId
    );

    // Mastraで応答を生成
    const conversationMessages: ChatMessage[] = messageHistory.map((msg) => ({
      role: roleToMastraRole(msg.role),
      content: msg.content,
    }));

    logger.debug(
      { conversationId, historyLength: conversationMessages.length },
      'Generating AI response'
    );

    const aiResponseContent = await generateChatResponse(conversationMessages);

    // AI応答を保存
    const assistantMessage = await messageRepository.create({
      conversationId,
      role: Role.ASSISTANT,
      content: aiResponseContent,
      metadata: {
        model: AI_MODEL.VERSION,
        timestamp: new Date().toISOString(),
      },
    });

    logger.info(
      { conversationId, assistantMessageId: assistantMessage.id },
      'AI response generated and saved'
    );

    // 最初のメッセージの場合、タイトルを自動生成
    const messageCount = await messageRepository.count(conversationId);
    if (messageCount === 2 && !conversation.title) {
      try {
        const title = await generateConversationTitle(userContent);
        await conversationRepository.updateTitle(conversationId, title);
        logger.info({ conversationId, title }, 'Conversation title auto-generated');
      } catch (error) {
        logger.warn(
          { error, conversationId },
          'Failed to auto-generate title, continuing anyway'
        );
      }
    }

    return {
      userMessage,
      assistantMessage,
    };
  }

  /**
   * 会話履歴を取得
   * @param conversationId - 会話ID
   * @returns メッセージのリスト
   */
  async getMessageHistory(conversationId: string): Promise<Message[]> {
    logger.debug({ conversationId }, 'Fetching message history');

    return await messageRepository.findByConversationId(conversationId);
  }

  /**
   * 特定のメッセージを取得
   * @param messageId - メッセージID
   * @returns メッセージ
   */
  async getMessage(messageId: string): Promise<Message | null> {
    return await messageRepository.findById(messageId);
  }

  /**
   * ユーザーメッセージを送信し、AI応答をストリーミングで生成
   * @param conversationId - 会話ID
   * @param userContent - ユーザーメッセージ内容
   * @yields AI応答のストリーミングチャンク
   */
  async *sendMessageStream(
    conversationId: string,
    userContent: string
  ): AsyncIterable<{ type: 'userMessage' | 'chunk' | 'done'; data: any }> {
    logger.info({ conversationId }, 'Processing user message with streaming');

    // 会話が存在するか確認
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) {
      logger.error({ conversationId }, 'Conversation not found');
      throw new Error('Conversation not found');
    }

    // ユーザーメッセージを保存
    const userMessage = await messageRepository.create({
      conversationId,
      role: Role.USER,
      content: userContent,
    });

    logger.debug(
      { conversationId, messageId: userMessage.id },
      'User message saved'
    );

    // ユーザーメッセージを送信
    yield { type: 'userMessage', data: userMessage };

    // 会話履歴を取得
    const messageHistory = await messageRepository.findByConversationId(
      conversationId
    );

    // Mastraで応答を生成
    const conversationMessages: ChatMessage[] = messageHistory.map((msg) => ({
      role: roleToMastraRole(msg.role),
      content: msg.content,
    }));

    logger.debug(
      { conversationId, historyLength: conversationMessages.length },
      'Generating streaming AI response'
    );

    // ストリーミング応答を受信して送信
    let fullResponse = '';
    try {
      for await (const chunk of streamChatResponse(conversationMessages)) {
        fullResponse += chunk;
        yield { type: 'chunk', data: chunk };
      }
    } catch (error) {
      logger.error({ error, conversationId }, 'Streaming failed');
      throw error;
    }

    // AI応答を保存
    const assistantMessage = await messageRepository.create({
      conversationId,
      role: Role.ASSISTANT,
      content: fullResponse,
      metadata: {
        model: AI_MODEL.VERSION,
        timestamp: new Date().toISOString(),
      },
    });

    logger.info(
      { conversationId, assistantMessageId: assistantMessage.id },
      'AI response generated and saved via streaming'
    );

    // 最初のメッセージの場合、タイトルを自動生成
    const messageCount = await messageRepository.count(conversationId);
    if (messageCount === 2 && !conversation.title) {
      try {
        const title = await generateConversationTitle(userContent);
        await conversationRepository.updateTitle(conversationId, title);
        logger.info({ conversationId, title }, 'Conversation title auto-generated');
      } catch (error) {
        logger.warn(
          { error, conversationId },
          'Failed to auto-generate title, continuing anyway'
        );
      }
    }

    // 完了メッセージを送信
    yield {
      type: 'done',
      data: {
        userMessage,
        assistantMessage,
      },
    };
  }
}

// シングルトンインスタンス
export const chatService = new ChatService();
