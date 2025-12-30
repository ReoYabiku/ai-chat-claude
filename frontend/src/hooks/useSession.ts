'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS } from '@/lib/constants';
import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';

interface UseSessionReturn {
  sessionId: string;
  conversationId: string | null;
  isInitializing: boolean;
  startNewConversation: () => Promise<void>;
  error: Error | null;
  clearError: () => void;
}

export function useSession(): UseSessionReturn {
  const [sessionId, setSessionId] = useState<string>('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeSession = () => {
      try {
        let storedSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);

        if (!storedSessionId) {
          storedSessionId = uuidv4();
          localStorage.setItem(STORAGE_KEYS.SESSION_ID, storedSessionId);
          logger.info('New sessionId created:', storedSessionId);
        } else {
          logger.info('Existing sessionId loaded:', storedSessionId);
        }

        setSessionId(storedSessionId);

        const storedConversationId = localStorage.getItem(STORAGE_KEYS.CONVERSATION_ID);
        if (storedConversationId) {
          setConversationId(storedConversationId);
          logger.info('Existing conversationId loaded:', storedConversationId);
        }
      } catch (err) {
        logger.error('Failed to initialize session:', err);
        setError(err instanceof Error ? err : new Error('Session initialization failed'));
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSession();
  }, []);

  const startNewConversation = useCallback(async () => {
    try {
      setError(null);
      const response = await apiClient.createConversation({ sessionId });
      setConversationId(response.id);
      localStorage.setItem(STORAGE_KEYS.CONVERSATION_ID, response.id);
      logger.info('New conversation created:', response.id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create conversation');
      setError(error);
      logger.error('Failed to start new conversation:', error);
      throw error;
    }
  }, [sessionId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { sessionId, conversationId, isInitializing, startNewConversation, error, clearError };
}
