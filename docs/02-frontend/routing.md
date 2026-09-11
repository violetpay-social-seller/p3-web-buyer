# Routing

## 라우트 목록

프론트 화면 라우트는 구매자 앱 내 화면 주소이고, 데이터 호출 URI는 `p3-api` 실제 컨트롤러를 따른다. 화면 라우트가 있다고 해서 같은 이름의 백엔드 API가 존재한다고 가정하지 않는다.

| 경로 | 페이지 | 접근 | 책임 |
| --- | --- | --- | --- |
| `/` | 구매자 홈 | 공개 | 공개 스토어 탐색과 로그인 사용자 진입점 |
| `/auth` | 통합 로그인 | 공개 | Cognito 로그인·회원가입 시작 |
| `/auth/role` | 가입 역할 선택 | 공개 | 구매자 또는 판매자 역할 선택 |
| `/auth/callback` | Cognito Callback | 공개 | Code 교환 완료 후 회원 동기화 |
| `/auth/sync` | 회원 동기화 상태 | 인증 | `/auth/me/sync` 처리와 역할별 이동 |
| `/forbidden` | 접근 권한 없음 | 전체 | 역할·소유권 불일치 안내 |
| `/error` | 복구 불가 오류 | 전체 | 재시도와 홈 이동 |
| `/stores` | 스토어 목록·검색 | 공개 | 스토어 검색, 결과 없음, 페이지 로딩 |
| `/stores/[slug]` | 스토어 상세 | 공개 | 소개, 이미지, 연락처·SNS, 영업시간, 상품, 일반 문의 |
| `/stores/[slug]/products/[productId]` | 상품 상세 | 공개 | 상품 이미지, 설명, 가격 정책, 옵션, 상품 문의 |
| `/stores/[slug]/order-form-drafts/new` | 주문서 draft 작성 | 공개 진입·제출 전 인증 연계 | 갤러리 사진 기반 주문 문의의 픽업 날짜, 픽업 시간, 공지 확인, 주문서 draft 작성 |
| `/inquiries` | 상담 목록 | 구매자 | 진행 중·종료 상담, 읽지 않음, 마지막 메시지 |
| `/inquiries/[inquiryId]` | 상담 채팅방 | 참여 구매자 | 메시지, 이미지, 주문서, 확인서, 결제요청 |
| `/inquiries/[inquiryId]/confirmations/[confirmationId]` | 주문확인서 상세 | 참여 구매자 | 메뉴·옵션·가격·픽업 정보 확인, 수정 요청, Point3 결제 시작 |
| `/orders` | 주문 목록 | 구매자 | 진행 중·완료 주문 필터 |
| `/orders/[orderId]` | 주문 상세 | 주문 구매자 | 주문 스냅샷, 진행 상태, 결제·환불, 상담 이동, 취소 요청 |
| `/payments` | 결제 내역 | 구매자 | 결제, 취소, 환불 상태 목록 |
| `/payments/[paymentId]` | 결제 상세 | 결제 구매자 | 결제시도, 실패, 결과 확인 필요, 환불 상세 |
| `/notifications` | 알림 목록 | 인증 | 문의 답변, 주문확인서, 결제, 주문 상태 알림 |
| `/me` | 회원 정보 | 인증 | 내 정보 조회·수정, 로그아웃, 탈퇴 |
| `/me/settings` | 설정 | 인증 | 알림·계정 설정 |

## Backend URI Alignment

