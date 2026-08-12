# Troubleshooting

## Known Issues

| 증상 | 우선 확인 |
| --- | --- |
| 로그인 후 원래 화면으로 돌아오지 않음 | Return URL 저장·복원 |
| 구매자 전용 화면에서 403 | `/auth/me/sync` 역할과 사용자 상태 |
| 상품 문의인데 상품 카드 없음 | `contextProduct` 응답과 상품 물리 삭제 여부 |
| 결제 완료처럼 보였지만 주문 없음 | `POINT3_CAPTURE_READY`만 처리했는지, 백엔드 승인 결과 확인 |
| 채팅 메시지 중복 | REST와 STOMP 중복 제거 기준 Message ID |
| 주문서 제출 실패 | 동적 Field 설정, Asset 업로드 완료 여부, 409 양식 변경 |

## Diagnosis

- API 응답의 `requestId`를 기록한다.
- Query Key와 URL Search Params가 기대 범위인지 확인한다.
- Point3 메시지는 Origin, Source, Session ID, Attempt ID를 확인한다.
- 개인정보, 토큰, 결제 식별값은 로그에 남기지 않는다.

## Recovery

- 401은 토큰 갱신 후 실패 시 로그인으로 이동한다.
- 409는 최신 데이터를 다시 불러오고 사용자 재확인을 요청한다.
- `RESULT_UNKNOWN` 결제는 자동 재승인하지 않고 결과 조회 화면을 제공한다.
