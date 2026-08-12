# ADR-0001 Frontend Stack

## Status

Accepted, 2026-08-12 기준.

## Context

구매자 앱은 공개 탐색, 인증, 채팅, 동적 주문서, Point3 결제, 주문·결제 조회를 포함한다. Figma 디자인 적용 전후에도 API와 상태 로직이 유지되어야 하며 TypeScript 단계에서 계약 오류를 잡아야 한다.

## Decision

- Next.js App Router, React, TypeScript strict를 사용한다.
- Node.js `24.18.0`, Next.js `16.2.11`, React `19.2.7`을 기준점으로 삼고 안정 계열 보안 패치를 lockfile로 고정한다.
- Package Manager는 npm을 사용한다.
- Styling은 Tailwind CSS 4 + CSS Variables를 사용한다.
- 서버 상태는 TanStack Query 5, 폼은 React Hook Form + Zod, Mock은 MSW 2, 실시간은 `@stomp/stompjs`를 사용한다.
- 접근 가능한 Primitive는 Radix UI 또는 동등한 Headless Primitive를 사용하고 아이콘은 Lucide React를 우선한다.

## Consequences

- UI 교체와 기능 로직 변경을 분리할 수 있다.
- `use client` 경계를 신중히 나눠야 한다.
- 프로젝트 생성 후 실제 설치 버전과 명령은 runbook에 기록해야 한다.
