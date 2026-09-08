"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function ChatTimelineViewport({ children, scrollKey }: { children: ReactNode; scrollKey: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const scrollToBottom = () => {
      viewport.scrollTop = viewport.scrollHeight;
    };

    scrollToBottom();
    const frameId = window.requestAnimationFrame(scrollToBottom);

    const observer = new ResizeObserver(scrollToBottom);
    observer.observe(viewport);
    if (viewport.firstElementChild) {
      observer.observe(viewport.firstElementChild);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [scrollKey]);

  return (
    <div className="min-w-0 flex-1 overflow-y-auto" data-ui="chat-timeline-viewport" ref={viewportRef}>
      {children}
    </div>
  );
}
