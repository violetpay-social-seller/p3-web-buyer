"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { capturePaymentAttempt, type PaymentCaptureResponse } from "@/shared/api/buyer-api";
import { getBuyerBackHref } from "@/shared/navigation/buyer-back-routes";
import { FlowCardAction } from "@/shared/ui/flow-card";

export function PaymentCapturePanel({
  failCode,
  payerId,
  paymentAttemptId,
  sessionId,
}: {
  failCode?: string;
  payerId?: string;
  paymentAttemptId: string;
  sessionId?: string;
}) {
  const router = useRouter();
  const [result, setResult] = useState<PaymentCaptureResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function capture() {
      if (failCode) {
        setError(getPaymentFailMessage(failCode));
        return;
      }

      if (!sessionId || !payerId) {
        setError("결제 완료 정보가 부족해요.");
        return;
      }

      try {
        const response = await capturePaymentAttempt(paymentAttemptId, { payerId, sessionId });
        if (cancelled) return;
        setResult(response);
        if (response.orderId) {
          router.replace(`/orders/${encodeURIComponent(response.orderId)}`);
        }
      } catch (caught) {
        if (cancelled) return;
        setError(caught instanceof Error ? caught.message : "결제 확인에 실패했어요.");
      }
    }

    void capture();

    return () => {
      cancelled = true;
    };
  }, [failCode, payerId, paymentAttemptId, router, sessionId]);

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="flex h-14 shrink-0 items-center justify-between bg-white">
        <Link aria-label="뒤로" className="grid h-12 w-12 place-items-center text-[28px] text-[var(--figma-color-icon-default)]" href={getBuyerBackHref("paymentDetail")}>
          <span aria-hidden>‹</span>
        </Link>
        <h1 className="text-display-sm">결제 확인</h1>
        <span className="h-12 w-12" />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-[var(--figma-space-md)] text-center">
        <h2 className="text-display-sm">{error ? "결제 확인이 필요해요" : result ? "결제가 완료되었어요" : "결제 결과를 확인하고 있어요"}</h2>
        <p className="mt-[var(--figma-space-sm)] text-body-md text-[var(--figma-color-text-secondary)]">
          {error ?? (result ? `${formatWon(result.amount)} 결제가 처리되었습니다.` : "잠시만 기다려 주세요.")}
        </p>
      </div>
      <div className="px-[var(--figma-space-md)] pb-safe-lg pt-[var(--figma-space-md)]">
        <FlowCardAction href={result?.orderId ? `/orders/${encodeURIComponent(result.orderId)}` : "/orders"}>
          주문 내역 보기
        </FlowCardAction>
      </div>
    </div>
  );
}

function formatWon(value: number) {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function getPaymentFailMessage(code: string) {
  const messages: Record<string, string> = {
    INVALID_SESSION: "결제 세션 정보를 확인할 수 없습니다. 결제를 다시 시작하세요.",
    PAYER_DEACTIVATED: "탈퇴가 완료되어 결제가 종료되었습니다.",
    PAYMENT_WINDOW_CLOSED: "결제창이 닫혔습니다.",
    SESSION_EXPIRED: "결제 세션이 만료되었습니다. 결제를 다시 시도해 주세요.",
  };

  return messages[code] ?? "결제 요청을 완료하지 못했습니다.";
}
