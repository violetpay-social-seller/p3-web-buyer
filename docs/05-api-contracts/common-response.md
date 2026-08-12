# Common Response

## Success

```ts
type ApiResponse<T> = {
  success: true;
  data: T;
  requestId?: string;
};

type Page<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
```

## Error

```ts
type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: { field: string; message: string }[];
  };
  requestId?: string;
};
```

- 401은 토큰 갱신 실패 후 Return URL과 함께 로그인으로 이동한다.
- 403은 접근 권한 없음 상태로 처리한다.
- 409는 최신 데이터 재조회 후 재확인을 요청한다.
- 422는 주문서와 폼 필드에 연결한다.
- 500 이상은 `requestId`와 재시도를 제공한다.

## Pagination

- 목록 API는 `page`, `size`, `totalElements`, `totalPages`를 포함한다.
- 구매자 모바일 목록은 Load More 또는 Infinite Query를 기본으로 검토한다.
- 검색어, 필터, 정렬, 페이지는 URL Search Params와 동기화한다.
