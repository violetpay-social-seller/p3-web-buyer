# ADR-0005 Design Direction

## Status

Accepted.

## Context

구매자 앱은 모바일 상담, 주문서, 결제 흐름이 핵심이다. 디자인 확정 전 임시 UI를 만들더라도 Figma 적용 시 결제, 채팅, API 로직이 흔들리면 안 된다.

## Decision

- 모바일 우선의 탐색·상담·결제 경험을 기준으로 설계한다.
- Figma 적용 시 색상, Typography, Spacing, Primitive, Layout은 교체 가능하지만 DTO, Query Key, Mutation, STOMP, Point3 상태 전이는 유지한다.
- 상태 색상은 Semantic Token을 사용한다.
- Figma에 누락된 로딩, 빈 상태, 오류, 결과 확인 필요, 이미지 없음 상태도 구현한다.

## Consequences

- Page Adapter 패턴으로 Feature Hook과 View를 분리해야 한다.
- 긴 스토어명, 상품명, 옵션, 메시지, 이미지 없음 상태를 디자인 QA에 포함해야 한다.
- 구매자 화면은 360px 폭부터 검증한다.
