# Payment and Order API Contract

## Endpoints

| 작업 | Method·URI | 책임 |
| --- | --- | --- |
| 주문확인서 조회 | `GET /inquiries/{id}/confirmations` | 구매자 확인서 목록·상세 |
| 결제 준비 | `POST /payment-requests/{id}/attempts` | Point3 세션 생성 정보 반환 |
| 결제 승인 요청 | `POST /payment-attempts/{id}/capture` | 서버가 Point3 승인 처리 |
| 결제 결과 확인 | `GET /payment-attempts/{id}` | 성공·실패·결과 확인 필요 조회 |
| 구매자 주문 | `GET /orders` | 주문 목록 |
| 구매자 주문 상세 | `GET /orders/{id}` | 주문 스냅샷, 상태, 결제·환불, 상담 참조 |
| 주문 취소 요청 | `POST /orders/{id}/cancel-requests` | 구매자 취소 요청 |
| 결제 내역 | `GET /payments` | 결제·취소·환불 목록 |

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
