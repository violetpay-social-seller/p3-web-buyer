# Mock and Figma Rules

## Mock 원칙

- Handler는 `05-api-contracts/`와 같은 DTO를 반환한다.
- Mock 전용 타입을 만들지 않고 실제 API 타입을 사용한다.
- 고정 Fixture와 시나리오 상태를 분리한다.
- 정상 응답만 만들지 않고 빈 상태, 지연, 오류를 선택할 수 있게 한다.

## 필수 구매자 데모 시나리오

- D-01 인증과 역할 이동
- D-02 일반 문의
- D-03 상품 문의와 주문서
- D-04 확인서와 결제 성공
- D-05 결제 실패·결과 확인 필요
- D-07 취소·환불의 구매자 확인 흐름

## Figma 수용 규칙

- 색상, Typography, Spacing Token, UI Primitive, Layout은 교체 가능하다.
- DTO, Query Key, Mutation, Cognito Auth Adapter, STOMP 중복 제거, Point3 메시지 검증과 상태 전이는 유지한다.
- 생성 코드가 페이지 내부에서 직접 Fetch하지 않게 한다.
- 생성 코드의 SVG Icon은 Lucide에 같은 아이콘이 있으면 교체한다.
- Figma Frame 크기를 그대로 고정 Width로 사용하지 않는다.
- 버튼, Dialog, Input은 기존 접근 가능한 Primitive 위에 Style을 적용한다.
