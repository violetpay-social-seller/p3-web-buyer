# ADR-0004 Auth Strategy

## Status

Accepted.

## Context

회원가입과 로그인 인증은 AWS Cognito를 사용한다. 구매자와 판매자 계정은 분리되며, 로그인 후 역할별 도메인으로 이동해야 한다.

## Decision

- Cognito Authorization Code + PKCE를 사용한다.
- 로그인 성공 후 `/auth/me/sync`를 호출해 로컬 회원과 역할을 동기화한다.
- 구매자는 `/`, 판매자는 판매자 도메인, 운영자는 운영자 도메인으로 이동한다.
- 백엔드 API 호출에는 Access Token을 Bearer Token으로 전달한다.
- 401은 토큰 갱신 또는 재로그인, 403은 접근 권한 없음으로 처리한다.
- 앱 내부 아이디 찾기, 비밀번호 찾기, 비밀번호 재설정은 구현하지 않는다.

## Consequences

- Return URL 보존이 필요하다.
- 페이지가 직접 토큰 스토리지를 읽지 않고 Auth Adapter를 사용해야 한다.
- 차단·탈퇴 상태는 구매자 화면 접근을 제한해야 한다.
