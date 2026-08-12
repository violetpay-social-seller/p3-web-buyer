# API Client

## Base URL

- API Base URL은 환경변수로 관리한다.
- 브라우저에 노출되는 값은 `NEXT_PUBLIC_API_BASE_URL`, Cognito 공개 설정, Point3 공개 Origin처럼 클라이언트 실행에 필요한 값만 허용한다.
- API 비밀키, Point3 Bearer Token, AWS 관리 권한은 프론트 환경변수에 넣지 않는다.

## 요청

- 인증 API에는 Cognito Access Token을 `Authorization: Bearer <token>`으로 전달한다.
- 요청은 공통 Fetch Client를 통과시켜 `requestId`, JSON 파싱, 에러 변환을 일관되게 처리한다.
- GET 요청만 네트워크 오류에 제한적으로 자동 재시도한다.
- Mutation, 결제 승인, 환불, 주문 취소 요청은 자동 재시도하지 않는다.
- Query Key에는 사용자 역할과 필요한 경우 리소스 범위를 포함한다.

```ts
const queryKeys = {
  me: ["me"],
  stores: (params: unknown) => ["stores", params],
  store: (slug: string) => ["store", slug],
  product: (slug: string, id: string) => ["store", slug, "product", id],
  inquiry: (id: string) => ["inquiry", id],
  messages: (id: string) => ["inquiry", id, "messages"],
  orders: (params: unknown) => ["orders", "buyer", params],
  order: (id: string) => ["order", id],
  payments: (params: unknown) => ["payments", "buyer", params],
};
```

## 응답

```ts
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fieldErrors?: { field: string; message: string }[];
  };
  requestId?: string;
};
```

- 공통 Client는 `success: false`와 HTTP 오류를 화면 계층이 이해할 수 있는 App Error로 변환한다.
- 금액은 원 단위 정수로 받고 `Intl.NumberFormat("ko-KR")`로 표시한다.
- 시각은 ISO 8601 UTC 문자열로 받고 표시 시 한국 시간대로 변환한다.
- 알 수 없는 Enum은 화면을 중단하지 않고 `확인 필요`로 표시하며 개발 환경에서 로그를 남긴다.
