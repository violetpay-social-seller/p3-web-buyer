# UI Rules

## Layout

- 구매자 화면은 360px 폭부터 검증한다.
- 고정 Header, Bottom Navigation, 하단 CTA가 콘텐츠와 브라우저 Safe Area를 가리지 않게 한다.
- 스토어명, 상품명, 옵션, 메시지, 결제 금액이 길어도 주요 CTA가 밀려 사라지지 않아야 한다.
- 이미지 없는 스토어·상품에는 Placeholder와 Alt 기준을 제공한다.

## Components

- Button은 명확한 명령에만 사용하고, 도구성 행동은 가능한 Lucide IconButton과 Tooltip을 사용한다.
- 동적 주문서 Field는 Label, 도움말, 오류 메시지가 프로그램적으로 연결되어야 한다.
- 주문확인서, 결제요청, 주문 상태는 카드로 표시하되 카드 안에 또 다른 장식 카드를 중첩하지 않는다.
- 결제 Overlay는 iframe, 로딩, 실패, 결과 확인 필요, 닫기 확인 상태를 가진다.

## States

- Initial, Loading, Success, Empty, Error, Refreshing을 구분한다.
- 전송 실패 메시지는 같은 Client Message ID로 재전송할 수 있어야 한다.
- 상담 종료 상태에서는 이전 메시지는 조회하되 새 메시지, 주문서, 결제 행동을 막는다.
- `CaptureReady`는 성공이 아니라 서버 승인 요청 가능 상태로 표시한다.
