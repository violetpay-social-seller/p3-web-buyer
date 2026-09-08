import { describe, expect, it } from "vitest";
import { formatOrderSummaryPreview, parseOrderSummaryRows } from "./order-summary-format";

describe("order-summary-format", () => {
  it("formats confirmation orderSummary answer snapshots", () => {
    const rows = parseOrderSummaryRows(
      JSON.stringify({
        answers: [
          {
            label: "메뉴명",
            selectedOptions: [{ text: "초코 케이크", optionValue: "menu" }],
          },
          {
            label: "사이즈",
            selectedOptions: [{ label: "10호", price: 38000, value: "size-10" }],
          },
        ],
        orderFormSubmissionId: "44444444-4444-4444-8444-000000000001",
      }),
    );

    expect(rows).toEqual([
      { label: "메뉴명", price: undefined, value: "초코 케이크" },
      { label: "사이즈", price: "+ 38,000원", value: "10호" },
    ]);
  });

  it("formats legacy value arrays from confirmation summaries", () => {
    const rows = parseOrderSummaryRows(
      JSON.stringify({
        answers: [
          {
            label: "Menu name",
            value: [{ optionValue: "menu", text: "Chocolate cake" }],
          },
        ],
      }),
    );

    expect(rows).toEqual([{ label: "Menu name", price: undefined, value: "Chocolate cake" }]);
  });

  it("formats additional item snapshots", () => {
    expect(parseOrderSummaryRows(JSON.stringify([{ amount: 3000, label: "토핑", value: "딸기" }]))).toEqual([
      { label: "토핑", price: "+ 3,000원", value: "딸기" },
    ]);
  });

  it("creates compact previews without raw JSON", () => {
    expect(
      formatOrderSummaryPreview(
        JSON.stringify({
          answers: [
            { label: "Menu name", value: [{ text: "Chocolate cake", optionValue: "menu" }] },
            { label: "Size", selectedOptions: [{ label: "1호" }] },
          ],
        }),
      ),
    ).toBe("Menu name: Chocolate cake\nSize: 1호");
  });

  it("keeps plain text previews plain", () => {
    expect(formatOrderSummaryPreview("초코 시트, 딸기 토핑")).toBe("초코 시트, 딸기 토핑");
  });
});
