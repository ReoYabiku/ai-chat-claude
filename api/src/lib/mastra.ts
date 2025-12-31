import { Agent } from '@mastra/core/agent';
import { logger } from './logger';
import { AI_MODEL, AI_CONFIG } from './constants';
import { env } from '../utils/env-validation';

// メッセージの型定義
export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Claude 4.5 Sonnet エージェントの作成
export const chatAgent = new Agent({
  id: 'chat-agent',
  name: 'AI Chat Assistant',
  instructions: AI_CONFIG.DEFAULT_SYSTEM_PROMPT,
  model: AI_MODEL.PROVIDER_ID,
});

/**
 * チャット応答を生成する
 * @param messages - 会話履歴（role, contentを含むオブジェクトの配列）
 * @returns AI生成のレスポンステキスト
 */
export async function generateChatResponse(
  messages: ChatMessage[]
): Promise<string> {
  try {
    logger.debug({ messageCount: messages.length }, 'Generating chat response');

    // Mastraエージェントにメッセージオブジェクトの配列を渡す
    // 型アサーションでMastraの型システムをバイパス（実際のランタイムでは動作する）
    const response = await chatAgent.generate(messages as any);

    logger.debug(
      { responseLength: response.text?.length || 0 },
      'Chat response generated'
    );

    return response.text || '';
  } catch (error) {
    logger.error({ error }, 'Failed to generate chat response');
    throw new Error('Failed to generate AI response');
  }
}

/**
 * チャット応答をストリーミングで生成する
 * @param messages - 会話履歴（role, contentを含むオブジェクトの配列）
 * @returns AI生成のレスポンスストリーム（AsyncIterable）
 */
export async function* streamChatResponse(
  messages: ChatMessage[]
): AsyncIterable<string> {
  try {
    logger.debug({ messageCount: messages.length }, 'Starting chat response stream');

    // ストリーミングレスポンスを生成
    // 型アサーションでMastraの型システムをバイパス（実際のランタイムでは動作する）
    const stream = await chatAgent.stream(messages as any);

    let totalLength = 0;
    for await (const chunk of stream.textStream) {
      totalLength += chunk.length;
      yield chunk;
    }

    logger.debug(
      { totalLength },
      'Chat response stream completed'
    );
  } catch (error) {
    logger.error({ error }, 'Failed to stream chat response');
    throw new Error('Failed to generate AI response');
  }
}

/**
 * 会話タイトルを自動生成する
 * @param firstMessage - 最初のユーザーメッセージ
 * @returns 生成されたタイトル
 */
export async function generateConversationTitle(
  firstMessage: string
): Promise<string> {
  try {
    const titleAgent = new Agent({
      id: 'title-generator',
      name: 'Title Generator',
      instructions:
        'あなたは会話のタイトルを生成するアシスタントです。ユーザーの最初のメッセージから、短くて分かりやすいタイトル（10-30文字程度）を日本語で生成してください。タイトルのみを返してください。',
      model: AI_MODEL.PROVIDER_ID,
    });

    const response = await titleAgent.generate([
      {
        role: 'user',
        content: `次のメッセージから会話のタイトルを生成してください: "${firstMessage}"`,
      },
    ]);

    const title = response.text?.trim() || '新しい会話';
    logger.debug({ title }, 'Conversation title generated');

    return title;
  } catch (error) {
    logger.error({ error }, 'Failed to generate conversation title');
    return '新しい会話';
  }
}
