import { Conversation, Message } from './conversation';

/**
 * 会話作成リクエスト
 */
export interface CreateConversationRequest {
  sessionId?: string;
}

/**
 * 会話作成レスポンス
 */
export interface CreateConversationResponse {
  id: string;
  sessionId: string;
  createdAt: string;
}

/**
 * メッセージ送信リクエスト
 */
export interface SendMessageRequest {
  content: string;
  role?: 'user' | 'USER';
}

/**
 * メッセージ送信レスポンス
 */
export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
}

/**
 * 会話取得レスポンス
 */
export interface GetConversationResponse {
  conversation: Conversation;
  messages: Message[];
}

/**
 * セッション会話一覧取得レスポンス
 */
export interface GetSessionConversationsResponse {
  conversations: Conversation[];
}

/**
 * ヘルスチェックレスポンス
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version?: string;
}

/**
 * ストリーミングチャンクの種類
 */
export enum StreamEventType {
  CONTENT = 'content',
  DONE = 'done',
  ERROR = 'error',
}

/**
 * ストリーミングチャンクレスポンス（Server-Sent Events）
 */
export interface StreamChunk {
  type: StreamEventType;
  content?: string;
  messageId?: string;
  error?: string;
}

/**
 * ストリーミング完了レスポンス
 */
export interface StreamDoneResponse {
  userMessage: Message;
  assistantMessage: Message;
}

/**
 * APIエラーレスポンス
 */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * エラーコード定数
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT: 'RATE_LIMIT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
