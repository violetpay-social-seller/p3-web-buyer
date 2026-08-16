# Implementation Notes

임시 구현 메모를 기록합니다.
확정된 규칙은 관련 docs나 ADR로 옮깁니다.

- 2026-08-12: Obsidian `04 프론트엔드`와 `01 기획` 자료를 확인해 구매자 앱 docs에 반영했다.
- 2026-08-12: 독립 Next.js 앱 골격, TypeScript, Tailwind, ESLint, Vitest, Playwright, TanStack Query, RHF+Zod, Radix, Lucide, MSW, STOMP 의존성을 세팅했다.
- 2026-08-12: 초기 검증 명령을 통과했다.
- 2026-08-12: 실제 디자인 적용 전 교체 가능한 구매자 라우트·플로우 뼈대를 `features/flow-blueprint`와 `app` 라우트에 구성했다.
- 2026-08-12: 주문제작 케이크 상담 플랫폼 이해와 유사 서비스 흐름을 반영해 구매자 더미 데이터, 스토어·상품 이미지, 상담·주문서·확인서·결제요청 플로우가 보이는 실서비스형 골격으로 보강했다.
- 2026-08-15: Cognito Hosted UI PKCE 로그인, callback token exchange, `/auth/me/sync`, Bearer 자동 첨부, 개발용 `/assets` 업로드 테스트 UI를 구매자 앱에 추가했다.
