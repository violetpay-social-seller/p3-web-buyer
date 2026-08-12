# Auth API Contract

## Endpoints

| 작업 | Method·URI | 책임 |
| --- | --- | --- |
| 회원 동기화 | `POST /auth/me/sync` | Cognito 사용자와 로컬 회원을 연결하고 역할을 반환 |
| 현재 회원 조회 | `GET /auth/me` | 현재 로그인 사용자, 역할, 상태 반환 |

## DTO

```ts
type UserRole = "BUYER" | "SELLER" | "OPERATOR";
type UserStatus = "ACTIVE" | "BLOCKED" | "WITHDRAWN";

type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  storeId?: string;
};
```

## Flow

1. 사용자가 Cognito Authorization Code + PKCE 로그인을 시작한다.
2. `/auth/callback`에서 Code 교환을 완료한다.
3. `POST /auth/me/sync`를 호출한다.
4. `BUYER`는 `/`, `SELLER`는 판매자 도메인, `OPERATOR`는 운영자 도메인으로 이동한다.
5. `BLOCKED` 또는 `WITHDRAWN`은 접근 제한 상태로 처리한다.

## Errors

- 401: Cognito 토큰 없음, 만료, 갱신 실패
- 403: 역할 불일치 또는 차단 사용자
- 409: 동일 이메일·역할 정책 충돌
