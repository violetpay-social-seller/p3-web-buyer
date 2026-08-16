# Auth API Contract

## Endpoints

| 작업 | Method·URI | 책임 |
| --- | --- | --- |
| 회원 동기화 | `POST /auth/me/sync` | Cognito 사용자와 로컬 회원을 연결하고 역할을 반환 |
| 회원 역할 등록 | `POST /auth/me/registration` | Cognito 사용자 클레임과 선택 역할을 연결해 회원 등록을 완료 |
| 현재 회원 조회 | `GET /auth/me` | 현재 로그인 사용자, 역할, 상태 반환 |

## Token Rules

- `POST /auth/me/sync`와 `POST /auth/me/registration`은 백엔드가 JWT의 `email`, `name` claim을 읽으므로 Cognito `id_token`을 `Authorization: Bearer <id_token>`으로 전달한다.
- 일반 인증 API와 인증이 필요한 리소스 API는 Cognito `access_token`을 `Authorization: Bearer <access_token>`으로 전달한다.

## DTO

```ts
type UserRole = "BUYER" | "SELLER" | "OPERATOR";
type UserStatus = "ACTIVE" | "BLOCKED" | "WITHDRAWN";

type AuthSyncResponse = {
  registered: boolean;
  registrationRequired: boolean;
  role: UserRole | null;
  status: UserStatus | null;
  nextRoute: "ROLE_SELECTION" | "BUYER_HOME" | "SELLER_HOME" | "ADMIN_HOME";
};
```

## Flow

1. 사용자가 Cognito Authorization Code + PKCE 로그인을 시작한다.
2. `/auth/callback`에서 Code 교환을 완료한다.
3. `id_token`으로 `POST /auth/me/sync`를 호출해 등록 여부를 확인한다.
4. 신규 사용자는 역할 선택 이후 `id_token`과 `{ "role": "seller" }` 또는 `{ "role": "buyer" }`로 `POST /auth/me/registration`을 호출한다.
5. `BUYER`는 `/`, `SELLER`는 판매자 도메인, `OPERATOR`는 운영자 도메인으로 이동한다.
6. `BLOCKED` 또는 `WITHDRAWN`은 접근 제한 상태로 처리한다.

## Errors

- 401: Cognito 토큰 없음, 만료, 갱신 실패
- 403: 역할 불일치 또는 차단 사용자
- 409: 동일 이메일·역할 정책 충돌
