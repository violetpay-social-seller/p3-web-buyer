# Store and Product API Contract

## Endpoints

| 작업 | Method·URI | 책임 |
| --- | --- | --- |
| 공개 스토어 목록 | `GET /stores` | 검색, 페이지, 공개 스토어 요약 |
| 스토어 상세 | `GET /stores/{slug}` | 공개 스토어 정보, 연락처·SNS 노출, 상품 목록 |
| 공개 상품 상세 | `GET /stores/{slug}/products/{id}` | 상품 이미지, 설명, 가격 정책, 옵션 |

## DTO

```ts
type StoreStatus = "PUBLIC" | "PRIVATE" | "SUSPENDED";
type ProductStatus = "PUBLIC" | "HIDDEN";
type SelectionType = "SINGLE" | "MULTIPLE";

type StoreSummary = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  profileImage?: ImageSource;
  status: StoreStatus;
};

type StoreDetail = StoreSummary & {
  bannerImage?: ImageSource;
  contact?: string;
  snsLinks: { type: string; url: string }[];
  businessHours?: Record<string, unknown>;
  address?: string;
  products: ProductSummary[];
};

type ProductSummary = {
  id: string;
  name: string;
  basePrice?: number;
  primaryImage?: ImageSource;
  status: ProductStatus;
};

type ProductDetail = ProductSummary & {
  description?: string;
  images: ImageSource[];
  optionGroups: ProductOptionGroup[];
};

type ProductOptionGroup = {
  id: string;
  name: string;
  selectionType: SelectionType;
  required: boolean;
  sortOrder: number;
  options: ProductOption[];
};

type ProductOption = {
  id: string;
  name: string;
  additionalPrice: number;
  active: boolean;
};
```

## Rules

- 비공개·운영 중지 스토어와 숨김 상품은 구매자 공개 화면에 노출하지 않는다.
- 상품 기본 가격과 옵션 가격의 노출 수준은 결정 필요 항목이다.
- 상품이 물리 삭제돼 기존 문의 컨텍스트가 없어지면 `삭제된 상품` Placeholder를 표시할 수 있다.
