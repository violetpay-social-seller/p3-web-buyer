# Dynamic Forms

## FieldType 렌더링

| FieldType | 구매자 입력 UI | 기본 값 형태 |
| --- | --- | --- |
| `TEXT` | 한 줄 Text Input | `string` |
| `TEXTAREA` | 여러 줄 Textarea | `string` |
| `NUMBER` | Number Input | `number` |
| `DATE` | Date Picker | `YYYY-MM-DD` |
| `TIME` | Time Picker | `HH:mm` |
| `DATETIME` | Date·Time Picker | ISO DateTime |
| `SINGLE_SELECT` | Radio Group 또는 Select | Option `value` 하나 |
| `MULTI_SELECT` | Checkbox Group | Option `value` 배열 |
| `BOOLEAN` | Checkbox | `boolean` |
| `IMAGE` | Image Uploader | `assetId` 배열 |

## 설정 구조

```ts
type FieldSettings = {
  placeholder?: string;
  min?: number | string;
  max?: number | string;
  step?: number;
  maxLength?: number;
  maxCount?: number;
  options?: { value: string; label: string }[];
  allowedContentTypes?: string[];
};
```

## Validation

- `required` 필드는 타입에 맞는 비어 있지 않은 값을 요구한다.
- TEXT 계열은 앞뒤 공백을 정리하고 `maxLength`를 확인한다.
- NUMBER는 숫자 형식, `min`, `max`, `step`을 확인한다.
- 선택형은 서버가 정의한 Option Value만 허용한다.
- 날짜·시간은 유효 형식과 최소·최대 범위를 검증한다.
- IMAGE는 업로드가 완료된 Asset ID만 제출하고 개수·MIME Type을 확인한다.
- 프론트 Validation을 통과해도 백엔드가 같은 기준으로 다시 검증해야 한다.

## 제출 스키마

```ts
type OrderFormSubmissionCommand = {
  templateId: string;
  answers: {
    fieldId: string;
    fieldType: FieldType;
    value: unknown;
  }[];
};
```

- 화면 Label을 신뢰 기준으로 제출하지 않는다.
- 제출 당시 질문과 답변 Label 스냅샷은 백엔드가 저장한다.
- 제출 중 양식이 변경돼 409가 발생하면 최신 양식을 다시 불러오고 재확인을 요청한다.
