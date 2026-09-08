export type DisplayOrderSummaryRow = {
  label: string;
  price?: string;
  value: string;
};

type AnswerSnapshot = {
  label?: string;
  selectedOptions?: OptionSnapshot[];
  value?: OptionSnapshot[];
};

type OptionSnapshot = {
  assetIds?: string[];
  amount?: number | null;
  label?: string;
  optionLabel?: string;
  optionValue?: string;
  price?: number | null;
  priceLabel?: string | null;
  text?: string | null;
  value?: string | null;
};

export function parseOrderSummaryRows(source?: string | null): DisplayOrderSummaryRow[] {
  const trimmed = source?.trim();
  if (!trimmed) return [];

  const parsed = parseJson(trimmed);
  if (parsed !== undefined) {
    return rowsFromParsedSummary(parsed);
  }

  return rowsFromPlainText(trimmed);
}

export function formatOrderSummaryPreview(source?: string | null, maxRows = 2) {
  const trimmed = source?.trim();
  if (!trimmed) return "";

  const parsed = parseJson(trimmed);
  if (parsed === undefined) return trimmed;

  const rows = rowsFromParsedSummary(parsed);
  if (!rows.length) return trimmed;

  return rows
    .slice(0, maxRows)
    .map((row) => `${row.label}: ${row.value}`)
    .join("\n");
}

function rowsFromParsedSummary(value: unknown): DisplayOrderSummaryRow[] {
  if (Array.isArray(value)) {
    const answerRows = rowsFromAnswers(value as AnswerSnapshot[]);
    if (answerRows.length) return answerRows;

    return value.flatMap((item, index) => {
      const label = isRecord(item) ? normalizePlainText(item.label) || `항목 ${index + 1}` : `항목 ${index + 1}`;
      return rowsFromUnknownValue(label, item);
    });
  }

  if (!isRecord(value)) return [];

  const answers = Array.isArray(value.answers) ? rowsFromAnswers(value.answers as AnswerSnapshot[]) : [];
  if (answers.length) return answers;

  return Object.entries(value)
    .filter(([key]) => !["orderFormSubmissionId", "templateId", "submittedAt"].includes(key))
    .flatMap(([label, entry]) => rowsFromUnknownValue(label, entry));
}

function rowsFromAnswers(answers: AnswerSnapshot[]) {
  return answers.flatMap((answer, index) => {
    const label = normalizePlainText(answer.label) || `옵션 ${index + 1}`;
    const options = Array.isArray(answer.selectedOptions) ? answer.selectedOptions : Array.isArray(answer.value) ? answer.value : [];

    if (!options.length) return [];

    return options.map((option) => ({
      label,
      price: formatPrice(option.price ?? option.amount, option.priceLabel),
      value: formatOptionValue(option),
    }));
  });
}

function rowsFromUnknownValue(label: string, value: unknown): DisplayOrderSummaryRow[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => rowsFromUnknownValue(label, item));
  }

  if (isRecord(value)) {
    return [
      {
        label,
        price: formatPrice(numberOrNull(value.price) ?? numberOrNull(value.amount), stringOrNull(value.priceLabel)),
        value: formatOptionValue(value as OptionSnapshot, true),
      },
    ];
  }

  const text = normalizePlainText(value);
  return text ? [{ label, value: text }] : [];
}

function rowsFromPlainText(source: string): DisplayOrderSummaryRow[] {
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parts = lines.length > 1 ? lines : splitColonSeparatedSummary(source);

  return parts.map((part, index) => {
    const [label, ...rest] = part.split(":");
    return {
      label: rest.length ? label.trim() : `옵션 ${index + 1}`,
      value: rest.length ? rest.join(":").trim() : part,
    };
  });
}

function splitColonSeparatedSummary(source: string) {
  const commaParts = source
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (commaParts.length > 1 && commaParts.every((part) => part.includes(":"))) {
    return commaParts;
  }

  return [source.trim()];
}

function formatOptionValue(option: OptionSnapshot, preferValue = false) {
  const text = normalizePlainText(option.text);
  if (text) return text;

  const value = normalizePlainText(option.value ?? option.optionValue);
  if (preferValue && value) return value;

  const optionLabel = normalizePlainText(option.label ?? option.optionLabel);
  if (optionLabel) return optionLabel;

  if (value) return value;

  if (option.assetIds?.length) return `첨부 이미지 ${option.assetIds.length}개`;

  return "-";
}

function normalizePlainText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

function formatPrice(value?: number | null, priceLabel?: string | null) {
  if (typeof value === "number") return `+ ${new Intl.NumberFormat("ko-KR").format(value)}원`;
  return priceLabel?.trim() || undefined;
}

function numberOrNull(value: unknown) {
  return typeof value === "number" ? value : null;
}

function stringOrNull(value: unknown) {
  return typeof value === "string" ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
