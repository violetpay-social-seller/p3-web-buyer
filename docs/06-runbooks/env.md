# Environment

## Required

| 변수 | 공개 여부 | 용도 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | 공개 | `p3-api` Base URL |
| `NEXT_PUBLIC_APP_BASE_URL` | 공개 | 구매자 앱 도메인 `{domain}` |
| `NEXT_PUBLIC_COGNITO_DOMAIN` | 공개 | Cognito Hosted UI |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | 공개 | Cognito App Client |
| `NEXT_PUBLIC_COGNITO_REDIRECT_URI` | 공개 | Callback URI |
| `NEXT_PUBLIC_ASSET_BASE_URL` | 공개 | CloudFront 이미지 도메인 `assets.{domain}` |

## Optional

| 변수 | 공개 여부 | 용도 |
| --- | --- | --- |
| `NEXT_PUBLIC_POINT3_SDK_URL` | 공개 | Point3 npm loader용 SDK URL. 기본값은 `https://widget.point3.io/v2/standard?loader=toss` |
| `NEXT_PUBLIC_POINT3_ORIGIN` | 공개 | 이전 iframe/postMessage 연동 호환값. JavaScript SDK 결제창 흐름에서는 사용하지 않음 |
| `NEXT_PUBLIC_MSW_ENABLED` | 공개 | 개발·데모 Mock 활성화 |
| `NEXT_PUBLIC_APP_ENV` | 공개 | local, staging, production 표시 |

## Rules

- API 비밀키, Point3 Bearer Token, AWS 관리 권한은 프론트 환경변수에 넣지 않는다.
- Point3 JavaScript SDK는 `@tosspayments/tosspayments-sdk@2.7.1`의 `loadTossPayments()`로 로드한다.
- Point3 `client-...` 형식 client_id는 프론트 env가 아니라 결제 준비 API 응답의 `clientId`를 사용한다.
- SDK URL에는 `.js`를 붙이지 않고, npm loader 방식에서는 `loader=toss`를 포함한다.
- `POINT3_API_TOKEN`은 백엔드 전용 비밀값이므로 프론트 환경변수에 넣지 않는다.
- 환경별 값은 배포 환경에서 주입하고 소스에 비밀값을 커밋하지 않는다.
- 로컬 Cognito Hosted UI 테스트 시 Callback URL은 `http://localhost:3000/auth/callback`을 Cognito App Client Allowed callback URLs에 등록한다.
- 로컬 Cognito 로그아웃 테스트 시 Sign-out URL은 `http://localhost:3000/auth`를 Cognito App Client Allowed sign-out URLs에 등록한다.
