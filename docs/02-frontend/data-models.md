# Data Models

## 공통 타입

```ts
type UUID = string;
type ISODateTime = string;
type Money = number;
```

- 시각은 ISO 8601 UTC 문자열로 받고 표시 시 한국 시간대로 변환한다.
- 금액은 원 단위 정수로 받고 `Intl.NumberFormat("ko-KR")`로 표시한다.
- Asset ID와 Object Key는 일반 구매자 화면에 노출하지 않는다.

## 주요 Enum

```ts
type UserRole = "BUYER" | "SELLER" | "OPERATOR";
type UserStatus = "ACTIVE" | "BLOCKED" | "WITHDRAWN";
type StoreStatus = "PUBLIC" | "PRIVATE" | "SUSPENDED";
type ProductStatus = "PUBLIC" | "HIDDEN";
type InquiryStatus = "OPEN" | "CLOSED";
type PaymentStatus = "READY" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "RESULT_UNKNOWN" | "CLOSED";
type OrderStatus = "PAID" | "IN_PRODUCTION" | "PRODUCTION_COMPLETED" | "PICKUP_COMPLETED" | "CANCELLED" | "REFUNDED";
```

알 수 없는 Enum은 화면을 중단하지 않고 `확인 필요`로 표시하며 개발 환경에서 로그를 남긴다.

## 표시 원칙

- Store API는 크기별 이미지 Delivery URL을 반환하고 프론트가 AssetVariant를 직접 조회하지 않는다.
- 주문은 상품 현재값보다 결제 당시 스냅샷을 표시한다.
- 상품이 물리 삭제돼 문의 컨텍스트가 없어지면 `삭제된 상품` Placeholder를 표시할 수 있다.
- 개인정보는 API가 제공한 마스킹 수준을 유지하고 프론트에서 원문 복원을 시도하지 않는다.
- Enum Label과 색상은 View Mapping에서 관리한다.
