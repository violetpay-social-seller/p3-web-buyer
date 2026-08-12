# Components

## UI Primitive

| 분류 | 컴포넌트 |
| --- | --- |
| 행동 | Button, IconButton, LinkButton |
| 입력 | Input, Textarea, Checkbox, RadioGroup, Select, Switch |
| 날짜 | DatePicker, TimePicker, DateTimePicker |
| 표시 | Text, Heading, Badge, Avatar, Separator, Tooltip |
| 피드백 | Alert, Toast, Progress, Skeleton, EmptyState |
| Overlay | Dialog, AlertDialog, Drawer, Popover, DropdownMenu |
| 탐색 | Tabs, Pagination, Breadcrumb, Navigation |
| 데이터 | DataList, KeyValueList |
| 미디어 | Image, ImageUploader, Gallery, AttachmentList |

Primitive는 API 호출, Query Key, 라우트와 도메인 Enum을 직접 알지 않는다.

## 도메인 컴포넌트

| 컴포넌트 | 책임 |
| --- | --- |
| StoreCard | 스토어 요약과 상세 이동 |
| StoreHero | 배너·프로필·스토어명·공개 정보 |
| ProductCard | 대표 이미지, 이름과 허용된 가격 표시 |
| ProductGallery | 대표·상세 이미지 전환 |
| InquiryListItem | 스토어·상품 컨텍스트·마지막 메시지·읽지 않음 표시 |
| InquiryHeader | 스토어와 선택적 상품 카드 표시 |
| MessageList | 과거 로딩, Scroll Anchor와 신규 메시지 반영 |
| MessageComposer | 텍스트·이미지 작성과 전송 |
| DynamicOrderForm | Field Definition 정렬·렌더링·제출 |
| ConfirmationCard | 주문확인서 요약과 상세 열기 |
| PaymentRequestCard | 금액·상태와 결제 행동 |
| Point3PaymentFrame | iframe 생성, 메시지 검증과 정리 |
| OrderTimeline | 현재 주문 상태와 완료 단계 표시 |

## 완료 기준

- 정상, 로딩, 오류, 비활성화 상태를 Story 또는 테스트로 확인한다.
- 긴 한글·영문, 빈 이미지와 여러 줄 옵션에서 Overflow가 없어야 한다.
- 입력 오류와 도움말이 Label에 연결돼야 한다.
- 비즈니스 Mutation은 Feature가 소유하고 표현 컴포넌트는 Callback을 받는다.
