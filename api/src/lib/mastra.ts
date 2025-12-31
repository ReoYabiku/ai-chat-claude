import { Agent } from '@mastra/core/agent';
import { logger } from './logger';
import { AI_MODEL, AI_CONFIG } from './constants';

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
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    logger.debug({ messageCount: messages.length }, 'Generating chat response');

    // 最後のユーザーメッセージを取得
    const lastMessage = messages[messages.length - 1];

    // 会話履歴を文字列配列に変換（最後のメッセージ以外）
    const conversationHistory = messages.slice(0, -1).map(
      (msg) => `${msg.role}: ${msg.content}`
    );

    // コンテキストとして履歴を含めたプロンプトを作成
    const prompt =
      conversationHistory.length > 0
        ? [...conversationHistory, lastMessage.content]
        : [lastMessage.content];

    const response = await chatAgent.generate(prompt);

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
  messages: Array<{ role: string; content: string }>
): AsyncIterable<string> {
  try {
    logger.debug({ messageCount: messages.length }, 'Starting chat response stream');

    // 最後のユーザーメッセージを取得
    const lastMessage = messages[messages.length - 1];

    // 会話履歴を文字列配列に変換（最後のメッセージ以外）
    const conversationHistory = messages.slice(0, -1).map(
      (msg) => `${msg.role}: ${msg.content}`
    );

    // コンテキストとして履歴を含めたプロンプトを作成
    const prompt =
      conversationHistory.length > 0
        ? [...conversationHistory, lastMessage.content]
        : [lastMessage.content];

    // ストリーミングレスポンスを生成
    const stream = await chatAgent.stream(prompt);

    let totalLength = 0;
    for await (const chunk of stream) {
      if (chunk.text) {
        totalLength += chunk.text.length;
        yield chunk.text;
      }
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
      `次のメッセージから会話のタイトルを生成してください: "${firstMessage}"`,
    ]);

    const title = response.text?.trim() || '新しい会話';
    logger.debug({ title }, 'Conversation title generated');

    return title;
  } catch (error) {
    logger.error({ error }, 'Failed to generate conversation title');
    return '新しい会話';
  }
}
