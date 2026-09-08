"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createReport,
  createServiceInquiry,
  markInquiryRead,
  readNotification,
  requestOrderCancel,
  trashInquiry,
  type NotificationResponse,
} from "@/shared/api/buyer-api";

export function MarkInquiryReadOnMount({ inquiryId }: { inquiryId?: string }) {
  useEffect(() => {
    if (!inquiryId) return;
    void markInquiryRead(inquiryId).catch(() => undefined);
  }, [inquiryId]);

  return null;
}

export function ChatLeaveDialogAction({ cancelHref, inquiryId }: { cancelHref: string; inquiryId?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function leaveChat() {
    if (!inquiryId) {
      router.push("/inquiries");
      return;
    }

    setError(null);
    setPending(true);
    try {
      await trashInquiry(inquiryId);
      router.replace("/inquiries");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "채팅방 나가기에 실패했어요.");
      setPending(false);
    }
  }

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-[var(--figma-color-surface-scrim)] px-[32px]">
      <div className="min-h-[200px] w-full max-w-[326px] rounded-[24px] bg-white px-[var(--figma-space-md)] pb-[var(--figma-space-md)] pt-[var(--figma-space-xl)] text-center shadow-[var(--figma-shadow-dropdown)]">
        <h2 className="text-heading-lg">채팅방 나가기</h2>
        <p className="mt-[var(--figma-space-xs)] text-label-sm text-[var(--figma-color-text-tertiary)]">채팅방을 나가면 대화내용이 모두 삭제되고 채팅 목록에서도 삭제됩니다</p>
        {error ? <p className="mt-[var(--figma-space-xs)] text-label-sm text-[var(--figma-color-status-error)]">{error}</p> : null}
        <div className="mt-[var(--figma-space-lg)] flex gap-[var(--figma-space-sm)]">
          <button
            className="flex h-11 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-default)] text-label-md text-[var(--figma-color-text-tertiary)]"
            onClick={() => router.push(cancelHref)}
            type="button"
          >
            취소
          </button>
          <button
            className="flex h-11 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] text-label-md text-white disabled:bg-[var(--figma-color-action-disabled)]"
            disabled={pending}
            onClick={leaveChat}
            type="button"
          >
            {pending ? "처리중" : "나가기"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrderCancelRequestDialog({
  cancelHref,
  failureHref,
  orderId,
  successHref,
}: {
  cancelHref: string;
  failureHref: string;
  orderId?: string;
  successHref: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function submitCancelRequest() {
    if (!orderId) {
      router.push(successHref);
      return;
    }

    setPending(true);
    try {
      await requestOrderCancel(orderId, "구매자 취소 요청");
      router.replace(successHref);
    } catch {
      router.replace(failureHref);
    }
  }

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-[var(--figma-color-surface-scrim)] px-[32px]">
      <div className="min-h-[182px] w-full max-w-[326px] rounded-[24px] bg-white px-[var(--figma-space-md)] pb-[var(--figma-space-md)] pt-[var(--figma-space-xl)] text-center shadow-[var(--figma-shadow-dropdown)]">
        <h2 className="text-heading-lg">정말 취소 요청하시겠어요?</h2>
        <p className="mt-[var(--figma-space-xs)] text-label-sm text-[var(--figma-color-text-tertiary)]">매장 내 환불정책에 따라 취소 요청이 가능합니다</p>
        <div className="mt-[var(--figma-space-lg)] flex gap-[var(--figma-space-sm)]">
          <button
            className="flex h-11 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-default)] text-label-md text-[var(--figma-color-text-tertiary)]"
            onClick={() => router.push(cancelHref)}
            type="button"
          >
            취소
          </button>
          <button
            className="flex h-11 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] text-label-md text-white disabled:bg-[var(--figma-color-action-disabled)]"
            disabled={pending}
            onClick={submitCancelRequest}
            type="button"
          >
            {pending ? "처리중" : "계속하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationActionItem({
  body,
  item,
  referenceHref,
  read = false,
  time,
  title,
}: {
  body: string;
  item?: NotificationResponse;
  read?: boolean;
  referenceHref: string;
  time: string;
  title: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function openNotification() {
    if (pending) return;
    setPending(true);
    try {
      if (item && !item.readAt) {
        await readNotification(item.id);
      }
    } catch {
      // Navigation is still useful even if marking as read fails.
    } finally {
      router.push(referenceHref);
    }
  }

  return (
    <button className="flex h-24 w-full gap-[var(--figma-space-md)] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-md)] text-left" onClick={openNotification} type="button">
      <span className="flex h-6 w-2 shrink-0 items-center justify-center">
        <span className={`h-2 w-2 rounded-full ${read ? "bg-[var(--figma-color-action-disabled)]" : "bg-[var(--figma-color-action-primary)]"}`} />
      </span>
      <span className="flex min-w-0 flex-1 gap-[var(--figma-space-xs)]">
        <span className="flex h-16 min-w-0 flex-1 flex-col gap-[var(--figma-space-sm)]">
          <span className="truncate text-heading-md">{title}</span>
          <span className="line-clamp-2 text-body-sm text-[var(--figma-color-text-secondary)]">{body}</span>
        </span>
        <time className="h-full w-11 shrink-0 text-right text-label-xs text-[var(--figma-color-text-tertiary)]">{time}</time>
        {read ? null : <span className="mt-0 h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--figma-color-action-destructive)]" />}
      </span>
    </button>
  );
}

export function ChatMenuActionButton({
  action,
  inquiryId,
  storeId,
}: {
  action: "report" | "serviceInquiry";
  inquiryId?: string;
  storeId?: string;
}) {
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const label = action === "report" ? "신고하기" : "서비스 문의";

  async function submit() {
    if (state === "pending") return;

    setState("pending");
    try {
      if (action === "report") {
        await createReport({
          evidence: inquiryId ? `inquiryId=${inquiryId}` : null,
          reason: "구매자 채팅방에서 신고가 접수되었습니다.",
          targetId: storeId ?? "",
          targetType: "STORE",
        });
      } else {
        await createServiceInquiry({
          body: inquiryId ? `구매자 채팅방 문의입니다. inquiryId=${inquiryId}` : "구매자 채팅방 문의입니다.",
          title: "구매자 서비스 문의",
        });
      }
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <button
      className="flex h-14 w-full items-center bg-[var(--figma-color-surface-subtle)] p-[var(--figma-space-md)] text-left text-heading-md disabled:text-[var(--figma-color-text-disabled)]"
      disabled={state === "pending" || (!storeId && action === "report")}
      onClick={submit}
      type="button"
    >
      {state === "pending" ? "접수중" : state === "done" ? "접수됨" : state === "error" ? "다시 시도" : label}
    </button>
  );
}
