# User API Contract

## Endpoints

| 작업 | Method·URI | 책임 |
| --- | --- | --- |
| 현재 회원 조회 | `GET /auth/me` | 내 정보, 역할, 상태 조회 |
| 회원 정보 수정 | `PATCH /me` | 이름, 닉네임, 프로필 이미지 등 수정 |
| 알림 설정 조회·수정 | `GET/PATCH /me/notification-settings` | 알림 수신 설정 |
| 로그아웃 | Cognito 로그아웃 | 세션과 토큰 정리 |
| 회원 탈퇴 | `POST /me/withdraw` | 로컬 회원과 Cognito 계정 상태 동기화 |

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
  profileImage?: ImageSource;
};
```

## Errors

- 401: 인증 필요 또는 토큰 갱신 실패
- 403: 구매자 권한 아님 또는 차단 상태
- 409: 회원 상태 변경 충돌
- 422: 회원 정보 입력 오류
