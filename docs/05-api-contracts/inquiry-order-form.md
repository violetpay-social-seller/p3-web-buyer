# Inquiry and Order Form API Contract

## Endpoints

| 작업 | Method·URI | 책임 |
| --- | --- | --- |
| 문의 생성 | `POST /inquiries` | 스토어 일반 문의 또는 상품 컨텍스트 문의 생성 |
| 구매자 문의 목록·상세 | `GET /inquiries` | 구매자 참여 문의 조회 |
| 이전 메시지 조회 | `GET /inquiries/{id}/messages` | 과거 메시지 페이지 조회 |
| 양식 조회 | `GET /inquiries/{id}/order-form` | 판매자 주문서 양식 조회 |
| 양식 제출 | `POST /inquiries/{id}/order-form/submissions` | 구매자 주문서 제출 |

## DTO

```ts
type InquiryStatus = "OPEN" | "CLOSED";

type InquirySummary = {
  id: string;
  store: StoreSummary;
  contextProduct?: ProductSummary;
  status: InquiryStatus;
  lastMessage?: string;
  unreadCount: number;
  updatedAt: string;
};

type ChatMessage = {
  id: string;
  inquiryId: string;
  sender: { id: string; name: string; role: "BUYER" | "SELLER" | "OPERATOR" };
  content?: string;
  attachments: ImageSource[];
  createdAt: string;
  clientMessageId?: string;
};

type FieldType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "DATE"
  | "TIME"
  | "DATETIME"
  | "SINGLE_SELECT"
  | "MULTI_SELECT"
  | "BOOLEAN"
  | "IMAGE";
```

## Dynamic Form Rules

- `required` 필드는 타입에 맞는 비어 있지 않은 값을 요구한다.
- 선택형은 서버가 정의한 Option Value만 허용한다.
- IMAGE는 업로드가 완료된 Asset ID만 제출하고 개수·MIME Type을 확인한다.
- 제출 중 양식이 변경돼 409가 발생하면 최신 양식을 다시 불러온다.

## STOMP

```text
WebSocket endpoint: /ws
구독: /topic/inquiries/{inquiryId}
발행: /app/inquiries/{inquiryId}/messages
개인 오류·알림: /user/queue/events
```

- STOMP CONNECT Header에 Cognito JWT를 전달한다.
- REST로 과거 메시지를 먼저 불러오고 STOMP는 신규 이벤트만 전달한다.
- 같은 메시지가 REST와 STOMP로 들어오면 서버 Message ID로 중복 제거한다.
