# Accessibility

## Keyboard

- Navigation, Dialog, 동적 폼, 이미지 업로드, Point3 결제 시작은 키보드만으로 접근 가능해야 한다.
- Dialog와 Bottom Sheet는 포커스를 내부에 가두고 닫으면 시작 요소로 복귀한다.
- 처리 중 닫을 수 없는 Overlay는 이유와 진행 상태를 표시한다.

## Screen Reader

- 모든 입력은 Label과 오류 메시지를 연결한다.
- IconButton에는 접근 가능한 이름을 제공한다.
- 채팅 신규 메시지, 결제 상태 변경, 주문서 제출 결과는 적절한 live region을 검토한다.

## Visual

- 상태는 색상만으로 구분하지 않고 텍스트 또는 아이콘을 함께 사용한다.
- 모바일 터치 영역은 충분한 크기를 유지한다.
- 긴 텍스트, 이미지 없음, 다중 첨부에서도 콘텐츠가 겹치지 않아야 한다.
