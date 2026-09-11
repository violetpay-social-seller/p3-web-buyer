import { describe, expect, it } from "vitest";
import type { OrderStatus, RefundOutcome, RefundResponse } from "../../shared/api/buyer-api";
import { getBuyerRefundUiState } from "./buyer-refund-state";

function createInput(status: OrderStatus, outcome?: RefundOutcome) {
  return {
    order: { status },
    refunds: outcome
      ? ([{ outcome }] as RefundResponse[])
      : [],
  };
}

describe("getBuyerRefundUiState", () => {
  it.each([
    [createInput("PAID"), "AVAILABLE", true],
    [createInput("REFUND_REQUESTED"), "REQUESTED", false],
    [createInput("PAID", "PROCESSING"), "PROCESSING", false],
    [createInput("REFUND_REQUESTED", "RETRYABLE"), "RETRYABLE", false],
    [createInput("PAID", "MANUAL_REQUIRED"), "MANUAL_REQUIRED", false],
    [createInput("REFUND_REQUESTED", "FAILED"), "FAILED", false],
    [createInput("REFUNDED", "COMPLETED"), "COMPLETED", false],
    [createInput("PICKED_UP"), "UNAVAILABLE", false],
  ] as const)("환불 UI 상태를 계약에 맞게 계산한다", (input, kind, canRequestRefund) => {
    expect(getBuyerRefundUiState(input)).toMatchObject({ kind, canRequestRefund });
  });
});
