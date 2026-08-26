# Buyer Screen Index

## 화면군

| 화면군 | 관련 라우트 | 주요 플로우 |
| --- | --- | --- |
| 홈·탐색 | `/`, `/stores`, `/stores/[slug]`, `/stores/[slug]/products/[productId]` | UF-02-01 ~ UF-02-05 |
| 인증 | `/auth`, `/auth/role`, `/auth/callback`, `/auth/sync` | UF-01-01, UF-01-03 |
| 상담·주문서 draft | `/inquiries`, `/inquiries/[inquiryId]`, `/stores/[slug]/order-form-drafts/new` | UF-03-01 ~ UF-03-07 |
| 주문확인·결제 | `/inquiries/[inquiryId]/confirmations/[confirmationId]`, 상담 채팅방 내 카드, 결제 Overlay | UF-04-01 ~ UF-04-07 |
| 주문 | `/orders`, `/orders/[orderId]` | UF-05-01 ~ UF-05-04 |
| 결제 내역 | `/payments`, `/payments/[paymentId]` | UF-05-05 |
| 알림·내 정보 | `/notifications`, `/me`, `/me/settings` | UF-01-04 ~ UF-01-06, UF-03-07 |

## 공통 완료 조건

- 정상 데이터만이 아니라 로딩, 빈 상태, 오류, 권한 없음 상태가 구현돼야 한다.
- 모든 Mutation은 진행 중 중복 실행을 막고 성공 후 관련 Query를 갱신한다.
- 파괴적 행동은 확인 절차와 처리 결과를 제공한다.
- 긴 스토어명, 상품명, 옵션 내용과 여러 이미지에서도 레이아웃이 깨지지 않아야 한다.
- 모바일 구매자 화면에서 핵심 행동이 고정 Header나 하단 CTA에 가려지지 않아야 한다.
