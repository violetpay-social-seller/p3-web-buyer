# Stabilization

## Issues

- Point3, STOMP, Cognito 연동은 API와 환경값 확정 후 통합 검증이 필요하다.

## Fixes

- 2026-08-12: Obsidian `04 프론트엔드`와 `01 기획` 자료를 구매자 앱 docs 구조에 반영했다.
- 2026-08-12: 구매자 앱 범위, 라우팅, API 계약, 화면 상태, 디자인·Mock·Figma 규칙을 정리했다.
- 2026-08-12: 프론트 배포 대상을 Vercel로 확정하고 `{domain}`, `seller.{domain}`, `admin.{domain}`, `api.{domain}`, `assets.{domain}` 구조를 ADR과 runbook에 반영했다.

## Remaining Risk

- 실제 백엔드 Controller URI와 문서상 초안 URI가 다를 수 있다.
- 실제 도메인과 Cognito Redirect URI 확정 후 환경변수를 다시 검증해야 한다.
