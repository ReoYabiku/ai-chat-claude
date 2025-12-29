import { Agent } from '@mastra/core/agent';
import { logger } from './logger';

if (!process.env.CLAUDE_API_KEY) {
  throw new Error('CLAUDE_API_KEY environment variable is required');
}

// Claude 3.5 Sonnet エージェントの作成
export const chatAgent = new Agent({
  id: 'chat-agent',
  name: 'AI Chat Assistant',
  instructions: `あなたは親切で役立つ日本語アシスタントです。
ユーザーの質問や要求に対して、自然で分かりやすい回答を心がけてください。
必要に応じて英語でも対応できます。
丁寧で親しみやすいトーンで会話してください。`,
  model: 'anthropic/claude-3-5-sonnet-20241022',
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

    const response = await chatAgent.generate(
      messages.map((msg) => ({
        role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
        content: msg.content,
      }))
    );

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
      model: 'anthropic/claude-3-5-sonnet-20241022',
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
