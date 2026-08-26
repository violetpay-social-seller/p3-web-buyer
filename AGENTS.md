# AGENTS.md

`p3-web-buyer`는 `p3-api`의 구매자용 프론트엔드입니다.

## Workspace References

- 프론트엔드 작업 경로: `/Users/kimminseo/Desktop/violetpay-social-seller/p3-web-buyer`
- 기획 및 제품 문서 경로: `/Users/kimminseo/Library/Mobile Documents/iCloud~md~obsidian/Documents/MyKnowledge/socialseller`
- 백엔드 실제 구현 확인 경로: `/Users/kimminseo/Desktop/violetpay-social-seller/p3-api`

## Mandatory Reading Order

작업 시작 전에 아래 순서로 문서를 확인합니다.

1. `docs/onboarding.md`
2. `docs/00-product/overview.md`
3. `docs/00-product/scope.md`
4. `docs/02-frontend/ai-rules.md`
5. `docs/02-frontend/architecture.md`
6. `docs/03-design/design-system.md`
7. 관련 `docs/04-screens/*.md`
8. API 작업이면 관련 `docs/05-api-contracts/*.md`
9. 실행, 환경변수, 배포 이슈면 관련 `docs/06-runbooks/*.md`

## Required Workflow

새 기능, 수정, 리팩터링 작업은 아래 순서를 따릅니다.

1. `docs/onboarding.md` 확인
2. 관련 screen 문서 확인
3. API가 필요하면 api-contract 확인
4. 구현 전 문서에 없는 결정사항이 있으면 먼저 docs에 추가
5. 구현
6. `typecheck`, `lint`, `build` 실행
7. 구현 결과 때문에 바뀐 규칙이 있으면 docs 업데이트

검증 명령이 아직 정해지지 않았으면 `docs/06-runbooks/local-dev.md`에 결정 필요 항목으로 남깁니다.

## Documentation Rules

- 제품 설명, 구현 규칙, API 계약, 작업 로그를 섞지 않습니다.
- 코드 복붙은 최소화합니다.
- 왜 이렇게 했는지는 `docs/01-decisions/`의 ADR에 기록합니다.
- 어떻게 작업하는지는 `docs/02-frontend/workflow.md` 또는 `docs/06-runbooks/`에 기록합니다.
- 무엇이 가능한지는 `docs/00-product/scope.md`에 기록합니다.
- 화면이 뭘 해야 하는지는 `docs/04-screens/`에 기록합니다.
- AI가 하지 말아야 할 것은 `docs/02-frontend/ai-rules.md`와 `docs/03-design/anti-ai-design.md`에 기록합니다.
- 임시 메모는 `docs/07-work-log/`에만 둡니다.
- 확정된 정책은 `docs/07-work-log/`에 남겨두지 말고 관련 문서나 ADR로 승격합니다.

## Implementation Guardrails

- 문서에 없는 기능, 화면, 정책을 임의로 만들지 않습니다.
- MVP 제외 기능을 구현하지 않습니다.
- API 계약이 없으면 영구 코드처럼 mock을 만들지 않습니다.
- 인증과 권한을 우회하지 않습니다.
- loading, empty, error 상태를 함께 고려합니다.
- 의미 없는 대시보드 위젯, 가짜 통계, 임의 차트를 추가하지 않습니다.
- 디자인은 `docs/03-design/` 기준을 따릅니다.
