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
}

export const apiClient = new ApiClient();
