# Local Dev

## Prerequisites

- Node.js는 문서 기준점 `24.18.0` LTS 계열을 사용한다.
- Package Manager는 pnpm을 사용한다.
- `p3-web-buyer`는 독립 Next.js 앱이다.
- 로컬 셸에 `node`와 `pnpm`이 없다면 Codex 번들 런타임 경로를 PATH에 추가해서 실행한다.

## Commands

```sh
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```

Codex 번들 런타임을 사용할 때:

```sh
PATH=/Users/kimminseo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/kimminseo/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm dev
```

## Checks

- 구매자 홈, 스토어 목록·상세, 상품 상세
- 일반 문의와 상품 문의의 상품 카드 표시 차이
- 상담 채팅방, 이미지 첨부, 주문서 작성·제출
- 주문확인서, 결제요청 카드, Point3 성공·실패·결과 확인 필요
- 주문 목록·상세, 결제 내역, 알림, 마이페이지
- 모바일 360px 이상에서 고정 Header와 하단 CTA가 콘텐츠를 가리지 않는지 확인

## Last Verified

- 2026-08-12: `pnpm install`, `pnpm typecheck`, `pnpm lint`, `pnpm build` 통과
