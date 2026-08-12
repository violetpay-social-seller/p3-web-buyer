# Onboarding

작업 시작 전에 아래 순서로 문서를 확인합니다.

1. `00-product/overview.md`
2. `00-product/scope.md`
3. `02-frontend/ai-rules.md`
4. `02-frontend/architecture.md`
5. `02-frontend/data-models.md`
6. `03-design/design-system.md`
7. 관련 `04-screens/*.md`
8. API 작업이면 관련 `05-api-contracts/*.md`
9. 실행이나 배포 이슈면 관련 `06-runbooks/*.md`

## 작업 프로세스

1. `docs/onboarding.md` 확인
2. 관련 screen 문서 확인
3. API 필요하면 api-contract 확인
4. 구현 전 문서에 없는 결정사항이 있으면 먼저 docs에 추가
5. 구현
6. `typecheck`, `lint`, `build`
7. 구현 결과 때문에 바뀐 규칙이 있으면 docs 업데이트

## 전역 정책

작업 전에 아래 항목이 정해져 있는지 확인합니다.

- MVP 포함/제외 범위
- 라우팅 방식
- 인증 방식
- 상태관리 기준
- API client 구조
- 데이터 모델과 Enum 표시 기준
- 에러 처리 정책
- 디자인 방향
- 공용 컴포넌트 기준
- 폴더/import 규칙
- 환경변수 분리
- loading/empty/error 상태 기준
- 접근성 기준
- 배포/검증 명령
- AI 구현 금지사항

## 문서 작성 원칙

- 제품 설명, 구현 규칙, API 계약, 작업 로그를 섞지 않습니다.
- 코드 복붙은 최소화합니다.
- 왜 이렇게 했는지는 `01-decisions/`의 ADR에 기록합니다.
- 어떻게 작업하는지는 `06-runbooks/`나 `02-frontend/workflow.md`에 기록합니다.
- 무엇이 가능한지는 `00-product/scope.md`에 기록합니다.
- 화면이 뭘 해야 하는지는 `04-screens/`에 기록합니다.
- AI가 하지 말아야 할 것은 `02-frontend/ai-rules.md`와 `03-design/anti-ai-design.md`에 기록합니다.
- 확정된 정책은 `07-work-log/`에 남기지 않고 관련 문서로 승격합니다.
