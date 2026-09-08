"use client";

import { Client } from "@stomp/stompjs";
import { useEffect } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import type { InquiryListItemResponse } from "@/shared/api/buyer-api";
import { getValidAccessToken } from "@/shared/auth/cognito";
import { env } from "@/shared/config/env";

type InquiryListRealtimePayload = {
  type: string;
  inquiryId: string;
  unreadCount: number;
  latestEventAt: string | null;
  status: string;
};

export function useBuyerInquiryListStomp(userId?: string, enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const brokerURL = getBrokerUrl();

    if (!enabled || !userId || !brokerURL) {
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
        client.subscribe(`/topic/users/${userId}/inquiries`, (message) => {
          try {
            const payload = JSON.parse(message.body) as InquiryListRealtimePayload;
            if (payload.type !== "INQUIRY_UPDATED") return;

            queryClient.setQueriesData<InquiryListItemResponse[]>(
              { predicate: (query) => isBuyerInquiryListKey(query.queryKey) },
              (current) =>
                current?.map((item) =>
                  item.inquiryId === payload.inquiryId
                    ? {
                        ...item,
                        latestEventAt: payload.latestEventAt,
                        status: payload.status,
                        unreadCount: payload.unreadCount,
                      }
                    : item,
                ),
            );
            void queryClient.invalidateQueries({ queryKey: ["buyer", "inquiries"] });
            void queryClient.invalidateQueries({
              queryKey: ["buyer", "inquiry", payload.inquiryId, "timeline", "preview"],
            });
          } catch {
            return;
          }
        });
      },
      reconnectDelay: 3000,
    });

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, [enabled, queryClient, userId]);
}

function isBuyerInquiryListKey(queryKey: QueryKey) {
  return Array.isArray(queryKey) && queryKey[0] === "buyer" && queryKey[1] === "inquiries";
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
