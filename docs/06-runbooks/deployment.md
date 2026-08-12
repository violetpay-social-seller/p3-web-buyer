# Deployment

## Target

- 프론트 배포 대상은 Vercel이다.
- `p3-web-buyer`는 독립 Vercel 프로젝트로 배포한다.
- 구매자 공개 서비스와 구매자 로그인 영역은 `{domain}`에서 제공한다.
- 공개 스토어·상품은 `{domain}/stores/...`에서 제공한다.
- 구매자 상담은 `{domain}/inquiries`, 구매자 주문은 `{domain}/orders`에서 제공한다.
- 백엔드 API는 `api.{domain}`, 이미지 자산은 `assets.{domain}`를 사용한다.

## Commands

프로젝트 생성 후 실제 CI/CD에 맞춰 확정한다.

```sh
pnpm build
```

## Verification

- Vercel 환경변수의 API Base URL이 `https://api.{domain}` 계열인지 확인한다.
- Cognito Redirect URI가 구매자 도메인과 일치하는지 확인한다.
- 공개 스토어·상품 조회가 동작하는지 확인한다.
- 로그인 후 `/auth/me/sync`와 구매자 역할 이동이 동작하는지 확인한다.
- Point3 postMessage Origin 검증과 결과 확인 필요 상태를 확인한다.
