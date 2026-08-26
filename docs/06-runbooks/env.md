# Environment

## Required

| 변수 | 공개 여부 | 용도 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | 공개 | `p3-api` Base URL |
| `NEXT_PUBLIC_APP_BASE_URL` | 공개 | 구매자 앱 도메인 `{domain}` |
| `NEXT_PUBLIC_COGNITO_DOMAIN` | 공개 | Cognito Hosted UI |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | 공개 | Cognito App Client |
| `NEXT_PUBLIC_COGNITO_REDIRECT_URI` | 공개 | Callback URI |
| `NEXT_PUBLIC_POINT3_ORIGIN` | 공개 | Point3 postMessage Origin 검증 |
| `NEXT_PUBLIC_ASSET_BASE_URL` | 공개 | CloudFront 이미지 도메인 `assets.{domain}` |

## Optional

| 변수 | 공개 여부 | 용도 |
| --- | --- | --- |
| `NEXT_PUBLIC_MSW_ENABLED` | 공개 | 개발·데모 Mock 활성화 |
| `NEXT_PUBLIC_APP_ENV` | 공개 | local, staging, production 표시 |

## Rules

- API 비밀키, Point3 Bearer Token, AWS 관리 권한은 프론트 환경변수에 넣지 않는다.
- Point3 `targetOrigin`은 `NEXT_PUBLIC_POINT3_ORIGIN`과 정확히 비교한다.
- 환경별 값은 배포 환경에서 주입하고 소스에 비밀값을 커밋하지 않는다.
- 로컬 Cognito Hosted UI 테스트 시 Callback URL은 `http://localhost:3000/auth/callback`을 Cognito App Client Allowed callback URLs에 등록한다.
- 로컬 Cognito 로그아웃 테스트 시 Sign-out URL은 `http://localhost:3000/auth`를 Cognito App Client Allowed sign-out URLs에 등록한다.
