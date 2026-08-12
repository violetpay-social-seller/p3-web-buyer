# ADR-0003 State Management

## Status

Accepted.

## Context

구매자 앱은 서버 데이터, URL 필터, 동적 주문서, 채팅 실시간 상태, Point3 결제 상태를 함께 다룬다. 불필요한 전역 상태는 인증과 결제 안정성을 해칠 수 있다.

## Decision

- 서버 상태는 TanStack Query로 관리한다.
- URL 필터와 페이지는 Search Params로 관리한다.
- 폼은 React Hook Form + Zod로 관리한다.
- 단순 UI 상태는 컴포넌트 상태로 둔다.
- Auth Adapter가 토큰 저장·갱신을 담당한다.
- STOMP 연결 상태와 Point3 활성 Attempt ID는 각 Feature 내부에서 관리한다.
- 전역 상태 라이브러리는 실제 공유 상태 요구가 확인될 때만 추가한다.

## Consequences

- Query Key 설계와 Mutation 후 캐시 갱신이 중요해진다.
- 채팅과 결제는 늦게 도착한 이벤트 중복 처리에 주의해야 한다.
- Figma UI 교체가 상태 로직을 건드리지 않도록 View와 Feature Hook을 분리해야 한다.
