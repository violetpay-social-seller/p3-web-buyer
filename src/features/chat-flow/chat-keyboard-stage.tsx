"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

export function ChatKeyboardStage({ children, composer }: { children: ReactNode; composer: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [composerFocused, setComposerFocused] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const root = document.documentElement;
    const body = document.body;
    const initialScrollX = window.scrollX;
    const initialScrollY = window.scrollY;
    const previousRootStyles = {
      height: root.style.height,
      overflow: root.style.overflow,
      overscrollBehavior: root.style.overscrollBehavior,
    };
    const previousBodyStyles = {
      height: body.style.height,
      inset: body.style.inset,
      overflow: body.style.overflow,
      overscrollBehavior: body.style.overscrollBehavior,
      position: body.style.position,
      width: body.style.width,
    };
    let frameId = 0;

    root.style.height = "100%";
    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    body.style.height = "100%";
    body.style.inset = "0";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.width = "100%";
    window.scrollTo(0, 0);

    const updateStageHeight = () => {
      const parent = stage.parentElement;
      if (!parent) return;

      const stageTop = stage.getBoundingClientRect().top;
      const parentBottom = parent.getBoundingClientRect().bottom;
      const visualViewport = window.visualViewport;
      const visibleBottom = visualViewport
        ? visualViewport.offsetTop + visualViewport.height
        : window.innerHeight;
      const nextHeight = Math.max(0, Math.min(parentBottom, visibleBottom) - stageTop);
      const height = `${Math.round(nextHeight)}px`;

      stage.style.flex = `0 0 ${height}`;
      stage.style.height = height;
    };

    const scheduleStageHeightUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateStageHeight);
    };

    const updateComposerFocus = () => {
      const focused = document.activeElement?.matches('[data-ui="chat-composer"] input') ?? false;
      setComposerFocused(focused);
      scheduleStageHeightUpdate();
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.matches('[data-ui="chat-composer"] input')) return;

      setComposerFocused(true);
      scheduleStageHeightUpdate();
    };

    const handleFocusOut = () => {
      window.requestAnimationFrame(updateComposerFocus);
    };

    updateStageHeight();
    updateComposerFocus();
    window.visualViewport?.addEventListener("resize", scheduleStageHeightUpdate);
    window.visualViewport?.addEventListener("scroll", scheduleStageHeightUpdate);
    window.addEventListener("resize", scheduleStageHeightUpdate);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.visualViewport?.removeEventListener("resize", scheduleStageHeightUpdate);
      window.visualViewport?.removeEventListener("scroll", scheduleStageHeightUpdate);
      window.removeEventListener("resize", scheduleStageHeightUpdate);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      root.style.height = previousRootStyles.height;
      root.style.overflow = previousRootStyles.overflow;
      root.style.overscrollBehavior = previousRootStyles.overscrollBehavior;
      body.style.height = previousBodyStyles.height;
      body.style.inset = previousBodyStyles.inset;
      body.style.overflow = previousBodyStyles.overflow;
      body.style.overscrollBehavior = previousBodyStyles.overscrollBehavior;
      body.style.position = previousBodyStyles.position;
      body.style.width = previousBodyStyles.width;
      window.scrollTo(initialScrollX, initialScrollY);
    };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden" data-keyboard-active={composerFocused || undefined} data-ui="chat-keyboard-stage" ref={stageRef}>
      {children}
      <div
        className={`shrink-0 bg-white px-[var(--figma-space-md)] shadow-[var(--figma-shadow-modal)] ${
          composerFocused
            ? "py-[var(--figma-space-sm)]"
            : "pb-[max(34px,env(safe-area-inset-bottom,0px))] pt-[var(--figma-space-md)]"
        }`}
      >
        {composer}
      </div>
    </div>
  );
}
