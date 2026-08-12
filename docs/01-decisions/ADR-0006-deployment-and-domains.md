# ADR-0006 Deployment and Domains

## Status

Accepted.

## Context

이번 프로젝트에서는 백엔드 담당자가 프론트엔드도 겸한다. 구매자, 판매자, 운영 관리자 프론트는 역할과 배포 단위를 분리해야 하며, 프론트 배포는 Vercel을 사용한다.

## Decision

- `p3-web-buyer`와 `p3-web-admin`은 독립 프론트엔드 앱으로 관리한다.
- 구매자 공개 서비스와 구매자 로그인 영역은 `{domain}`에서 제공한다.
- 공개 스토어·상품은 `{domain}/stores/...`에서 제공한다.
- 구매자 상담은 `{domain}/inquiries`, 구매자 주문은 `{domain}/orders`에서 제공한다.
- 판매자 관리는 `seller.{domain}`에서 제공한다.
- 운영 관리는 `admin.{domain}`에서 제공한다.
- 백엔드 API는 `api.{domain}`에서 제공한다.
- CloudFront 이미지 자산은 `assets.{domain}`에서 제공한다.
- 프론트 배포 대상은 Vercel이다.
- API prefix 세부 규칙은 백엔드 Controller와 맞춰 나중에 확정한다.

## Consequences

- 구매자 앱 라우팅 문서는 현재 문서상 경로를 그대로 따른다.
- 관리자 앱은 Vercel 프로젝트와 도메인을 구매자 앱과 분리한다.
- Cognito Redirect URI와 CORS 허용 Origin은 도메인 구조 확정값을 기준으로 설정해야 한다.
- ECS, ECR, Next.js Docker standalone 배포는 프론트 배포 기준에서 제외한다.