| 화면/기능 | 실제 백엔드 URI | 비고 |
| --- | --- | --- |
| 회원 동기화 | `POST /auth/me/sync` | Cognito `id_token` 사용 |
| 역할 등록 | `POST /auth/me/registration` | Cognito `id_token` 사용 |
| 현재 회원 | `GET /auth/me`, `PATCH /auth/me` | 로그인 사용자 |
| 스토어 상세 | `GET /stores/{slug}` | 현재 백엔드에는 `GET /stores` 없음 |
| 대표 이미지 | `GET /stores/{slug}/representative-images` | 공개 이미지 |
| 갤러리 | `GET /stores/{slug}/gallery-items`, `GET /stores/{slug}/gallery-items/{galleryItemId}` | 공개 갤러리 |
| 공개 주문서 | `GET /stores/{slug}/order-form` | 스토어 단위 |
| 주문서 draft | `POST /stores/{slug}/order-form-drafts`, `POST /order-form-drafts/{draftKey}/consume` | 로그인 전 draft 생성 후 인증 완료 시 상담 컨텍스트로 소비 |
| 문의 열기 | `POST /stores/{slug}/inquiries/open` | 상품 ID 기반 문의 API 없음 |
| 문의 목록 | `GET /inquiries?status=&unreadOnly=` | 구매자 |
| 문의 상세 | `GET /inquiries/{inquiryId}` | 구매자 |
| 상담 이벤트 | `GET /inquiries/{inquiryId}/events?cursorCreatedAt=&cursorId=&size=` | 과거 메시지와 시스템 이벤트 |
| 문의 정책 | `GET /inquiries/{inquiryId}/store-policies` | 상담 내 정책 |
| 문의 상태 | `PATCH /inquiries/{inquiryId}/read`, `/trash`, `/restore` | 구매자 |
| 확인서 | `GET /inquiries/{inquiryId}/confirmations`, `GET /inquiries/{inquiryId}/confirmations/{confirmationId}` | 구매자 |
| 확인서 상태 | `PATCH /inquiries/{inquiryId}/confirmations/{confirmationId}/viewed`, `/revision` | 구매자 |
| 결제 CTA/시도 | `GET /inquiries/{inquiryId}/confirmations/{confirmationId}/payment-cta`, `GET/POST /inquiries/{inquiryId}/confirmations/{confirmationId}/payment-attempts` | 확인서 기준 |
| 결제 승인 | `POST /payment-attempts/{paymentAttemptId}/capture` | Point3 capture |
| 주문 | `GET /orders`, `GET /orders/{orderId}`, `POST /orders/{orderId}/refund-request` | 구매자 |
| 알림 | `GET /notifications`, `GET /notifications/{notificationId}`, `GET /notifications/unread-count`, `PATCH /notifications/{notificationId}/read` | 인증 사용자 |

## Backend Gaps

- 현재 `p3-api`에는 구매자용 `GET /stores` 목록 API가 없다.
- 현재 `p3-api`에는 `GET /stores/{slug}/products/{productId}` 상품 상세 API가 없다.
- 현재 `p3-api`에는 구매자용 `GET /payments`, `GET /payments/{paymentId}` 결제 목록·상세 API가 없다.
- 위 화면은 Figma에 존재하더라도 백엔드 계약이 생기기 전까지 실제 데이터 화면처럼 확정 구현하지 않는다.

## 보호 라우트

- 스토어·상품 공개 조회는 비회원도 가능하다.
- 문의 시작, 주문서 제출, 결제, 주문·결제·알림·마이페이지는 로그인 구매자만 가능하다.
- 비로그인 사용자가 문의 또는 결제를 선택하면 Return URL을 보존한 뒤 로그인으로 이동한다.
- Middleware는 인증 세션 존재만 1차 확인하고, 최종 역할·소유권은 API 응답으로 확인한다.
- `SELLER` 또는 `OPERATOR` 역할이 구매자 전용 라우트에 접근하면 `/forbidden` 또는 역할별 도메인 이동을 사용한다.

## 금지

- 구매자 앱에 `/seller/*` 또는 `/operator/*` 관리 화면을 만들지 않는다.
- URL의 `storeId`, `orderId`, `inquiryId`만 믿고 데이터를 표시하지 않는다.
- 404와 403을 과도하게 구분해 리소스 존재 여부를 노출하지 않는다.
