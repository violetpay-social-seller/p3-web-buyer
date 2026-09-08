# Navigation

## Back Navigation Policy

구매자 웹의 상단 뒤로가기는 브라우저 히스토리의 이전 항목이 아니라 앱 안에서의 논리적 상위 목적지로 이동한다.

기본 원칙:

- 홈성 화면은 뒤로가기 버튼을 노출하지 않는다.
- 메뉴에서 진입하는 목록성 화면은 구매자 홈(`/`)으로 돌아간다.
- 목록에서 진입하는 상세 화면은 해당 목록으로 돌아간다.
- 스토어 상세에서 주문 흐름 공지로 들어간 경우는 스토어 상세로 돌아간다.
- 상품/이미지 기반 주문 확인 화면은 해당 스토어 상세로 돌아간다.
- 인증, 결제 결과, 오류 화면은 `router.back()`에 의존하지 않고 명시적 fallback 목적지를 사용한다.
- 브라우저 히스토리 back은 모달 닫기나 같은 화면 안 단계 복귀처럼 사용자가 직전에 만든 상태가 확실할 때만 사용한다.

현재 코드 기준 route mapping은 `src/shared/navigation/buyer-back-routes.ts`에서 관리한다.

| 화면 | 기본 뒤로가기 |
| --- | --- |
| `/inquiries` | `/` |
| `/inquiries/[inquiryId]` | `/inquiries` |
| `/orders` | `/` |
| `/orders/[orderId]` | `/orders` |
| `/notifications` | `/` |
| `/me` | `/` |
| `/me/settings` | `/me` |
| `/stores` | `/` |
| `/stores/[slug]` | `/stores` |
| `/stores/[slug]?notice=1` | `/stores/[slug]` |
| `/stores/[slug]/products/[productId]` | `/stores/[slug]` |
| `/payments` | `/` |
| `/payments/[paymentId]` | `/payments` |
| `/auth/role` | `/auth` |
| `/forbidden`, `/error` | `/` |
