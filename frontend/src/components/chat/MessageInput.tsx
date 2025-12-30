'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { UI } from '@/lib/constants';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MessageInput({ onSend, isLoading = false, disabled = false, className }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setError('Message cannot be empty');
      return;
    }

    if (trimmedContent.length > UI.MAX_MESSAGE_LENGTH) {
      setError(`Message cannot exceed ${UI.MAX_MESSAGE_LENGTH} characters`);
      return;
    }

    try {
      setError(null);
      await onSend(trimmedContent);
      setContent('');

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      // Error handled by parent
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setError(null);

    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > UI.MAX_MESSAGE_LENGTH;
  const isDisabled = disabled || isLoading;

  return (
    <div className={cn('border-t border-gray-200 bg-white p-4', className)}>
      <div className="flex flex-col gap-2">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            placeholder={UI.MESSAGE_PLACEHOLDER}
            rows={1}
            className={cn(
              'w-full resize-none rounded-md border border-gray-300 px-3 py-2',
              'text-gray-900 placeholder-gray-400',
              'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
              'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
              'min-h-[44px] max-h-[200px]',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className={cn('text-gray-500', isOverLimit && 'text-red-600 font-semibold')}>
              {characterCount} / {UI.MAX_MESSAGE_LENGTH}
            </span>
            {error && <span className="text-red-600">{error}</span>}
          </div>

          <Button
            onClick={handleSend}
            disabled={isDisabled || !content.trim() || isOverLimit}
            isLoading={isLoading}
            size="md"
          >
            Send
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded">Enter</kbd>{' '}
          to send, <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded">Shift+Enter</kbd>{' '}
          for new line
        </p>
      </div>
    </div>
  );
}
