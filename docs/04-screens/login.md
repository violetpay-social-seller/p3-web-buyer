# Login

## 목적

통합 로그인과 Cognito 인증 진입을 제공하고, 로그인 후 역할에 맞는 도메인으로 이동한다.

## 접근 권한

공개 접근 가능.

## 주요 섹션

- 이메일 또는 Google 로그인 시작
- 회원가입과 역할 선택 진입
- Return URL 안내
- 인증 실패와 취소 상태

## 사용자 액션

- Cognito Authorization Code + PKCE 로그인 시작
- 역할 선택 후 회원가입
- 인증 취소 후 이전 공개 화면 복귀

## 데이터

Cognito Provider, Return URL, `CurrentUser`

## Loading 상태

Callback과 `/auth/me/sync` 처리 중 진행 상태와 재시도를 표시한다.

## Empty 상태

해당 없음.

## Error 상태

인증 실패, 토큰 교환 실패, 회원 동기화 실패, 차단 사용자 상태를 구분한다.

## 구현 금지

앱 내부 아이디 찾기, 비밀번호 찾기, 비밀번호 재설정을 구현하지 않는다.

## 완료 기준

구매자는 홈, 판매자와 운영자는 각 역할 도메인 또는 접근 정책에 맞는 경로로 이동한다.

## 결정 필요

실제 `{domain}` 값이 확정되면 Cognito Redirect URI와 역할별 이동 URL을 갱신한다.
