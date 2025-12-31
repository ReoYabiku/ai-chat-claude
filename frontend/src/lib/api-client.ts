import {
  type CreateConversationRequest,
  type CreateConversationResponse,
  type SendMessageRequest,
  type SendMessageResponse,
  type GetConversationResponse,
  type GetSessionConversationsResponse,
  type HealthCheckResponse,
  type ApiError,
  ErrorCodes,
  StreamEventType,
  type StreamEvent,
} from '@ai-chat-claude/shared';
import { API_URL, API_ENDPOINTS } from './constants';

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorData: ApiError | null = null;

        try {
          errorData = await response.json();
        } catch {
          throw new ApiClientError(
            ErrorCodes.INTERNAL_ERROR,
            `HTTP ${response.status}: ${response.statusText}`
          );
        }

        if (errorData?.error) {
          throw new ApiClientError(
            errorData.error.code,
            errorData.error.message,
            errorData.error.details
          );
        }
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      throw new ApiClientError(
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  async createConversation(data: CreateConversationRequest = {}): Promise<CreateConversationResponse> {
    return this.request<CreateConversationResponse>(API_ENDPOINTS.CONVERSATIONS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversation(conversationId: string): Promise<GetConversationResponse> {
    return this.request<GetConversationResponse>(
      API_ENDPOINTS.CONVERSATION(conversationId),
      { method: 'GET' }
    );
  }

  async sendMessage(conversationId: string, content: string): Promise<SendMessageResponse> {
    const data: SendMessageRequest = { content };
    return this.request<SendMessageResponse>(
      API_ENDPOINTS.MESSAGES(conversationId),
      { method: 'POST', body: JSON.stringify(data) }
    );
  }

  async getSessionConversations(sessionId: string): Promise<GetSessionConversationsResponse> {
    return this.request<GetSessionConversationsResponse>(
      API_ENDPOINTS.SESSION_CONVERSATIONS(sessionId),
      { method: 'GET' }
    );
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.request(API_ENDPOINTS.CONVERSATION(conversationId), {
      method: 'DELETE',
    });
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>(API_ENDPOINTS.HEALTH, {
      method: 'GET',
    });
  }

  /**
   * メッセージをストリーミングで送信
   * @param conversationId - 会話ID
   * @param content - メッセージ内容
   * @param callbacks - コールバック関数とオプション
   * @returns クリーンアップ関数
   */
  async sendMessageStream(
    conversationId: string,
    content: string,
    callbacks: {
      onChunk: (chunk: string) => void;
      onUserMessage: (message: any) => void;
      onDone: (data: { userMessage: any; assistantMessage: any }) => void;
      onError?: (error: Error) => void;
      signal?: AbortSignal;
    }
  ): Promise<void> {
    const url = `${this.baseUrl}/api/conversations/${conversationId}/messages/stream`;
    const data: SendMessageRequest = { content };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: callbacks.signal,
      });

      if (!response.ok) {
        throw new ApiClientError(
          ErrorCodes.INTERNAL_ERROR,
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new ApiClientError(
          ErrorCodes.INTERNAL_ERROR,
          'Response body is not readable'
        );
      }

      let buffer = '';

      while (true) {
        // AbortSignalをチェック
        if (callbacks.signal?.aborted) {
          reader.cancel();
          break;
        }

        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // 最後の不完全な行を保持
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              continue;
            }

            try {
              const event: StreamEvent = JSON.parse(data);

              switch (event.type) {
                case StreamEventType.USER_MESSAGE:
                  callbacks.onUserMessage(event.data);
                  break;
                case StreamEventType.CHUNK:
                  callbacks.onChunk(event.data);
                  break;
                case StreamEventType.DONE:
                  callbacks.onDone(event.data);
                  break;
                case StreamEventType.ERROR:
                  if (callbacks.onError) {
                    callbacks.onError(new Error(event.data));
                  }
                  break;
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      if (callbacks.onError) {
        if (error instanceof ApiClientError) {
          callbacks.onError(error);
        } else {
          callbacks.onError(
            new ApiClientError(
              ErrorCodes.INTERNAL_ERROR,
              error instanceof Error ? error.message : 'Unknown error occurred'
            )
          );
        }
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
