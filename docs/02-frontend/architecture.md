# Frontend Architecture

## 목표

구매자 앱은 공개 탐색과 인증 구매자 흐름을 함께 다룬다. UI와 기능 로직을 분리해 임시 UI, Figma 적용 UI, 실제 API 연결 단계가 같은 타입·상태·Mutation 계약을 공유해야 한다.

## 버전·라이브러리 기준

| 용도 | 기준 |
| --- | --- |
| Runtime | Node.js `24.18.0` LTS 기준점 |
| Framework | Next.js `16.2.11` Active LTS 기준점 |
| UI Runtime | React·React DOM `19.2.7` Stable 기준점 |
| Language | TypeScript 5.x strict |
| Router | Next.js App Router |
| Package Manager | pnpm |
| Styling | Tailwind CSS 4 + CSS Variables |
| 서버 상태 | TanStack Query 5 |
| 폼·검증 | React Hook Form + Zod |
| REST | 공통 Fetch Client |
| 실시간 | `@stomp/stompjs` |
| Mock | MSW 2 |
| 테스트 | Vitest, Testing Library, Playwright |

위 버전은 2026-08-12 문서 기준점이다. 프로젝트 생성 시 같은 안정 계열의 최신 보안 패치가 있으면 적용하고 lockfile로 고정한다. Canary, RC, 실험 기능은 사용하지 않는다.

## 폴더 구조

```text
src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   └── (buyer)/
├── features/
│   ├── auth/
│   ├── discovery/
│   ├── inquiry/
│   ├── order-form/
│   ├── payment/
│   ├── order/
│   └── notification/
├── entities/
│   ├── user/
│   ├── store/
│   ├── product/
│   ├── inquiry/
│   ├── payment/
│   └── order/
├── shared/
│   ├── api/
│   ├── auth/
│   ├── realtime/
│   ├── payment/
│   ├── ui/
│   ├── lib/
│   └── config/
└── mocks/
```

## 경계

- `app`은 라우팅, Layout, Provider, Feature 조립만 담당한다.
- `features`가 API 호출 Hook, Mutation, 폼 제출, 후속 이동, Query 무효화를 조율한다.
- `entities`는 DTO, View Model, Enum Label Mapping처럼 도메인 표시 기준을 가진다.
- `shared`는 비즈니스 도메인을 import하지 않는다.
- UI Primitive는 API Client, Query Key, 라우트, 도메인 Enum을 직접 알지 않는다.
- Figma Dev Code는 시각 구조만 추출하고 인증, 결제, STOMP, Query 로직을 소유하지 않는다.

## 렌더링 기준

- 공개 스토어·상품 페이지는 Server Component를 기본으로 검토한다.
- TanStack Query, STOMP, Cognito SDK, Point3 iframe, 파일 업로드는 Client Component 경계 안에 둔다.
- `use client`는 페이지 전체가 아니라 상호작용이 필요한 컴포넌트에 둔다.
- 브라우저 전용 객체를 서버 모듈에서 import하지 않는다.
