'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Message } from '@ai-chat-claude/shared';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import { ERROR_MESSAGES } from '@/lib/constants';

interface UseChatOptions {
  conversationId: string | null;
  onError?: (error: Error) => void;
}

interface UseChatReturn {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  clearError: () => void;
}

export function useChat({ conversationId, onError }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId) {
        setMessages([]);
        return;
      }

      // 会話IDが変更されたら、即座にメッセージをクリア
      setMessages([]);

      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.getConversation(conversationId);
        const messagesWithDates = response.messages.map((msg) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        }));

        setMessages(messagesWithDates);
        logger.info(`Loaded ${messagesWithDates.length} messages`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(ERROR_MESSAGES.GENERIC_ERROR);
        setError(error);
        logger.error('Failed to load conversation:', error);
        if (onError) onError(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, onError]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId) {
        const error = new Error('No active conversation');
        setError(error);
        if (onError) onError(error);
        throw error;
      }

      if (!content.trim()) {
        const error = new Error(ERROR_MESSAGES.INVALID_MESSAGE);
        setError(error);
        if (onError) onError(error);
        throw error;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.sendMessage(conversationId, content);

        const userMessage: Message = {
          ...response.userMessage,
          createdAt: new Date(response.userMessage.createdAt),
        };

        const assistantMessage: Message = {
          ...response.assistantMessage,
          createdAt: new Date(response.assistantMessage.createdAt),
        };

        setMessages((prev) => [...prev, userMessage, assistantMessage]);
        logger.info('Message sent successfully');
      } catch (err) {
        let error: Error;
        if (err instanceof ApiClientError) {
          error = new Error(err.message);
        } else if (err instanceof Error) {
          error = err;
        } else {
          error = new Error(ERROR_MESSAGES.GENERIC_ERROR);
        }

        setError(error);
        logger.error('Failed to send message:', error);
        if (onError) onError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, onError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { messages, sendMessage, isLoading, error, clearError };
}
