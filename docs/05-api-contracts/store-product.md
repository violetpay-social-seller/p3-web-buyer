# Store API Contract

## Endpoints

`p3-api` 실제 컨트롤러 기준이다. 문서에 없는 상품 API를 프론트에서 임의 호출하지 않는다.

| 작업 | Method·URI | 책임 |
| --- | --- | --- |
| 스토어 상세 | `GET /stores/{slug}` | 공개 스토어 정보 조회 |
| 스토어 대표 이미지 | `GET /stores/{slug}/representative-images` | 공개 대표 이미지 목록 |
| 스토어 갤러리 목록 | `GET /stores/{slug}/gallery-items` | 공개 갤러리 목록 |
| 스토어 갤러리 상세 | `GET /stores/{slug}/gallery-items/{galleryItemId}` | 공개 갤러리 단건 |
| 공개 주문서 양식 | `GET /stores/{slug}/order-form` | 스토어의 활성 주문서 양식 |

## DTO

```ts
type StoreStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | string;
type ImageStatus = "ACTIVE" | "INACTIVE" | string;

type Store = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  status: StoreStatus;
};

type RepresentativeImage = {
  id: string;
  assetId: string;
  imageUrl: string;
  alt?: string | null;
  sortOrder: number;
  status: ImageStatus;
};

type GalleryItem = {
  id: string;
  assetId: string;
  imageUrl: string;
  title?: string | null;
  description?: string | null;
  sortOrder: number;
  status: ImageStatus;
};
```

## Rules

- 구매자 프론트는 `GET /stores` 목록 API와 `GET /stores/{slug}/products/{id}` 상품 상세 API가 있다고 가정하지 않는다.
- 스토어 목록, 상품 목록, 상품 상세 화면은 백엔드 API가 생기기 전까지 영구 기능처럼 구현하지 않는다.
- Figma에 해당 화면이 있어도 데이터 계약이 없으면 정적 mock을 제품 코드로 고정하지 않는다.
- 문의 시작은 상품 ID가 아니라 스토어 slug 기준 `POST /stores/{slug}/inquiries/open`을 사용한다.
