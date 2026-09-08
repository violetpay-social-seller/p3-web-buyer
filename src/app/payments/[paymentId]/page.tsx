import { PaymentCapturePanel } from "@/features/payment/payment-capture-panel";

export default async function PaymentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ paymentId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { paymentId } = await params;
  const query = (await searchParams) ?? {};
  const sessionId = getQueryValue(query.orderId) ?? getQueryValue(query.sessionId);
  const payerId = getQueryValue(query.payerId);
  const failCode = getQueryValue(query.code);

  return (
    <main className="min-h-dvh overflow-x-clip bg-[var(--figma-color-surface-subtle)] text-[var(--figma-color-text-primary)]">
      <div className="mx-auto min-h-dvh w-full max-w-[var(--figma-container-lg)]">
        <div className="relative h-dvh w-full overflow-hidden bg-white">
          <PaymentCapturePanel failCode={failCode} payerId={payerId} paymentAttemptId={decodeURIComponent(paymentId)} sessionId={sessionId} />
        </div>
      </div>
    </main>
  );
}

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
