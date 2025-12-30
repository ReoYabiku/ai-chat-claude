'use client';

import React, { useEffect, useCallback } from 'react';
import { useSession } from '@/hooks/useSession';
import { useChat } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className }: ChatContainerProps) {
  const { sessionId, conversationId, isInitializing, startNewConversation, error: sessionError, clearError: clearSessionError } = useSession();
  const { messages, sendMessage, isLoading, error: chatError, clearError: clearChatError } = useChat({ conversationId });

  useEffect(() => {
    const initConversation = async () => {
      if (!isInitializing && !conversationId && sessionId) {
        try {
          await startNewConversation();
        } catch (err) {
          logger.error('Failed to auto-create conversation:', err);
        }
      }
    };

    initConversation();
  }, [isInitializing, conversationId, sessionId, startNewConversation]);

  const clearError = useCallback(() => {
    clearSessionError();
    clearChatError();
  }, [clearSessionError, clearChatError]);

  const handleNewConversation = async () => {
    try {
      clearError();
      await startNewConversation();
    } catch (err) {
      logger.error('Failed to start new conversation:', err);
    }
  };

  const error = sessionError || chatError;

  if (isInitializing) {
    return (
      <div className={cn('flex items-center justify-center h-screen', className)}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-screen bg-white', className)}>
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Chat Claude</h1>
          {conversationId && (
            <p className="text-xs text-gray-500">Conversation: {conversationId.slice(0, 8)}...</p>
          )}
        </div>

        <Button variant="secondary" size="sm" onClick={handleNewConversation}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </Button>
      </header>

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800">{error.message}</p>
            </div>
            <button onClick={clearError} className="text-red-600 hover:text-red-800" aria-label="Dismiss error">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput onSend={sendMessage} isLoading={isLoading} disabled={!conversationId} />
    </div>
  );
}
