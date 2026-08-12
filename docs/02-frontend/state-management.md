# State Management

## 서버 상태

- 서버 데이터는 TanStack Query로 관리한다.
- 목록, 상세, 메시지 이력, 주문, 결제, 알림은 Query Key 기준으로 캐시한다.
- Mutation 성공 후 관련 Query Key를 무효화하거나 응답으로 캐시를 갱신한다.
- 검색어는 300ms 내외 Debounce 후 요청한다.
- 필터, 정렬, 페이지는 URL Search Params에 저장해 새로고침과 공유에 유지한다.
- 검색 조건 변경 시 페이지를 첫 페이지로 되돌린다.

## 클라이언트 상태

- 전역 클라이언트 상태 라이브러리는 기본으로 추가하지 않는다.
- URL 상태는 Search Params, 폼은 React Hook Form, 단순 UI 상태는 컴포넌트 상태로 관리한다.
- 인증 토큰 저장·갱신은 Auth Adapter가 담당하고 페이지가 직접 스토리지를 읽지 않는다.
- Point3 활성 Attempt ID는 늦게 도착한 이전 이벤트가 현재 화면을 바꾸지 않게 비교한다.
- STOMP 연결 상태는 채팅 Feature 내부에서 관리하고, 과거 메시지는 REST Query로 보완한다.

## 폼 상태

- 동적 주문서는 React Hook Form + Zod로 검증한다.
- 구매자 실제 작성과 판매자 미리보기는 같은 Field Renderer 계약을 사용한다.
- 제출 중 양식이 변경돼 409가 발생하면 최신 양식을 다시 불러오고 재확인을 요청한다.
- 업로드 진행 중인 이미지가 있으면 주문서 제출을 막는다.
