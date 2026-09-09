"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getAsset,
  getAssetVariants,
  getInquiry,
  getOrderFormSubmission,
  getStoreOrderForm,
  type AssetVariantResponse,
  type InquiryChatDetailResponse,
  type OrderFormOptionGroupResponse,
  type OrderFormOptionResponse,
  type OrderFormResponse,
  type OrderFormSubmissionResponse,
} from "@/shared/api/buyer-api";
import { getOrderFormSubmissionReferenceAssets } from "@/features/order-flow/submission-reference-assets";
import type { ReferenceAssetPreview } from "@/features/order-flow/reference-asset-preview-grid";
import { saveOrderFormResume } from "@/shared/lib/order-form-resume-store";
import { getBuyerInquiryDetailHref } from "@/shared/navigation/buyer-back-routes";
import { SafeImage } from "@/shared/ui/safe-image";

type SubmissionState =
  | { status: "loading"; submission?: undefined; message?: undefined }
  | { status: "error"; submission?: undefined; message: string }
  | {
      status: "success";
      inquiry: InquiryChatDetailResponse | null;
      orderForm: OrderFormResponse | null;
      submission: OrderFormSubmissionResponse;
      message?: undefined;
    };

type AnswerSnapshot = {
  optionGroupId?: string;
  label?: string;
  required?: boolean;
  selectionType?: string;
  selectedOptions?: OptionSnapshot[];
  sortOrder?: number;
  value?: OptionSnapshot[];
};

type OptionSnapshot = {
  assetIds?: string[];
  assets?: ReferenceAssetPreview[];
  inputType?: string;
  label?: string;
  price?: number | null;
  priceLabel?: string | null;
  settings?: string | null;
  text?: string | null;
  value?: string;
};

type OptionSettings = {
  helperText?: string;
  maxLength?: number;
  placeholder?: string;
};

type OrderFormAnswers = Record<string, OrderFormAnswerSelection[]>;

type OrderFormAnswerSelection = {
  optionValue: string;
  text?: string;
  assetIds?: string[];
  assets?: ReferenceAssetPreview[];
};

export function OrderFormSubmissionDetailPage({
  inquiryId,
  submissionId,
}: {
  inquiryId: string;
  submissionId: string;
}) {
  const [state, setState] = useState<SubmissionState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function loadSubmission() {
      try {
        const submission = await hydrateSubmissionAnswerAssetUrls(await getOrderFormSubmission(inquiryId, submissionId));
        const inquiry = await getInquiry(inquiryId).catch(() => null);
        const orderForm = inquiry?.storeSlug ? await getStoreOrderForm(inquiry.storeSlug).catch(() => null) : null;
        if (!cancelled) {
          setState({ status: "success", inquiry, orderForm, submission });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "주문서를 불러오지 못했어요.",
          });
        }
      }
    }

    void loadSubmission();

    return () => {
      cancelled = true;
    };
  }, [inquiryId, submissionId]);

  return (
    <main className="min-h-dvh overflow-x-clip bg-[var(--figma-color-surface-subtle)] text-[var(--figma-color-text-primary)]">
      <div className="mx-auto min-h-dvh w-full max-w-[var(--figma-container-lg)]">
        <section className="relative flex h-dvh w-full flex-col overflow-hidden bg-[var(--figma-color-surface-subtle)]">
          <header className="flex h-14 shrink-0 items-center justify-between bg-white">
            <Link className="grid h-12 w-12 place-items-center text-[28px] text-[var(--figma-color-icon-default)]" href={getBuyerInquiryDetailHref(inquiryId)} aria-label="뒤로">
              <span aria-hidden>‹</span>
            </Link>
            <h1 className="text-display-sm">주문서</h1>
            <span className="h-12 w-12" />
          </header>
          <SubmissionBody state={state} />
        </section>
      </div>
    </main>
  );
}

