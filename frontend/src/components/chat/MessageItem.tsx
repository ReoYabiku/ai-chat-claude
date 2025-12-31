import React from 'react';
import type { Message } from '@ai-chat-claude/shared';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/constants';

interface MessageItemProps {
  message: Message;
  className?: string;
  isStreaming?: boolean;
}

export function MessageItem({ message, className, isStreaming = false }: MessageItemProps) {
  const isUser = message.role === 'USER';
  const isAssistant = message.role === 'ASSISTANT';

  return (
    <div
      className={cn(
        'flex flex-col gap-1 px-4 py-3',
        isUser && 'bg-primary-50',
        isAssistant && 'bg-gray-50',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'text-sm font-semibold flex items-center gap-2',
            isUser && 'text-primary-700',
            isAssistant && 'text-gray-700'
          )}
        >
          {ROLE_LABELS[message.role as keyof typeof ROLE_LABELS] || message.role}
          {isStreaming && (
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
          )}
        </span>
        <time className="text-xs text-gray-500" dateTime={message.createdAt.toISOString()}>
          {formatDate(message.createdAt)}
        </time>
      </div>

      <div className="text-gray-900 whitespace-pre-wrap break-words">
        {message.content}
        {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse"></span>}
      </div>
    </div>
  );
}
