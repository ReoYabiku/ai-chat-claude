'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // コンポーネントアンマウント時にストリーミングをキャンセル
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        logger.info('Streaming aborted due to component unmount');
      }
    };
  }, []);

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

      // ストリーミング用の一時的なアシスタントメッセージ
      let streamingMessageId: string | null = null;
      let streamingContent = '';
      let isStreamComplete = false;

      // AbortControllerを作成してrefに保存
      abortControllerRef.current = new AbortController();

      try {
        setIsLoading(true);
        setError(null);

        // 一時メッセージIDを生成（タイムスタンプとランダム値で一意性を確保）
        const tempId = `streaming-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        await apiClient.sendMessageStream(conversationId, content, {
          signal: abortControllerRef.current.signal,
          onUserMessage: (userMessageData) => {
            const userMessage: Message = {
              ...userMessageData,
              createdAt: new Date(userMessageData.createdAt),
            };
            setMessages((prev) => [...prev, userMessage]);
            logger.info('User message added');
          },
          onChunk: (chunk: string) => {
            streamingContent += chunk;

            if (!streamingMessageId) {
              // 一時的なストリーミングメッセージを作成
              streamingMessageId = tempId;
              const tempMessage: Message = {
                id: streamingMessageId,
                conversationId: conversationId,
                role: 'ASSISTANT' as any,
                content: streamingContent,
                createdAt: new Date(),
              };
              setMessages((prev) => [...prev, tempMessage]);
            } else {
              // 既存のストリーミングメッセージを更新
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === streamingMessageId
                    ? { ...msg, content: streamingContent }
                    : msg
                )
              );
            }
          },
          onDone: (data) => {
            const assistantMessage: Message = {
              ...data.assistantMessage,
              createdAt: new Date(data.assistantMessage.createdAt),
            };

            // 一時メッセージを最終メッセージに置き換え
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === streamingMessageId ? assistantMessage : msg
              )
            );
            isStreamComplete = true;
            logger.info('Streaming completed successfully');
          },
          onError: (err) => {
            const error = new Error(err.message);
            setError(error);
            logger.error('Streaming failed:', error);
            if (onError) onError(error);

            // エラー時は一時メッセージを削除
            if (streamingMessageId) {
              setMessages((prev) =>
                prev.filter((msg) => msg.id !== streamingMessageId)
              );
            }
          },
        });
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

        // エラー時は一時メッセージを削除
        if (streamingMessageId && !isStreamComplete) {
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== streamingMessageId)
          );
        }

        throw error;
      } finally {
        setIsLoading(false);
        // ストリーミング完了後はAbortControllerをクリア
        abortControllerRef.current = null;
      }
    },
    [conversationId, onError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { messages, sendMessage, isLoading, error, clearError };
}
