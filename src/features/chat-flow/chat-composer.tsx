"use client";

import { useState } from "react";

export function ChatComposer({ placeholder = "레터링 내용 / 컬러 색을 적어주세요" }: { placeholder?: string }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [value, setValue] = useState("");

  function sendMessage() {
    const trimmed = value.trim();
    if (!trimmed) return;
    setMessages((current) => [...current, trimmed]);
    setValue("");
  }

  return (
    <>
      {messages.length ? (
        <div className="grid gap-[var(--figma-space-sm)] px-[var(--figma-space-md)] pb-[var(--figma-space-md)]">
          {messages.map((message, index) => (
            <p className="ml-auto max-w-[280px] rounded-[var(--figma-radius-lg)] bg-[var(--figma-color-action-primary)] px-[var(--figma-space-md)] py-[var(--figma-space-sm)] text-body-sm text-white" key={`${message}-${index}`}>
              {message}
            </p>
          ))}
        </div>
      ) : null}
      <form
        className="flex h-[52px] items-center gap-[var(--figma-space-sm)] rounded-[var(--figma-radius-full)] border border-[var(--figma-color-border-default)] bg-white px-[var(--figma-space-sm)] shadow-[var(--figma-shadow-card)]"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
      >
        <button aria-label="첨부" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--figma-color-surface-subtle)] text-[32px] leading-none text-[var(--figma-color-text-tertiary)]" type="button">
          +
        </button>
        <input
          className="min-w-0 flex-1 bg-transparent text-body-md outline-none placeholder:text-[var(--figma-color-text-tertiary)] focus-visible:outline-none"
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
        <button aria-label="전송" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--figma-color-surface-subtle)] text-[28px] leading-none text-[var(--figma-color-text-tertiary)]" type="submit">
          #
        </button>
      </form>
    </>
  );
}
