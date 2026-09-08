"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getOrderConfirmation,
  getMe,
  getPaymentCta,
  markOrderConfirmationViewed,
  preparePaymentAttempt,
  requestOrderConfirmationRevision,
  type OrderConfirmationDetailResponse,
  type PaymentCtaResponse,
  type UserProfileResponse,
} from "@/shared/api/buyer-api";
import { requestPoint3Payment } from "@/features/payment/point3-sdk";
import { parseOrderSummaryRows, type DisplayOrderSummaryRow } from "@/shared/lib/order-summary-format";
import { getBuyerInquiryDetailHref } from "@/shared/navigation/buyer-back-routes";
import { FlowCard, FlowCardAction, FlowCardActions } from "@/shared/ui/flow-card";

const asset = (name: string) => `/figma-flowmap/${name}`;

export function ConfirmationDetailPage({ confirmationId, inquiryId, state }: { confirmationId: string; inquiryId: string; state?: string }) {
  const [confirmation, setConfirmation] = useState<OrderConfirmationDetailResponse | null>(null);
  const [paymentCta, setPaymentCta] = useState<PaymentCtaResponse | null>(null);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadConfirmation() {
      try {
        const detail = await getOrderConfirmation(inquiryId, confirmationId);
        if (cancelled) return;

        setConfirmation(detail);

        let viewedDetail = detail;
        try {
          viewedDetail = await markOrderConfirmationViewed(inquiryId, confirmationId);
        } catch {
          viewedDetail = detail;
        }
        const cta = await getPaymentCta(inquiryId, confirmationId);
        if (cancelled) return;
        setConfirmation(viewedDetail);
        setPaymentCta(cta);
        setError(null);
      } catch (caught) {
        if (cancelled) return;
        setError(caught instanceof Error ? caught.message : "주문확인서를 불러오지 못했어요.");
      }
    }

    void loadConfirmation();

    return () => {
      cancelled = true;
    };
  }, [confirmationId, inquiryId]);

  useEffect(() => {
    let cancelled = false;

    getMe()
      .then((response) => {
        if (!cancelled) setProfile(response);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-dvh overflow-x-clip bg-[var(--figma-color-surface-subtle)] text-[var(--figma-color-text-primary)]">
      <div className="mx-auto min-h-dvh w-full max-w-[var(--figma-container-lg)]">
        <div className="relative h-dvh w-full overflow-hidden bg-[var(--figma-color-surface-subtle)]">
          <ConfirmationPhone confirmation={confirmation} error={error} inquiryId={inquiryId} paid={state === "paid"} paymentCta={paymentCta} profile={profile} />
        </div>
      </div>
    </main>
  );
}

function ConfirmationPhone({
  confirmation,
  error,
  inquiryId,
  paid = false,
  paymentCta,
  profile,
}: {
  confirmation: OrderConfirmationDetailResponse | null;
  error: string | null;
  inquiryId: string;
  paid?: boolean;
  paymentCta: PaymentCtaResponse | null;
  profile: UserProfileResponse | null;
}) {
  const rows = parseConfirmationRows(confirmation);
  const backHref = `${getBuyerInquiryDetailHref(inquiryId)}?state=final-price`;

  if (!confirmation) {
    return (
      <div className="flex h-full flex-col bg-white">
        <header className="flex h-14 shrink-0 items-center justify-between bg-white px-[var(--figma-space-md)]">
          <Link aria-label="뒤로" className="grid h-6 w-6 place-items-center" href={backHref}>
            <Image alt="" height={24} src={asset("chat-back.svg")} width={24} />
          </Link>
          <h1 className="text-display-sm">주문 확인서</h1>
          <span className="h-6 w-6" />
        </header>
        <div className="flex flex-1 items-center justify-center px-[var(--figma-space-md)] text-center">
          <p className={`text-body-md ${error ? "text-[var(--figma-color-status-error)]" : "text-[var(--figma-color-text-secondary)]"}`}>{error ?? "주문확인서를 불러오는 중입니다"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[var(--figma-color-surface-subtle)]">
      <header className="flex h-14 shrink-0 items-center justify-between bg-white px-[var(--figma-space-md)]">
        <Link aria-label="뒤로" className="grid h-6 w-6 place-items-center" href={backHref}>
          <Image alt="" height={24} src={asset("chat-back.svg")} width={24} />
        </Link>
        <h1 className="text-display-sm">주문 확인서</h1>
        <Link aria-label="메뉴" className="grid h-6 w-6 place-items-center" href="/me">
          <Image alt="" height={24} src={asset("chat-menu.svg")} width={24} />
        </Link>
      </header>
      <div className="flex-1 overflow-y-auto px-[var(--figma-space-md)] py-[var(--figma-space-md)]">
        <FlowCard className="px-[var(--figma-space-md)] py-[var(--figma-space-xl)]">
          <div className="mb-[var(--figma-space-xl)] flex items-center justify-between">
            <h2 className="text-display-sm">{confirmation.pickupAt ? formatConfirmationDate(confirmation.pickupAt) : "-"}</h2>
            <p className="text-display-sm">{confirmation.pickupAt ? formatConfirmationTime(confirmation.pickupAt) : "-"}</p>
          </div>
          <div className="grid gap-[var(--figma-space-xs)] text-body-sm">
            <InfoLine label="주문자" value={profile?.name ?? "-"} />
            <InfoLine label="연락처" value={profile?.phoneNumber ?? "-"} />
          </div>
          <Divider />
          {rows.length ? rows.map((row) => <ConfirmationRow key={`${row.label}-${row.value}`} label={row.label} value={row.value} />) : <p className="text-body-sm text-[var(--figma-color-text-tertiary)]">주문 옵션 정보가 없습니다.</p>}
          {confirmation?.sellerNote ? <ConfirmationRow label="사장님 메모" value={confirmation.sellerNote} /> : null}
          <Divider />
          <div className="flex items-center justify-between py-[var(--figma-space-md)]">
            <h2 className="text-display-sm">최종 가격</h2>
            <p className="text-[28px] font-bold leading-[36px] tracking-[-0.02em]">{formatWon(confirmation.amount)}</p>
          </div>
          {error ? <p className="text-label-sm text-[var(--figma-color-status-error)]">{error}</p> : null}
          {paymentCta?.reason ? <p className="text-label-sm text-[var(--figma-color-text-tertiary)]">{paymentCta.reason}</p> : null}
        </FlowCard>
      </div>
      <ConfirmationActions
        confirmationId={confirmation?.confirmationId}
        inquiryId={inquiryId}
        paid={paid || confirmation?.status === "PAID"}
        paymentCta={paymentCta}
      />
    </div>
  );
}

function ConfirmationActions({
  confirmationId,
  inquiryId,
  paid,
  paymentCta,
}: {
  confirmationId?: string;
  inquiryId: string;
  paid: boolean;
  paymentCta: PaymentCtaResponse | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"revision" | "payment" | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  async function requestRevision() {
    if (!confirmationId) return;
    setPending("revision");
    try {
      await requestOrderConfirmationRevision(inquiryId, confirmationId);
      router.replace(`/inquiries/${encodeURIComponent(inquiryId)}?state=revision-requested`);
    } finally {
      setPending(null);
    }
  }

  async function startPayment() {
    if (!confirmationId) return;
    setPending("payment");
    setPaymentError(null);
    try {
      const prepared = await preparePaymentAttempt(inquiryId, confirmationId);

      await requestPoint3Payment({
        prepared,
      });
    } catch (caught) {
      setPaymentError(caught instanceof Error ? caught.message : "결제창을 열지 못했어요.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="shrink-0 bg-[var(--figma-color-surface-subtle)] px-[var(--figma-space-md)] pb-[34px] pt-[var(--figma-space-md)]">
      {paid ? (
        <FlowCardAction disabled size="lg">
          결제 완료
        </FlowCardAction>
      ) : (
        <FlowCardActions>
          <FlowCardAction
            disabled={!confirmationId || pending !== null}
            onClick={requestRevision}
            variant="secondary"
          >
            {pending === "revision" ? "요청중" : "수정 요청"}
          </FlowCardAction>
          <FlowCardAction
            disabled={!confirmationId || paymentCta?.canPay === false || pending !== null}
            onClick={startPayment}
          >
            {pending === "payment" ? "준비중" : "바로 결제"}
          </FlowCardAction>
          {paymentError ? <p className="basis-full text-center text-label-sm text-[var(--figma-color-status-error)]">{paymentError}</p> : null}
        </FlowCardActions>
      )}
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="mr-[var(--figma-space-sm)] text-[var(--figma-color-text-tertiary)]">{label}</span>
      <span>{value}</span>
    </p>
  );
}

function ConfirmationRow({ label, price, value }: DisplayOrderSummaryRow) {
  return (
    <div className="py-[var(--figma-space-sm)]">
      <p className="text-body-sm text-[var(--figma-color-text-tertiary)]">{label}</p>
      <div className="mt-2 flex items-start justify-between gap-[var(--figma-space-md)]">
        <p className="min-w-0 text-heading-md">{value}</p>
        {price ? <p className="shrink-0 text-label-md">{price}</p> : null}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="my-[var(--figma-space-lg)] h-px bg-[var(--figma-color-border-subtle)]" />;
}

function parseConfirmationRows(confirmation: OrderConfirmationDetailResponse | null) {
  if (!confirmation) return [];

  const orderRows = parseOrderSummaryRows(confirmation.orderSummary);
  const summaryRows = orderRows.length ? orderRows : parseOrderSummaryRows(confirmation.summaryText);
  const additionalRows = parseOrderSummaryRows(confirmation.additionalItems);

  return [...summaryRows, ...additionalRows];
}

function formatWon(value: number) {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function formatConfirmationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(date);
}

function formatConfirmationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
