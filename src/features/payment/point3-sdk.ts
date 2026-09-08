"use client";

import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import type { PaymentPreparationResponse } from "@/shared/api/buyer-api";
import { env } from "@/shared/config/env";

const DEFAULT_SDK_AMOUNT = 1;
const DEFAULT_SDK_URL = "https://widget.point3.io/v2/standard?loader=toss";
const DEFAULT_ORDER_NAME = "주문 결제";

export async function requestPoint3Payment({
  prepared,
}: {
  prepared: PaymentPreparationResponse;
}) {
  const point3Payments = await loadPoint3Payments(prepared.clientId);
  const customerKey = prepared.payerId?.trim() || ANONYMOUS;
  const widgets = point3Payments.widgets({ customerKey });
  const successUrl = prepared.successUrl ?? buildPaymentResultUrl(prepared.paymentAttemptId, "success");
  const failUrl = prepared.failUrl ?? buildPaymentResultUrl(prepared.paymentAttemptId, "fail");

  assertResultUrl(successUrl);
  assertResultUrl(failUrl);

  await widgets.setAmount({
    currency: "KRW",
    value: DEFAULT_SDK_AMOUNT,
  });
  await widgets.requestPayment({
    failUrl,
    orderId: prepared.sessionId,
    orderName: normalizeOrderName(prepared.orderName),
    successUrl,
  });
}

async function loadPoint3Payments(clientId: string) {
  const clientKey = clientId.trim();

  if (!clientKey) {
    throw new Error("Point3 clientId 응답이 필요합니다.");
  }

  if (!clientKey.startsWith("client-")) {
    throw new Error("Point3 clientId는 client- 형식이어야 합니다.");
  }

  return loadTossPayments(clientKey, {
    src: getPoint3SdkUrl(),
  });
}

function getPoint3SdkUrl() {
  const sdkUrl = env.point3SdkUrl.trim() || DEFAULT_SDK_URL;

  if (new URL(sdkUrl).pathname.endsWith(".js")) {
    throw new Error("Point3 SDK 주소에는 .js를 붙이지 않습니다.");
  }

  if (new URL(sdkUrl).searchParams.get("loader") !== "toss") {
    throw new Error("npm loader 방식의 Point3 SDK 주소에는 loader=toss가 필요합니다.");
  }

  return sdkUrl;
}

function buildPaymentResultUrl(paymentAttemptId: string, result: "fail" | "success") {
  const baseUrl = env.appBaseUrl || window.location.origin;
  const url = new URL(`/payments/${encodeURIComponent(paymentAttemptId)}`, baseUrl);
  url.searchParams.set("result", result);
  return url.toString();
}

function assertResultUrl(value: string) {
  const url = new URL(value);
  if (url.protocol === "https:") return;
  if (url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) return;

  throw new Error("Point3 결제 결과 URL은 HTTPS 절대 URL이어야 합니다.");
}

function normalizeOrderName(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return DEFAULT_ORDER_NAME;
  return trimmed.slice(0, 100);
}
