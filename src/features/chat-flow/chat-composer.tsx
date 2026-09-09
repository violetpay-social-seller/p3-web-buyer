"use client";

import Image from "next/image";
import { Client } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";
import { getValidAccessToken } from "@/shared/auth/cognito";
import { env } from "@/shared/config/env";

const asset = (name: string) => `/figma-flowmap/${name}`;

export function ChatComposer({
  initialValue = "",
  inquiryId,
  onTimelineChanged,
  placeholder = "레터링 내용 / 컬러 색을 적어주세요",
}: {
  initialValue?: string;
  inquiryId?: string;
  onTimelineChanged?: () => void;
  placeholder?: string;
}) {
  const optimisticEchoesRef = useRef<string[]>([]);
  const receivedEventIdsRef = useRef<Set<string>>(new Set());
  const stompClientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const brokerURL = getBrokerUrl();

    if (!inquiryId || !brokerURL) {
      return undefined;
    }

    const client = new Client({
      brokerURL,
      beforeConnect: async () => {
        const accessToken = await getValidAccessToken();
        if (!accessToken) {
          throw new Error("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        }
        client.connectHeaders = {
          Authorization: `Bearer ${accessToken}`,
        };
      },
      debug: () => undefined,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/inquiries/${inquiryId}`, (message) => {
          const event = parseTimelineEvent(message.body);
          if (!event || isDuplicateEvent(event.eventId, receivedEventIdsRef.current)) {
            return;
          }

          const echoedIndex = event.content ? optimisticEchoesRef.current.indexOf(event.content) : -1;
          if (echoedIndex >= 0) {
            optimisticEchoesRef.current.splice(echoedIndex, 1);
          }
          onTimelineChanged?.();
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
      reconnectDelay: 3000,
    });

    stompClientRef.current = client;
    client.activate();

    return () => {
      stompClientRef.current = null;
      setConnected(false);
      void client.deactivate();
    };
  }, [inquiryId, onTimelineChanged]);

  function sendMessage() {
    const trimmed = value.trim();
    if (!trimmed) return;
    const client = stompClientRef.current;

    if (connected && client?.connected && inquiryId) {
      optimisticEchoesRef.current.push(trimmed);
      client.publish({
        body: JSON.stringify({ assetIds: [], content: trimmed }),
        destination: `/app/inquiries/${inquiryId}/messages`,
      });
      window.setTimeout(() => onTimelineChanged?.(), 400);
    }
    setValue("");
  }

  const hasMessage = Boolean(value.trim());

  return (
    <form
      data-ui="chat-composer"
      className="flex h-[52px] max-h-[52px] min-h-[52px] min-w-0 shrink-0 grow-0 items-center gap-[var(--figma-space-sm)] overflow-hidden rounded-[var(--figma-radius-full)] border border-[var(--figma-color-border-default)] bg-[var(--figma-color-surface-subtle)] p-[var(--figma-space-sm)] outline-none ring-0 focus-within:border-[var(--figma-color-border-default)] focus-within:outline-none focus-within:ring-0 focus-within:!outline-none"
      onSubmit={(event) => {
        event.preventDefault();
        sendMessage();
      }}
    >
      <button
        aria-label="첨부"
        className="relative size-9 shrink-0 overflow-hidden rounded-full bg-white outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:!outline-none"
        data-ui="chat-composer-plus"
        type="button"
      >
        <Image alt="" className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2" height={48} src={asset("chat-plus.svg")} width={48} />
      </button>
      <input
        className="m-0 h-9 max-h-9 min-h-9 w-0 min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-body-md leading-6 outline-none ring-0 placeholder:text-[var(--figma-color-text-unavailable)] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:!outline-none"
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
      <button
        aria-label="전송"
        className={`relative size-9 shrink-0 overflow-hidden rounded-full bg-[var(--figma-color-action-secondary)] outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:!outline-none ${hasMessage ? "visible pointer-events-auto" : "invisible pointer-events-none"}`}
        data-ui="chat-composer-action"
        disabled={!hasMessage}
        type="submit"
      >
        <Image alt="" className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2" height={48} src={asset("chat-send.svg")} width={48} />
      </button>
    </form>
  );
}

function getBrokerUrl() {
  if (!env.apiBaseUrl) return "";

  try {
    const url = new URL(env.apiBaseUrl);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = "/ws";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

type TimelineRealtimeEvent = {
  content?: string | null;
  eventId?: string | null;
  referenceId?: string | null;
  type?: string | null;
};

function parseTimelineEvent(body: string): TimelineRealtimeEvent | null {
  try {
    const parsed = JSON.parse(body) as TimelineRealtimeEvent;
    if (!parsed || typeof parsed !== "object") return null;
    const hasTimelineSignal = Boolean(parsed.eventId || parsed.referenceId || parsed.type || parsed.content);
    return hasTimelineSignal ? parsed : null;
  } catch {
    return null;
  }
}

function isDuplicateEvent(eventId: string | null | undefined, receivedEventIds: Set<string>) {
  if (!eventId) return false;
  if (receivedEventIds.has(eventId)) return true;

  receivedEventIds.add(eventId);
  if (receivedEventIds.size > 100) {
    const oldestEventId = receivedEventIds.values().next().value;
    if (oldestEventId) receivedEventIds.delete(oldestEventId);
  }
  return false;
}
