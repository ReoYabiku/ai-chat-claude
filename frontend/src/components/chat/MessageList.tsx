import React from 'react';
import type { Message } from '@ai-chat-claude/shared';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  className?: string;
}

export function MessageList({ messages, isLoading, className }: MessageListProps) {
  const scrollRef = useAutoScroll({
    dependencies: [messages, isLoading],
    enabled: true,
  });

  return (
    <div ref={scrollRef} className={cn('flex-1 overflow-y-auto bg-white', className)}>
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4">
          <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-lg font-medium mb-1">Start a Conversation</p>
          <p className="text-sm text-center max-w-md">
            Send a message to Claude and get intelligent, helpful responses.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="px-4 py-3">
          <TypingIndicator />
        </div>
      )}
    </div>
  );
}
