# Design System

## 방향

구매자 앱은 모바일 우선의 상담·결제 흐름을 끊기지 않게 보여주는 것이 우선이다. 시각 스타일은 Figma 확정 전에도 기능 상태를 잃지 않아야 하며, Figma 적용 시 API, Query, 결제, 채팅 로직을 다시 작성하지 않는다.

## Tokens

Figma Variable은 다음 Semantic Token으로 매핑한다.

| Token | 용도 |
| --- | --- |
| `color.background` | 앱 배경 |
| `color.surface` | 입력, 목록, Dialog 표면 |
| `color.text.primary` | 주요 텍스트 |
| `color.text.secondary` | 보조 텍스트 |
| `color.border` | 구분선과 입력 테두리 |
| `color.action.primary` | 주요 CTA |
| `color.status.success` | 성공, 결제 완료 |
| `color.status.warning` | 확인 필요, 처리 중 |
| `color.status.danger` | 실패, 취소, 삭제 |
| `space.*` | 간격 |
| `radius.control` | 버튼, 입력 |
| `radius.surface` | 카드, Dialog |
| `shadow.overlay` | Dialog, Bottom Sheet |
| `font.body` | 본문 |
| `font.heading` | 화면 제목 |

- 컴포넌트에서 HEX와 고정 픽셀 값을 반복하지 않는다.
- 상태 색상은 의미 Token을 사용하고 색상만으로 상태를 구분하지 않는다.
- Light Theme만 확정되어도 Token 구조는 유지한다.

## Components

- Button, IconButton, Input, Textarea, Checkbox, RadioGroup, Select, DatePicker, TimePicker, Dialog, Drawer, Toast, Skeleton, EmptyState를 공용 Primitive로 둔다.
- StoreCard, StoreHero, ProductCard, ProductGallery, InquiryListItem, MessageList, MessageComposer, DynamicOrderForm, ConfirmationCard, PaymentRequestCard, Point3PaymentFrame, OrderTimeline은 기능 계약을 가진 도메인 컴포넌트다.
- Icon Button에는 접근 가능한 이름과 Tooltip을 제공한다.
- Figma에 누락된 로딩, 빈 상태, 오류, 결과 확인 필요, 이미지 없음 상태도 구현에서 제거하지 않는다.