function SubmissionBody({ state }: { state: SubmissionState }) {
  if (state.status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center px-[var(--figma-space-md)] text-center">
        <p className="text-body-md text-[var(--figma-color-text-secondary)]">주문서를 불러오는 중입니다.</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-1 items-center justify-center px-[var(--figma-space-md)] text-center">
        <p className="text-body-md text-[var(--figma-color-status-error)]">{state.message}</p>
      </div>
    );
  }

  const answers = parseJsonArray<AnswerSnapshot>(state.submission.answers);
  const answerGroups = buildSubmittedOrderGroups(state.orderForm, answers);
  const noticeHref = state.inquiry?.storeSlug ? `/stores/${encodeURIComponent(state.inquiry.storeSlug)}?notice=1&readonly=1` : "";
  const editHref = buildSubmissionEditHref(state.submission, state.inquiry);

  return (
    <div className="figma-scrollbar-none flex flex-1 flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto bg-[var(--figma-color-surface-subtle)] p-[var(--figma-space-md)]">
        {noticeHref ? (
          <Link className="mb-[var(--figma-space-lg)] flex h-14 items-center justify-between rounded-[var(--figma-radius-sm)] bg-white px-[var(--figma-space-md)] text-heading-md shadow-[var(--figma-shadow-card)]" href={noticeHref}>
            공지사항
            <span className="text-[24px] text-[var(--figma-color-icon-default)]">›</span>
          </Link>
        ) : (
          <div className="mb-[var(--figma-space-lg)] flex h-14 items-center justify-between rounded-[var(--figma-radius-sm)] bg-white px-[var(--figma-space-md)] text-heading-md shadow-[var(--figma-shadow-card)]">
            공지사항
            <span className="text-[24px] text-[var(--figma-color-icon-muted)]">›</span>
          </div>
        )}
        <section className="rounded-[var(--figma-radius-sm)] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-lg)] shadow-[var(--figma-shadow-card)]" data-ui="submitted-ordersheet">
          <h2 className="mb-[var(--figma-space-md)] text-heading-lg">픽업 일시</h2>
          <div className="mb-[var(--figma-space-section-mobile)] flex h-[52px] w-full items-center justify-between rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] px-[var(--figma-space-md)] text-heading-md text-[var(--figma-color-text-tertiary)]">
            <span>{formatPickupDateLabel(state.submission.pickupDate)}</span>
            <span>{formatPickupTimeLabel(state.submission.pickupTime)}</span>
            <Image alt="" aria-hidden className="shrink-0" height={24} src="/figma-flowmap/calendar-week.svg" width={24} />
          </div>
          {answerGroups.length ? (
            answerGroups.map((group) => (
              <section className="mb-[var(--figma-space-section-mobile)] last:mb-0" key={group.id}>
                <h2 className="mb-[var(--figma-space-md)] text-heading-lg">
                  {group.label}
                  {group.required ? <span className="text-[var(--figma-color-status-error)]">*</span> : null}
                </h2>
                <div className="grid gap-[var(--figma-space-md)]">
                  {group.options.map((option) => (
                    <SubmittedOption key={option.id} control={group.selectionType === "MULTI" ? "checkbox" : "radio"} option={option} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <p className="text-body-md text-[var(--figma-color-text-secondary)]">표시할 주문서 답변이 없습니다.</p>
          )}
        </section>
      </div>
      <SubmissionEditAction
        answers={answers}
        editHref={editHref}
        inquiryId={state.submission.inquiryId}
        pickupDate={state.submission.pickupDate}
        pickupTime={state.submission.pickupTime}
        storeSlug={state.inquiry?.storeSlug}
        submissionId={state.submission.id}
      />
    </div>
  );
}

function SubmissionEditAction({
  answers,
  editHref,
  inquiryId,
  pickupDate,
  pickupTime,
  storeSlug,
  submissionId,
}: {
  answers: AnswerSnapshot[];
  editHref: string;
  inquiryId: string;
  pickupDate: string;
  pickupTime: string;
  storeSlug?: string;
  submissionId: string;
}) {
  const router = useRouter();
  const canEdit = Boolean(storeSlug && editHref);

  function startEdit() {
    if (!storeSlug || !editHref) {
      router.push(`/inquiries/${encodeURIComponent(inquiryId)}?state=final-price`);
      return;
    }

    saveOrderFormResume<OrderFormAnswers>(storeSlug, {
      answers: buildResumeAnswers(answers),
      mode: "edit",
      noticeAgreed: true,
      pickupDate,
      pickupTime: formatPickupTimeLabel(pickupTime),
      submissionId,
      step: "form",
    });

    router.push(editHref);
  }

  return (
    <div className="shrink-0 bg-white px-[var(--figma-space-md)] pb-[34px] pt-[var(--figma-space-md)]" data-ui="order-form-submission-cta">
      <button
        className="flex h-[52px] w-full items-center justify-center rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-strong)] bg-white text-heading-md text-[var(--figma-color-text-primary)] disabled:text-[var(--figma-color-text-disabled)]"
        disabled={!canEdit}
        onClick={startEdit}
        type="button"
      >
        수정하기
      </button>
    </div>
  );
}

type SubmittedOrderGroup = {
  id: string;
  label: string;
  options: SubmittedOrderOption[];
  required: boolean;
  selectionType: string;
  sortOrder: number;
};

type SubmittedOrderOption = {
  assetIds: string[];
  assets: ReferenceAssetPreview[];
  checked: boolean;
  id: string;
  inputType: string;
  label: string;
  price: number | null;
  priceLabel: string | null;
  settings: string | null;
  sortOrder: number;
  text: string;
  value: string;
};

function SubmittedOption({
  control,
  option,
}: {
  control: "checkbox" | "radio";
  option: SubmittedOrderOption;
}) {
  if (option.inputType === "IMAGE") {
    return <SubmittedUploadOption control={control} option={option} />;
  }

  if (isTextInputOption(option.inputType)) {
    return <SubmittedOptionWithInput control={control} option={option} />;
  }

  return (
    <div className="flex min-h-9 items-center justify-between gap-[var(--figma-space-md)]">
      <span className="flex min-w-0 items-center gap-[var(--figma-space-sm)]">
        <SelectionControl checked={option.checked} control={control} />
        <span className="min-w-0 text-body-md">{option.label}</span>
      </span>
      <span className="shrink-0 text-number-md">{formatOptionPrice(option.price, option.priceLabel)}</span>
    </div>
  );
}

function SubmittedOptionWithInput({
  control,
  option,
}: {
  control: "checkbox" | "radio";
  option: SubmittedOrderOption;
}) {
  const settings = parseOptionSettings(option.settings);
  const placeholder = settings.placeholder ?? "입력해주세요";
  const value = option.checked ? option.text : "";
  const count = settings.maxLength ? `${value.length}/${settings.maxLength}` : "";
  const inputClassName = "mt-2 w-full rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] px-[var(--figma-space-md)] text-body-md text-[var(--figma-color-text-secondary)] outline-none placeholder:text-[var(--figma-color-text-unavailable)]";

  return (
    <div className="mb-[var(--figma-space-md)]">
      <div className="flex items-center justify-between gap-[var(--figma-space-md)]">
        <span className="flex min-w-0 items-center gap-[var(--figma-space-sm)]">
          <SelectionControl checked={option.checked} control={control} />
          <span className="min-w-0 text-body-md">{option.label}</span>
        </span>
        <span className="shrink-0 text-label-md">{formatOptionPrice(option.price, option.priceLabel)}</span>
      </div>
      {option.inputType === "TEXTAREA" ? (
        <textarea
          aria-label={`${option.label} 입력 내용`}
          className={`${inputClassName} min-h-[92px] resize-none py-[var(--figma-space-sm)]`}
          disabled
          placeholder={placeholder}
          value={value}
        />
      ) : (
        <input
          aria-label={`${option.label} 입력 내용`}
          className={`${inputClassName} h-11`}
          disabled
          placeholder={placeholder}
          value={value}
        />
      )}
      {count ? <p className="mt-1 text-right text-label-xs text-[var(--figma-color-text-unavailable)]">{count}</p> : null}
      {settings.helperText ? <p className="mt-2 text-label-xs text-[var(--figma-color-text-tertiary)]">* {settings.helperText}</p> : null}
    </div>
  );
}

function SubmittedUploadOption({
  control,
  option,
}: {
  control: "checkbox" | "radio";
  option: SubmittedOrderOption;
}) {
  const settings = parseOptionSettings(option.settings);
  const assets = option.assets.length
    ? option.assets
    : option.assetIds.map((assetId, index) => ({
        assetId,
        deliveryUrl: null,
        sortOrder: index,
      }));

  return (
    <div className="mt-[var(--figma-space-md)]">
      <div className="flex items-center justify-between gap-[var(--figma-space-md)]">
        <span className="flex min-w-0 items-center gap-[var(--figma-space-sm)]">
          <SelectionControl checked={option.checked} control={control} />
          <span className="min-w-0 text-body-md">{option.label}</span>
        </span>
        <span className="shrink-0 text-label-md">{formatOptionPrice(option.price, option.priceLabel)}</span>
      </div>
      <div className="relative mt-3 h-[100px] w-[100px] overflow-hidden rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] text-[28px] text-[var(--figma-color-text-tertiary)]">
        {option.checked && assets.length ? (
          <div className="grid h-full w-full grid-cols-1 overflow-hidden">
            {assets.slice(0, 1).map((asset, index) => (
              <div className="relative min-h-0 min-w-0" key={`${asset.assetId ?? "asset"}-${index}`}>
                {asset.deliveryUrl ? (
                  <SafeImage alt={`${option.label} 첨부 이미지`} className="object-cover" fill sizes="100px" src={asset.deliveryUrl} />
                ) : (
                  <div className="grid h-full w-full place-items-center px-2 text-center text-label-xs text-[var(--figma-color-text-tertiary)]">이미지 준비 중</div>
                )}
              </div>
            ))}
            {assets.length > 1 ? <span className="absolute bottom-1 right-1 rounded-full bg-[rgb(18_22_28/72%)] px-2 py-0.5 text-label-xs text-white">{assets.length}/5</span> : null}
          </div>
        ) : (
          <Image alt="" aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" height={48} src="/figma-flowmap/upload.svg" width={48} />
        )}
      </div>
      {settings.helperText ? <p className="mt-2 text-label-xs text-[var(--figma-color-text-tertiary)]">* {settings.helperText}</p> : null}
    </div>
  );
}

function SelectionControl({ checked, control }: { checked: boolean; control: "checkbox" | "radio" }) {
  if (control === "checkbox") {
    return (
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[8px] border ${checked ? "border-[var(--figma-color-action-primary)]" : "border-[var(--figma-color-border-default)]"} bg-white`}>
        {checked ? <span className="h-4 w-4 rounded-[4px] bg-[var(--figma-color-action-primary)]" /> : null}
      </span>
    );
  }

  return (
    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border ${checked ? "border-[var(--figma-color-action-primary)]" : "border-[var(--figma-color-border-default)]"}`}>
      {checked ? <span className="h-4 w-4 rounded-full bg-[var(--figma-color-action-primary)]" /> : null}
    </span>
  );
}

function parseJsonArray<T>(value?: string | null): T[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function buildResumeAnswers(answers: AnswerSnapshot[]): OrderFormAnswers {
  const entries: [string, OrderFormAnswerSelection[]][] = [];

  for (const answer of answers) {
    const optionGroupId = answer.optionGroupId;
    if (!optionGroupId) continue;

    const selections = getAnswerOptions(answer)
      .filter((option) => option.value)
      .map((option) => ({
        assetIds: option.assetIds ?? [],
        assets: normalizeOptionAssets(option),
        optionValue: option.value as string,
        text: option.text ?? "",
      }));

    if (selections.length) {
      entries.push([optionGroupId, selections]);
    }
  }

  return Object.fromEntries(entries);
}

function buildSubmittedOrderGroups(orderForm: OrderFormResponse | null, answers: AnswerSnapshot[]): SubmittedOrderGroup[] {
  const answerByGroupId = new Map(answers.filter((answer) => answer.optionGroupId).map((answer) => [answer.optionGroupId as string, answer]));
  const answerByLabel = new Map(answers.filter((answer) => answer.label).map((answer) => [answer.label as string, answer]));

  if (orderForm) {
    return getOrderFormOptionGroups(orderForm).map((group) => {
      const answer = answerByGroupId.get(group.id) ?? answerByLabel.get(group.label);
      return {
        id: group.id,
        label: group.label,
        options: group.options.map((option) => buildSubmittedTemplateOption(option, answer)),
        required: group.required,
        selectionType: group.selectionType,
        sortOrder: group.sortOrder,
      };
    });
  }

  return answers
    .map((answer, index) => ({
      id: answer.optionGroupId ?? `${answer.label ?? "answer"}-${index}`,
      label: answer.label ?? `옵션 ${index + 1}`,
      options: getAnswerOptions(answer).map((option, optionIndex) => buildSubmittedSnapshotOption(option, optionIndex)),
      required: Boolean(answer.required),
      selectionType: answer.selectionType ?? "SINGLE",
      sortOrder: answer.sortOrder ?? index,
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function buildSubmissionEditHref(
  submission: OrderFormSubmissionResponse,
  inquiry: InquiryChatDetailResponse | null,
) {
  if (!inquiry?.storeSlug) return "";

  const params = new URLSearchParams({
    mode: "edit",
    noticeAgreed: "1",
    pickupDate: submission.pickupDate,
    pickupTime: formatPickupTimeLabel(submission.pickupTime),
    state: "complete",
    step: "form",
    submissionId: submission.id,
  });
  const referenceAsset = getOrderFormSubmissionReferenceAssets(submission).sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))[0];

  if (referenceAsset?.assetId) {
    params.set("startAssetId", referenceAsset.assetId);
    params.set("startSource", normalizeReferenceAssetSource(referenceAsset.source));
  }

  return `/stores/${encodeURIComponent(inquiry.storeSlug)}/order-form-drafts/new?${params.toString()}`;
}

function buildSubmittedTemplateOption(option: OrderFormOptionResponse, answer?: AnswerSnapshot): SubmittedOrderOption {
  const selected = findSelectedOption(answer, option);

  return {
    assetIds: selected?.assetIds ?? [],
    assets: normalizeOptionAssets(selected),
    checked: Boolean(selected),
    id: option.id,
    inputType: option.inputType,
    label: option.label,
    price: option.price,
    priceLabel: option.priceLabel,
    settings: option.settings,
    sortOrder: option.sortOrder,
    text: selected?.text ?? "",
    value: option.value,
  };
}

function buildSubmittedSnapshotOption(option: OptionSnapshot, index: number): SubmittedOrderOption {
  return {
    assetIds: option.assetIds ?? [],
    assets: normalizeOptionAssets(option),
    checked: true,
    id: option.value ?? option.label ?? `option-${index}`,
    inputType: option.inputType ?? "SELECT",
    label: option.label ?? "-",
    price: option.price ?? null,
    priceLabel: option.priceLabel ?? null,
    settings: option.settings ?? null,
    sortOrder: index,
    text: option.text ?? "",
    value: option.value ?? option.label ?? `option-${index}`,
  };
}

function findSelectedOption(answer: AnswerSnapshot | undefined, option: OrderFormOptionResponse) {
  return getAnswerOptions(answer).find((selected) => selected.value === option.value || selected.label === option.label);
}

function normalizeOptionAssets(option?: OptionSnapshot): ReferenceAssetPreview[] {
  return (option?.assets ?? []).map((asset, index) => ({
    assetId: asset.assetId ?? option?.assetIds?.[index],
    deliveryUrl: asset.deliveryUrl ?? null,
    sortOrder: asset.sortOrder ?? index,
    source: asset.source ?? null,
  }));
}

function getAnswerOptions(answer?: AnswerSnapshot) {
  return answer?.selectedOptions?.length ? answer.selectedOptions : answer?.value ?? [];
}

async function hydrateSubmissionAnswerAssetUrls(submission: OrderFormSubmissionResponse): Promise<OrderFormSubmissionResponse> {
  const answers = parseJsonArray<AnswerSnapshot>(submission.answers);
  const missingAssetIds = collectMissingAnswerAssetIds(answers);

  if (!missingAssetIds.length) return submission;

  const deliveryUrlByAssetId = await resolveAssetDeliveryUrls(missingAssetIds);
  if (!deliveryUrlByAssetId.size) return submission;

  let changed = false;
  const hydratedAnswers = answers.map((answer) => ({
    ...answer,
    selectedOptions: hydrateOptions(answer.selectedOptions, deliveryUrlByAssetId, () => {
      changed = true;
    }),
    value: hydrateOptions(answer.value, deliveryUrlByAssetId, () => {
      changed = true;
    }),
  }));

  return changed
    ? {
        ...submission,
        answers: JSON.stringify(hydratedAnswers),
      }
    : submission;
}

function collectMissingAnswerAssetIds(answers: AnswerSnapshot[]) {
  const assetIds = new Set<string>();

  for (const answer of answers) {
    collectMissingOptionAssetIds(answer.selectedOptions, assetIds);
    collectMissingOptionAssetIds(answer.value, assetIds);
  }

  return [...assetIds];
}

function collectMissingOptionAssetIds(options: OptionSnapshot[] | undefined, assetIds: Set<string>) {
  for (const option of options ?? []) {
    for (const [index, assetId] of (option.assetIds ?? []).entries()) {
      if (!findOptionAssetDeliveryUrl(option, assetId, index)) {
        assetIds.add(assetId);
      }
    }
  }
}

function hydrateOptions(
  options: OptionSnapshot[] | undefined,
  deliveryUrlByAssetId: Map<string, string>,
  markChanged: () => void,
) {
  if (!options) return options;

  return options.map((option) => {
    if (!option.assetIds?.length) return option;

    const existingAssets = option.assets ?? [];
    const nextAssets = option.assetIds.map((assetId, index) => {
      const existingAsset = findOptionAsset(option, assetId, index);
      const deliveryUrl = existingAsset?.deliveryUrl ?? deliveryUrlByAssetId.get(assetId) ?? null;

      return {
        ...existingAsset,
        assetId: existingAsset?.assetId ?? assetId,
        deliveryUrl,
        sortOrder: existingAsset?.sortOrder ?? index,
        source: existingAsset?.source ?? null,
      };
    });

    const resolvedAnyAsset = nextAssets.some((asset) => asset.deliveryUrl);
    const filledMissingUrl = nextAssets.some((asset, index) => asset.deliveryUrl && asset.deliveryUrl !== existingAssets[index]?.deliveryUrl);

    if (!filledMissingUrl && (existingAssets.length || !resolvedAnyAsset)) return option;

    markChanged();
    return {
      ...option,
      assets: nextAssets,
    };
  });
}

function findOptionAsset(option: OptionSnapshot, assetId: string, index: number) {
  return option.assets?.find((asset) => asset.assetId === assetId) ?? option.assets?.[index];
}

function findOptionAssetDeliveryUrl(option: OptionSnapshot, assetId: string, index: number) {
  return findOptionAsset(option, assetId, index)?.deliveryUrl ?? null;
}

async function resolveAssetDeliveryUrls(assetIds: string[]) {
  const entries = await Promise.all(
    assetIds.map(async (assetId) => {
      const deliveryUrl = await resolveAssetDeliveryUrl(assetId);
      return deliveryUrl ? ([assetId, deliveryUrl] as const) : null;
    }),
  );

  return new Map(entries.filter((entry): entry is readonly [string, string] => Boolean(entry)));
}

async function resolveAssetDeliveryUrl(assetId: string) {
  try {
    const variant = pickPreferredAssetVariant((await getAssetVariants(assetId)).variants);
    if (variant?.deliveryUrl) return variant.deliveryUrl;
  } catch {
    // Fall through to the asset detail endpoint. Some environments expose the original delivery URL first.
  }

  try {
    const asset = await getAsset(assetId);
    return typeof asset.deliveryUrl === "string" && asset.deliveryUrl ? asset.deliveryUrl : null;
  } catch {
    return null;
  }
}

function pickPreferredAssetVariant(variants: AssetVariantResponse["variants"]) {
  return (
    variants.find((variant) => variant.type === "MEDIUM" && variant.deliveryUrl) ??
    variants.find((variant) => variant.type === "LARGE" && variant.deliveryUrl) ??
    variants.find((variant) => variant.type === "THUMBNAIL" && variant.deliveryUrl) ??
    variants.find((variant) => variant.deliveryUrl)
  );
}

function normalizeReferenceAssetSource(source?: string | null) {
  return source === "USER_UPLOAD" ? "USER_UPLOAD" : "STORE_GALLERY";
}

function getOrderFormOptionGroups(orderForm: OrderFormResponse): OrderFormOptionGroupResponse[] {
  const grouped = orderForm.groups.flatMap((group) => group.optionGroups);
  const uniqueGroups = new Map<string, OrderFormOptionGroupResponse>();

  for (const group of [...orderForm.optionGroups, ...grouped]) {
    if (!uniqueGroups.has(group.id)) {
      uniqueGroups.set(group.id, group);
    }
  }

  return [...uniqueGroups.values()]
    .filter((group) => group.required || group.options.length)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function isTextInputOption(inputType: string) {
  return inputType === "SELECT_WITH_TEXT" || inputType === "TEXT" || inputType === "TEXTAREA";
}

function parseOptionSettings(value?: string | null): OptionSettings {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const record = parsed as Record<string, unknown>;
    return {
      helperText: typeof record.helperText === "string" ? record.helperText : undefined,
      maxLength: typeof record.maxLength === "number" ? record.maxLength : undefined,
      placeholder: typeof record.placeholder === "string" ? record.placeholder : undefined,
    };
  } catch {
    return {};
  }
}

function formatOptionPrice(price?: number | null, priceLabel?: string | null) {
  if (typeof price === "number") return `+ ${new Intl.NumberFormat("ko-KR").format(price)}원`;
  return priceLabel ?? "";
}

function formatPickupDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value || "-";

  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(date);
}

function formatPickupTimeLabel(value: string) {
  const trimmed = value.trim();
  if (/^(오전|오후)\s*\d{1,2}:\d{2}$/.test(trimmed)) return trimmed;

  const match = trimmed.match(/^(\d{2}):(\d{2})/);
  if (!match) return trimmed || "-";

  const hour = Number(match[1]);
  const minute = match[2];
  const meridiem = hour >= 12 ? "오후" : "오전";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${meridiem} ${displayHour}:${minute}`;
}
