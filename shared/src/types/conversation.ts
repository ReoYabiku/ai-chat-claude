/**
 * メッセージの役割を表すEnum
 */
export enum Role {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

/**
 * 個別のメッセージを表す型
 */
export interface Message {
  id: string;
  conversationId: string;
  role: Role;
  content: string;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    [key: string]: any;
  };
  createdAt: Date;
}

/**
 * 会話セッションを表す型
 */
export interface Conversation {
  id: string;
  sessionId: string;
  title?: string;
  messages?: Message[];
  createdAt: Date;
  updatedAt: Date;
}
