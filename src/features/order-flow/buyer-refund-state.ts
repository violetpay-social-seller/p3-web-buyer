import type {
  OrderStatus,
  RefundResponse,
} from "../../shared/api/buyer-api";

export type BuyerRefundUiState = {
  canRequestRefund: boolean;
  kind:
    | "AVAILABLE"
    | "REQUESTED"
    | "PROCESSING"
    | "RETRYABLE"
    | "MANUAL_REQUIRED"
    | "FAILED"
    | "COMPLETED"
    | "UNAVAILABLE";
  message: string | null;
};

export function getBuyerRefundUiState(input: {
  order: { status: OrderStatus };
  refunds: RefundResponse[];
}): BuyerRefundUiState {
  const latestRefund = input.refunds[0] ?? null;

  if (input.order.status === "REFUNDED") {
    return {
      canRequestRefund: false,
      kind: "COMPLETED",
      message: "환불이 완료되었습니다.",
    };
  }

  if (latestRefund?.outcome === "PROCESSING") {
    return {
      canRequestRefund: false,
      kind: "PROCESSING",
      message: "환불 처리 결과를 확인 중입니다.",
    };
  }

  if (latestRefund?.outcome === "RETRYABLE") {
    return {
      canRequestRefund: false,
      kind: "RETRYABLE",
      message: "환불 처리가 지연되고 있습니다. 잠시 후 다시 확인해 주세요.",
    };
  }

  if (latestRefund?.outcome === "MANUAL_REQUIRED") {
    return {
      canRequestRefund: false,
      kind: "MANUAL_REQUIRED",
      message: "자동 환불 가능 기간이 지나 판매자의 수동 환불이 필요합니다.",
    };
  }

  if (latestRefund?.outcome === "FAILED") {
    return {
      canRequestRefund: false,
      kind: "FAILED",
      message: "환불 처리 상태 확인이 필요합니다. 스토어에 문의해 주세요.",
    };
  }

  if (input.order.status === "REFUND_REQUESTED") {
    return {
      canRequestRefund: false,
      kind: "REQUESTED",
      message: "판매자가 환불 요청을 확인하고 있습니다.",
    };
  }

  if (input.order.status === "PAID") {
    return {
      canRequestRefund: true,
      kind: "AVAILABLE",
      message: null,
    };
  }

  return {
    canRequestRefund: false,
    kind: "UNAVAILABLE",
    message: null,
  };
}
