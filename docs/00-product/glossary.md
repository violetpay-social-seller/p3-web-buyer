# Glossary

| 용어 | 의미 | 비고 |
| --- | --- | --- |
| Buyer | 구매자 사용자 | 스토어 탐색, 상담, 주문서, 결제, 주문 확인을 수행한다. |
| Seller | 판매자 사용자 | 구매자 앱에서는 상담 상대와 스토어 소유자로 표시된다. |
| Operator | 운영 관리자 | 구매자 앱 구현 범위가 아니며 차단·비공개 같은 운영 조치 결과만 반영한다. |
| Store | 상담과 데이터 격리의 기본 단위 | 모든 문의는 상품이 아니라 스토어에 귀속된다. |
| Product Context | 상품 문의 채팅방에 표시되는 문의 상품 카드 | 상담 소유 대상을 바꾸지 않는 UX 문맥이다. |
| Inquiry | 스토어 상담방 | 일반 문의는 상품 카드 없음, 상품 문의는 `contextProduct`가 있을 수 있다. |
| Order Form | 판매자가 구성하고 구매자가 작성하는 동적 주문서 | `FieldType`별 렌더러와 검증을 사용한다. |
| Order Confirmation | 상담 후 판매자가 보내는 주문확인서 | 메뉴명, 옵션, 금액, 픽업 일시, 스토어명을 포함한다. |
| Payment Request | 주문확인서 기반 결제 요청 | 채팅방 카드로 표시된다. |
| Payment Attempt | Point3 결제 시도 | Capture Ready 후 백엔드 승인 결과를 최종 상태로 본다. |
| Order | 결제 승인 성공 시 생성되는 주문 기록 | 상품 현재값이 아니라 결제 당시 스냅샷을 표시한다. |
| Asset | 업로드 원본 파일 메타데이터 | 구매자 화면에는 Delivery URL만 노출한다. |
| p3-api | 백엔드 API | Cognito Access Token을 Bearer Token으로 받는다. |
