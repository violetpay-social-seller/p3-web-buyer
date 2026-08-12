# Asset API Contract

## Endpoints

| 작업 | Method·URI | 책임 |
| --- | --- | --- |
| 이미지 업로드 | `POST /assets` | 채팅 첨부와 주문서 이미지 필드용 Asset 생성 |

## DTO

```ts
type ImageSource = {
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  alt: string;
};

type AssetUploadResponse = {
  assetId: string;
  originalUrl?: string;
  variants?: ImageSource;
  status: "PROCESSING" | "READY" | "FAILED";
};
```

## Rules

- 프론트는 업로드 완료 응답의 `assetId`를 폼 값으로 사용한다.
- 공개 조회에서는 Asset ID로 이미지를 다시 요청하지 않고 도메인 DTO의 Delivery URL을 사용한다.
- Variant 생성 중에는 로컬 Preview 또는 처리 중 Placeholder를 표시한다.
- 업로드 실패 시 해당 파일만 재시도하거나 제거한다.
- 폼 제출 전 업로드 진행 중인 파일이 있으면 제출을 막는다.

## Errors

- 413: 파일 용량 초과
- 415: 허용하지 않는 MIME Type
- 422: 이미지 개수 또는 필드 정책 위반
