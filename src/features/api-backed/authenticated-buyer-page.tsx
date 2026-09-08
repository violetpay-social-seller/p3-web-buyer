"use client";

import { useCallback } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useBuyerInquiryListStomp } from "@/features/chat-flow/use-buyer-inquiry-list-stomp";
import { BuyerBlueprintPage, type BuyerApiData, type buyerPages } from "@/features/flow-blueprint/buyer-blueprint-page";
import {
  type ChatTimelineItemResponse,
  getInquiries,
  getInquiry,
  getInquiryTimeline,
  getMe,
  getNotifications,
  type InquiryListItemResponse,
  getOrder,
  getOrderConfirmations,
  getOrders,
  getStore,
} from "@/shared/api/buyer-api";

type BuyerPageValue = (typeof buyerPages)[keyof typeof buyerPages];

type AuthenticatedBuyerPageProps = {
  context?: string;
  inquiryId?: string;
  orderId?: string;
  page: BuyerPageValue;
};

export function AuthenticatedBuyerPage({ context, inquiryId, orderId, page }: AuthenticatedBuyerPageProps) {
  const forceSubmittedInquiryRefresh = page.key === "inquiryDetail" && context?.includes("submitted=1");
  const submittedInquiryRefreshOptions = forceSubmittedInquiryRefresh
    ? {
        refetchOnMount: "always" as const,
        staleTime: 0,
      }
    : {};
  const inquiries = useQuery({
    enabled: page.key === "inquiries" || page.key === "inquiryDetail",
    queryFn: () => getInquiries(),
    queryKey: ["buyer", "inquiries"],
    ...submittedInquiryRefreshOptions,
  });
  const trashedInquiries = useQuery({
    enabled: page.key === "inquiryDetail" && Boolean(inquiryId),
    queryFn: () => getInquiries({ status: "TRASH" }),
    queryKey: ["buyer", "inquiries", { status: "TRASH" }],
    ...submittedInquiryRefreshOptions,
  });
  const inquiry = useQuery({
    enabled: page.key === "inquiryDetail" && Boolean(inquiryId),
    queryFn: () => getInquiry(inquiryId as string),
    queryKey: ["buyer", "inquiry", inquiryId],
    ...submittedInquiryRefreshOptions,
  });
  const inquiryTimeline = useQuery({
    enabled: page.key === "inquiryDetail" && Boolean(inquiryId),
    queryFn: () => getInquiryTimeline(inquiryId as string),
    queryKey: ["buyer", "inquiry", inquiryId, "timeline"],
    ...submittedInquiryRefreshOptions,
  });
  const confirmations = useQuery({
    enabled: page.key === "inquiryDetail" && Boolean(inquiryId),
    queryFn: () => getOrderConfirmations(inquiryId as string),
    queryKey: ["buyer", "inquiry", inquiryId, "confirmations"],
    ...submittedInquiryRefreshOptions,
  });
  const inquiryStore = useQuery({
    enabled: page.key === "inquiryDetail" && Boolean(inquiry.data?.storeSlug),
    queryFn: () => getStore(inquiry.data?.storeSlug as string),
    queryKey: ["buyer", "inquiry", inquiryId, "store", inquiry.data?.storeSlug],
  });
  const orders = useQuery({
    enabled: page.key === "orders",
    queryFn: getOrders,
    queryKey: ["buyer", "orders"],
  });
  const orderDetail = useQuery({
    enabled: page.key === "orderDetail" && Boolean(orderId),
    queryFn: () => getOrder(orderId as string),
    queryKey: ["buyer", "order", orderId],
  });
  const notifications = useQuery({
    enabled: page.key === "notifications",
    queryFn: getNotifications,
    queryKey: ["buyer", "notifications"],
  });
  const profile = useQuery({
    enabled: page.key === "me" || page.key === "settings" || page.key === "inquiries" || page.key === "inquiryDetail",
    queryFn: getMe,
    queryKey: ["buyer", "me"],
  });
  const inquiryPreviewTimelines = useQueries({
    queries: (inquiries.data ?? []).map((item) => ({
      enabled: page.key === "inquiries" && !item.latestEvent,
      queryFn: () => getInquiryTimeline(item.inquiryId, { size: 1 }),
      queryKey: ["buyer", "inquiry", item.inquiryId, "timeline", "preview"],
      staleTime: 30_000,
    })),
  });
  useBuyerInquiryListStomp(profile.data?.userId, page.key === "inquiries" || page.key === "inquiryDetail");
  const { refetch: refetchConfirmations } = confirmations;
  const { refetch: refetchInquiries } = inquiries;
  const { refetch: refetchInquiryTimeline } = inquiryTimeline;
  const refreshInquiryTimeline = useCallback(() => {
    void Promise.all([refetchInquiryTimeline(), refetchConfirmations(), refetchInquiries()]);
  }, [refetchConfirmations, refetchInquiries, refetchInquiryTimeline]);
  const inquiryListItems = inquiries.isSuccess
    ? inquiries.data.map((item, index) =>
        withPreviewTimelineItem(item, inquiryPreviewTimelines[index]?.data?.items.at(-1)),
      )
    : undefined;

  const apiData: BuyerApiData = {
    inquiries: inquiryListItems,
    inquiry: inquiry.isSuccess ? inquiry.data : undefined,
    inquiryStatus: inquiries.data?.find((item) => item.inquiryId === inquiryId)?.status ?? trashedInquiries.data?.find((item) => item.inquiryId === inquiryId)?.status,
    inquiryTimeline: inquiryTimeline.isSuccess ? inquiryTimeline.data : undefined,
    confirmations: confirmations.isSuccess ? confirmations.data : undefined,
    notifications: notifications.isSuccess ? notifications.data : undefined,
    orderDetail: orderDetail.isSuccess ? orderDetail.data : undefined,
    orders: orders.isSuccess ? orders.data : undefined,
    profile: profile.isSuccess ? profile.data : undefined,
    store: inquiryStore.isSuccess ? inquiryStore.data : undefined,
  };

  return <BuyerBlueprintPage apiData={apiData} context={context} onInquiryTimelineRefresh={refreshInquiryTimeline} page={page} />;
}

function withPreviewTimelineItem(
  item: InquiryListItemResponse,
  timelineItem?: ChatTimelineItemResponse,
): InquiryListItemResponse {
  if (item.latestEvent || !timelineItem) return item;

  return {
    ...item,
    latestEvent: {
      eventId: timelineItem.eventId,
      referenceId: timelineItem.referenceId ?? null,
      type: timelineItem.type,
      senderUserId: timelineItem.senderUserId,
      content: timelineItem.content,
      createdAt: timelineItem.createdAt,
    },
    latestEventAt: timelineItem.createdAt,
  };
}
