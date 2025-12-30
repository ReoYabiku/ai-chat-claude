import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2 text-gray-500', className)}>
      <div className="flex gap-1">
        <span className="animate-bounce [animation-delay:-0.3s]">●</span>
        <span className="animate-bounce [animation-delay:-0.15s]">●</span>
        <span className="animate-bounce">●</span>
      </div>
      <span className="text-sm">Claude is typing...</span>
    </div>
  );
}
