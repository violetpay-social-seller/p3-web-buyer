# Inquiry and Order Form API Contract

## Endpoints

`p3-api` 실제 컨트롤러 기준이다.

| 작업 | Method·URI | 책임 |
| --- | --- | --- |
| 문의 생성 | `POST /stores/{slug}/inquiries/open` | 스토어 기준 구매자 문의 생성 또는 기존 문의 열기 |
| 구매자 문의 목록 | `GET /inquiries?status=&unreadOnly=` | 구매자 참여 문의 조회 |
| 구매자 문의 상세 | `GET /inquiries/{inquiryId}` | 상담방 헤더와 현재 상태 조회 |
| 상담 이벤트 조회 | `GET /inquiries/{inquiryId}/events?cursorCreatedAt=&cursorId=&size=` | 과거 메시지와 시스템 이벤트 페이지 조회 |
| 스토어 정책 조회 | `GET /inquiries/{inquiryId}/store-policies` | 상담 중 필요한 스토어 정책 조회 |
| 읽음 처리 | `PATCH /inquiries/{inquiryId}/read` | 구매자 상담 읽음 처리 |
| 휴지통 이동 | `PATCH /inquiries/{inquiryId}/trash` | 구매자 상담 숨김 처리 |
| 휴지통 복구 | `PATCH /inquiries/{inquiryId}/restore` | 구매자 상담 복구 |
| 주문서 draft 생성 | `POST /stores/{slug}/order-form-drafts` | 공개 주문서 입력값 draft 생성 |
| 주문서 draft 소비 | `POST /order-form-drafts/{draftKey}/consume` | draft를 상담 컨텍스트로 소비 |

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
