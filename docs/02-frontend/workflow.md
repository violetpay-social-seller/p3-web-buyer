# Workflow

## 구현 순서

1. `docs/onboarding.md`와 대상 화면 문서를 읽는다.
2. 관련 API 계약과 상태·에러 처리 기준을 확인한다.
3. 문서에 없는 결정사항이 있으면 먼저 docs에 `결정 필요`로 남기거나 확정 문서로 승격한다.
4. DTO, Query Key, API Adapter, MSW Handler를 같은 계약으로 맞춘다.
5. 기능 Hook과 Mutation을 만든 뒤 화면 컴포넌트에 Callback으로 연결한다.
6. 정상, 로딩, 빈 상태, 오류, 권한 없음, 긴 데이터, 이미지 없음 상태를 확인한다.
7. 구현 결과 때문에 바뀐 규칙이 있으면 docs를 업데이트한다.

## 완료 기준

- TypeScript strict 기준으로 타입 오류가 없어야 한다.
- 가능한 경우 `typecheck`, `lint`, `build`를 실행한다.
- 구매자 모바일 360px 이상에서 핵심 행동이 가려지지 않아야 한다.
- 실제 API가 없을 때는 MSW로 D-01 인증, D-02 일반 문의, D-03 상품 문의와 주문서, D-04 결제 성공, D-05 결제 실패·결과 확인 필요, D-07 취소·환불의 구매자 부분을 검증한다.
- MSW를 끄고 Base URL만 설정하면 실제 API Adapter로 전환할 수 있어야 한다.

## 검증 명령

프로젝트 코드가 아직 생성되지 않았으므로 확정 명령은 없다. 프로젝트 생성 후 `docs/06-runbooks/local-dev.md`에 install, dev, typecheck, lint, build 명령을 기록한다.
