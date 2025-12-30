'use client';

import { useEffect, useRef } from 'react';
import { UI } from '@/lib/constants';

interface UseAutoScrollOptions {
  dependencies: any[];
  enabled?: boolean;
  behavior?: ScrollBehavior;
}

export function useAutoScroll({
  dependencies,
  enabled = true,
  behavior = 'smooth',
}: UseAutoScrollOptions) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !scrollRef.current) return;

    const element = scrollRef.current;
    const shouldScroll = isNearBottom(element, UI.AUTO_SCROLL_THRESHOLD);

    if (shouldScroll) {
      requestAnimationFrame(() => {
        element.scrollTo({
          top: element.scrollHeight,
          behavior,
        });
      });
    }
  }, dependencies);

  return scrollRef;
}

function isNearBottom(element: HTMLElement, threshold: number): boolean {
  const { scrollTop, scrollHeight, clientHeight } = element;
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
  return distanceFromBottom <= threshold;
}
