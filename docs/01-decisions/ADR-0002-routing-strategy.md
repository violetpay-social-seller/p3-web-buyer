# ADR-0002 Routing Strategy

## Status

Accepted.

## Context

구매자 앱은 공개 스토어·상품 조회와 로그인 구매자 전용 상담·주문·결제를 함께 제공한다. 비로그인 사용자가 문의를 시작하면 로그인 후 원래 화면으로 돌아와야 한다.

## Decision

- Next.js App Router를 사용한다.
- `(public)`, `(auth)`, `(buyer)` 라우트 그룹을 둔다.
- 공개 라우트는 `/`, `/stores`, `/stores/[slug]`, `/stores/[slug]/products/[productId]`다.
- 구매자 보호 라우트는 `/inquiries`, `/orders`, `/payments`, `/notifications`, `/me` 계열이다.
- Middleware는 인증 세션 존재만 1차 확인하고 최종 역할·소유권은 API 응답으로 확인한다.
- Return URL을 보존해 인증 후 문의·결제 시작 위치로 돌아온다.

## Consequences

- 공개 탐색과 인증 흐름이 분리된다.
- 404와 403 처리에서 리소스 존재 여부를 과도하게 노출하지 않아야 한다.
- 판매자·운영자 화면은 구매자 앱에 추가하지 않는다.
