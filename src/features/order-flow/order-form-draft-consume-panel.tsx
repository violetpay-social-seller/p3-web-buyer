"use client";

import { useRouter } from "next/navigation";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { consumeOrderFormDraft } from "@/shared/api/buyer-api";
import { clearSubmittedOrderFormDraftCleanup } from "@/shared/lib/order-form-resume-store";
import { BuyerFullScreenLoading } from "@/shared/ui/buyer-full-screen-loading";
import { FlowCard, FlowCardAction } from "@/shared/ui/flow-card";

type ConsumeState =
  | { status: "processing"; message: string }
  | { status: "error"; message: string }
  | { status: "success"; message: string };

export function OrderFormDraftConsumePanel({ draftKey }: { draftKey: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, setState] = useState<ConsumeState>({
    status: "processing",
    message: "주문서를 제출하는 중입니다.",
  });

  useEffect(() => {
    let cancelled = false;

    consumeOrderFormDraft(draftKey)
      .then(async (result) => {
        if (cancelled) return;
        await clearSubmittedOrderFormDraftCleanup(draftKey);
        if (cancelled) return;
        await refreshSubmittedInquiryQueries(queryClient, result.inquiryId);
        if (cancelled) return;
        setState({ status: "success", message: "주문서 제출이 완료되었습니다." });
        router.replace(
          `/inquiries/${encodeURIComponent(result.inquiryId)}?state=final-price&submitted=1&submissionId=${encodeURIComponent(result.submissionId)}`,
        );
      })
      .catch((error) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "주문서 제출에 실패했습니다.";
        setState({ status: "error", message });
      });

    return () => {
      cancelled = true;
    };
  }, [draftKey, queryClient, router]);

  if (state.status !== "error") {
    return <BuyerFullScreenLoading label={state.message} />;
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--figma-color-surface-subtle)] px-[var(--figma-space-md)] text-[var(--figma-color-text-primary)]">
      <FlowCard className="grid w-full max-w-[358px] gap-[var(--figma-space-md)] p-[var(--figma-space-lg)] text-center">
        <p className="text-label-md text-[var(--figma-color-text-secondary)]">{state.status}</p>
        <h1 className="text-display-sm">{state.message}</h1>
        {state.status === "error" ? (
          <FlowCardAction href={`/auth?next=${encodeURIComponent(`/order-form-drafts/${draftKey}/consume`)}`} size="lg">
            다시 로그인하기
          </FlowCardAction>
        ) : null}
      </FlowCard>
    </main>
  );
}

async function refreshSubmittedInquiryQueries(queryClient: QueryClient, inquiryId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["buyer", "inquiries"] }),
    queryClient.invalidateQueries({ queryKey: ["buyer", "inquiry", inquiryId] }),
  ]);
}
