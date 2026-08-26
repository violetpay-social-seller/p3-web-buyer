# Payment and Order API Contract

## Endpoints

`p3-api` 실제 컨트롤러 기준이다.

| 작업 | Method·URI | 책임 |
| --- | --- | --- |
| 주문확인서 목록 | `GET /inquiries/{inquiryId}/confirmations` | 구매자 확인서 이력 |
| 주문확인서 상세 | `GET /inquiries/{inquiryId}/confirmations/{confirmationId}` | 확인서 단건 |
| 주문확인서 읽음 | `PATCH /inquiries/{inquiryId}/confirmations/{confirmationId}/viewed` | 구매자 확인 처리 |
| 수정 요청 | `PATCH /inquiries/{inquiryId}/confirmations/{confirmationId}/revision` | 확인서 수정 요청 |
| 결제 CTA 조회 | `GET /inquiries/{inquiryId}/confirmations/{confirmationId}/payment-cta` | 결제 가능 상태와 CTA 정보 |
| 결제 시도 목록 | `GET /inquiries/{inquiryId}/confirmations/{confirmationId}/payment-attempts` | 확인서 기준 결제 시도 이력 |
| 결제 준비 | `POST /inquiries/{inquiryId}/confirmations/{confirmationId}/payment-attempts` | Point3 세션 생성 정보 반환 |
| 결제 승인 요청 | `POST /payment-attempts/{paymentAttemptId}/capture` | 서버가 Point3 승인 처리 |
| 구매자 주문 | `GET /orders` | 주문 목록 |
| 구매자 주문 상세 | `GET /orders/{orderId}` | 주문 스냅샷, 상태, 결제·환불, 상담 참조 |
| 주문 취소 요청 | `POST /orders/{orderId}/cancel-request` | 구매자 취소 요청 |

## DTO

```ts
type PaymentStatus =
  | "READY"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "RESULT_UNKNOWN"
  | "CLOSED";

type OrderStatus =
  | "PAID"
  | "IN_PRODUCTION"
  | "PRODUCTION_COMPLETED"
  | "PICKUP_COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

type PaymentPreparation = {
  paymentAttemptId: string;
  sessionId: string;
  amount: number;
  payerId?: string;
  authClientId: string;
};

type OrderSummary = {
  id: string;
  orderNumber: string;
  storeName: string;
  menuName: string;
  paidAmount: number;
  pickupAt: string;
  status: OrderStatus;
};
```

## Point3 Rules

- 프론트는 백엔드가 반환한 `PaymentPreparation`으로 Point3 iframe을 연다.
- `payerId`가 없으면 Point3 `/regist`, 있으면 `/login` 진입을 사용한다.
- `POINT3_PAYMENT_INIT`은 정확한 Point3 Origin으로 보낸다.
- `POINT3_CAPTURE_READY`에서 Source, Origin, Session ID, 중복 여부를 검증한다.
- 백엔드 승인 API 성공 결과로만 결제 성공과 주문 완료를 표시한다.
- `RESULT_UNKNOWN`에서 자동으로 승인 API를 다시 호출하지 않는다.
- 현재 백엔드에는 구매자용 `GET /payments`, `GET /payments/{paymentId}`, `GET /payment-attempts/{paymentAttemptId}`가 없다.
- 결제 내역 화면은 confirmation 하위 `payment-attempts` 또는 주문 상세 응답 기반으로만 구성하고, 없는 결제 목록 API를 임의 호출하지 않는다.
