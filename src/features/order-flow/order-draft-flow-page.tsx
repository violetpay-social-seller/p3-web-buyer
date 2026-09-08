"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import {
  consumeOrderFormDraft,
  createOrderFormDraft,
  getAsset,
  getAssetVariants,
  getStoreOrderForm,
  getStoreOrderSettings,
  openInquiry,
  uploadAsset,
  type AssetVariantResponse,
  type OrderFormReferenceAssetSource,
  type OrderFormOptionGroupResponse,
  type OrderFormResponse,
  type StoreOrderSettingAvailabilityResponse,
} from "@/shared/api/buyer-api";
import type { ReferenceAssetPreview } from "@/features/order-flow/reference-asset-preview-grid";
import { getValidAccessToken } from "@/shared/auth/cognito";
import { validateImageUploadFile } from "@/shared/lib/image-upload-validation";
import {
  clearPendingUpload,
  persistPendingUpload,
  readPendingUpload,
  type PendingUploadReference,
} from "@/shared/lib/pending-image-upload-store";
import {
  clearOrderFormResume,
  readOrderFormResume,
  saveOrderFormResume,
  saveSubmittedOrderFormDraftCleanup,
} from "@/shared/lib/order-form-resume-store";
import { SafeImage } from "@/shared/ui/safe-image";

type OrderDraftStep = "pickup-date" | "pickup-time" | "pickup-selected" | "form";
type OrderDraftFormState = "start" | "design" | "shape" | "complete" | "submitted";
type OrderSubmitPhase = "idle" | "uploading" | "drafting" | "consuming" | "redirecting" | "navigating";

type OrderDraftFlowPageProps = {
  initialFormState?: string;
  initialPickupDate?: string;
  initialPickupTime?: string;
  initialResumeSubmit?: string;
  initialStartAssetId?: string;
  initialStartSource?: string;
  initialStartUploadKey?: string;
  initialStep?: string;
  slug: string;
};

type OrderFormAnswers = Record<string, OrderFormAnswerSelection[]>;

type StartReferenceAsset = {
  assetId: string;
  source: OrderFormReferenceAssetSource;
};

type OrderFormAnswerSelection = {
  optionValue: string;
  text?: string;
  assetIds?: string[];
  assets?: ReferenceAssetPreview[];
  pendingUploads?: PendingUploadReference[];
};

type OrderFormAnswerSubmitValue = {
  optionValue: string;
  text?: string;
  assetIds?: string[];
};

type PickupSelection = {
  pickupDate: string;
  pickupTime: string;
};

const EMPTY_ASSET_IDS: string[] = [];

export function OrderDraftFlowPage({
  initialFormState,
  initialPickupDate,
  initialPickupTime,
  initialResumeSubmit,
  initialStartAssetId,
  initialStartSource,
  initialStartUploadKey,
  initialStep,
  slug,
}: OrderDraftFlowPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const normalizedInitialStep = normalizeStep(initialStep);
  const normalizedFormState = normalizeFormState(initialFormState);
  const normalizedStartSource = normalizeStartReferenceSource(initialStartSource);
  const restoredDraft = readOrderFormResume<OrderFormAnswers>(slug);
  const autoSubmitAttemptedRef = useRef(false);
  const [step, setStepState] = useState<OrderDraftStep>(restoredDraft?.step ?? normalizedInitialStep);
  const [selectedDate, setSelectedDate] = useState(() => getDayOfMonth(restoredDraft?.pickupDate ?? normalizeIsoDateParam(initialPickupDate)));
  const [selectedPickupDate, setSelectedPickupDate] = useState(() => restoredDraft?.pickupDate ?? normalizeIsoDateParam(initialPickupDate));
  const [selectedTime, setSelectedTime] = useState(() => restoredDraft?.pickupTime ?? normalizePickupTimeParam(initialPickupTime));
  const [showAbort, setShowAbort] = useState(false);
  const [answers, setAnswers] = useState<OrderFormAnswers>(() => restoredDraft?.answers ?? getInitialAnswers(normalizedFormState));
  const [orderForm, setOrderForm] = useState<OrderFormResponse | null>(null);
  const [orderSettings, setOrderSettings] = useState<StoreOrderSettingAvailabilityResponse | null>(null);
  const [orderFormError, setOrderFormError] = useState("");
  const [startReferenceAssets] = useState<StartReferenceAsset[]>(() =>
    initialStartAssetId
      ? [
          {
            assetId: initialStartAssetId,
            source: normalizedStartSource,
          },
        ]
      : [],
  );
  const [submitError, setSubmitError] = useState("");
  const [submitPhase, setSubmitPhase] = useState<OrderSubmitPhase>("idle");
  const [submitting, setSubmitting] = useState(false);

  const orderPath = useMemo(() => `/stores/${encodeURIComponent(slug)}/order-form-drafts/new`, [slug]);
  const storePath = useMemo(() => `/stores/${encodeURIComponent(slug)}`, [slug]);
  const orderFormGroups = orderForm ? getOrderFormOptionGroups(orderForm) : [];
  const requiredGroups = orderFormGroups.filter((group) => group.required);
  const formReady = Boolean(orderForm) && requiredGroups.every((group) => isGroupAnswerComplete(group, answers[group.id] ?? []));
  const pickupSelection = useMemo(() => ({ pickupDate: selectedPickupDate, pickupTime: selectedTime }), [selectedPickupDate, selectedTime]);
  const noticeHref = buildStoreNoticeHref(storePath, { agreed: true, pickupSelection, startReferenceAssets, startUploadKey: initialStartUploadKey });

  useEffect(() => {
    let cancelled = false;

    getStoreOrderForm(slug)
      .then((response) => {
        if (!cancelled) {
          setOrderForm(response);
          setOrderFormError("");
        }
      })
      .catch((error) => {
        if (!cancelled) setOrderFormError(error instanceof Error ? error.message : "스토어 주문서 API를 불러오지 못했어요.");
      });

    const today = new Date();
    const from = toIsoDate(today);
    const to = toIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30));

    getStoreOrderSettings(slug, from, to)
      .then((response) => {
        if (cancelled) return;
        const firstAvailable = response.dates.find((date) => date.available && date.pickupSlots.length > 0);
        setOrderSettings(response);
        setSelectedPickupDate((current) => {
          if (!firstAvailable || current) return current;
          setSelectedDate(new Date(`${firstAvailable.date}T00:00:00`).getDate());
          return firstAvailable.date;
        });
      })
      .catch((error) => {
        console.info("[buyer-api] GET /stores/{slug}/order-settings failed", error);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  function setStep(nextStep: OrderDraftStep, nextPickupSelection = pickupSelection) {
    setStepState(nextStep);
    window.history.replaceState(null, "", buildOrderDraftHref(orderPath, nextStep, undefined, nextPickupSelection, startReferenceAssets, initialStartUploadKey));
  }

  function handleTimeSelect(time: string) {
    const nextPickupSelection = { pickupDate: selectedPickupDate, pickupTime: time };
    setSelectedTime(time);
    setStep("pickup-selected", nextPickupSelection);
  }

  function handleDateSelect(date: number, dateValue?: string) {
    const nextPickupDate = dateValue ?? toPickupDate(date);
    const nextPickupSelection = { pickupDate: nextPickupDate, pickupTime: "" };
    setSelectedDate(date);
    setSelectedPickupDate(nextPickupDate);
    setSelectedTime("");
    setStep("pickup-time", nextPickupSelection);
  }

  const handleSubmitDraft = useCallback(async () => {
    setSubmitError("");
    setSubmitPhase("idle");

    if (!orderForm) {
      setSubmitError("스토어 주문서 API를 불러오지 못했어요.");
      return;
    }

    if (!selectedPickupDate || !selectedTime) {
      setSubmitError("픽업 일시를 선택해주세요.");
      return;
    }

    saveOrderFormResume(slug, {
      answers,
      pickupDate: selectedPickupDate,
      pickupTime: selectedTime,
      startUploadKey: initialStartUploadKey,
      step: "form",
    });

    const accessToken = await getValidAccessToken();

    if (!accessToken && hasPendingOrderFormUploads(answers, initialStartUploadKey)) {
      setSubmitPhase("redirecting");
      const resumeSubmitHref = withResumeSubmitParam(
        buildOrderDraftHref(orderPath, "form", normalizedFormState, pickupSelection, startReferenceAssets, initialStartUploadKey),
      );
      router.push(`/auth?next=${encodeURIComponent(resumeSubmitHref)}`);
      return;
    }

    setSubmitting(true);
    setSubmitPhase(hasPendingOrderFormUploads(answers, initialStartUploadKey) ? "uploading" : "drafting");
    let navigating = false;

    try {
      const answersForSubmit = await resolvePendingAnswerUploads(answers);
      const formAnswers = buildFormAnswers(orderForm, answersForSubmit);
      const startReferenceAsset = await resolveStartReferenceAsset(startReferenceAssets[0], initialStartUploadKey);
      setSubmitPhase("drafting");
      const draft = await createOrderFormDraft(slug, {
        cancellationRefundAgreed: true,
        formAnswers,
        noticeAgreed: true,
        orderFormTemplateId: orderForm.id,
        pickupDate: selectedPickupDate,
        pickupTime: toPickupTime(selectedTime),
        startReferenceAsset,
      });

      if (!accessToken) {
        const consumePath = `/order-form-drafts/${encodeURIComponent(draft.draftKey)}/consume`;
        setSubmitPhase("redirecting");
        saveSubmittedOrderFormDraftCleanup(draft.draftKey, {
          pendingUploadKeys: getPendingUploadKeysFromAnswers(answers),
          slug,
          startUploadKey: initialStartUploadKey,
        });
        navigating = true;
        router.push(`/auth?next=${encodeURIComponent(consumePath)}`);
        return;
      }

      setSubmitPhase("consuming");
      const consumed = await consumeOrderFormDraft(draft.draftKey);
      clearOrderFormResume(slug);
      if (initialStartUploadKey) await clearPendingUpload(initialStartUploadKey);
      await clearPendingAnswerUploads(answers);
      await refreshSubmittedInquiryQueries(queryClient, consumed.inquiryId);
      setSubmitPhase("navigating");
      navigating = true;
      router.push(
        `/inquiries/${encodeURIComponent(consumed.inquiryId)}?state=final-price&submitted=1&submissionId=${encodeURIComponent(consumed.submissionId)}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "주문서 임시 저장에 실패했습니다.";
      setSubmitError(message);
      setSubmitPhase("idle");
    } finally {
      if (!navigating) {
        setSubmitting(false);
      }
    }
  }, [answers, initialStartUploadKey, normalizedFormState, orderForm, orderPath, pickupSelection, queryClient, router, selectedPickupDate, selectedTime, slug, startReferenceAssets]);

  useEffect(() => {
    if (initialResumeSubmit !== "1" || autoSubmitAttemptedRef.current || submitting || !orderForm || !formReady || !selectedPickupDate || !selectedTime) {
      return;
    }

    autoSubmitAttemptedRef.current = true;
    const timeoutId = window.setTimeout(() => {
      void getValidAccessToken().then((accessToken) => {
        if (accessToken) void handleSubmitDraft();
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [formReady, handleSubmitDraft, initialResumeSubmit, orderForm, selectedPickupDate, selectedTime, submitting]);

  return (
    <PhoneLayout
      railTitle={step === "form" ? "주문서 작성" : "주문서/픽업 선택"}
      railLinks={[
        ["날짜 선택", buildOrderDraftHref(orderPath, "pickup-date", undefined, pickupSelection, startReferenceAssets, initialStartUploadKey)],
        ["시간 선택", buildOrderDraftHref(orderPath, "pickup-time", undefined, pickupSelection, startReferenceAssets, initialStartUploadKey)],
        ["선택 완료", buildOrderDraftHref(orderPath, "pickup-selected", undefined, pickupSelection, startReferenceAssets, initialStartUploadKey)],
        ["공지사항", buildStoreNoticeHref(storePath, { pickupSelection, startReferenceAssets, startUploadKey: initialStartUploadKey })],
        ["주문서 작성 시작", buildOrderDraftHref(orderPath, "form", "start", pickupSelection, startReferenceAssets, initialStartUploadKey)],
        ["디자인 선택", buildOrderDraftHref(orderPath, "form", "design", pickupSelection, startReferenceAssets, initialStartUploadKey)],
        ["모양 선택", buildOrderDraftHref(orderPath, "form", "shape", pickupSelection, startReferenceAssets, initialStartUploadKey)],
        ["작성 완료", buildOrderDraftHref(orderPath, "form", "complete", pickupSelection, startReferenceAssets, initialStartUploadKey)],
        ["제출 주문서 상세", buildOrderDraftHref(orderPath, "form", "submitted", pickupSelection, startReferenceAssets, initialStartUploadKey)],
        ["상담 목록", "/inquiries"],
      ]}
    >
      {step === "form" ? (
        <OrderFormScreen
          answers={answers}
          formReady={formReady}
          formState={normalizedFormState}
          orderFormError={orderFormError}
          optionGroups={orderFormGroups}
          onAbort={() => setShowAbort(true)}
          onAnswerText={(group, option, text) => setAnswers((current) => upsertSelection(current, group, option.value, { text }))}
          onEditPickup={() => setStep("pickup-selected")}
          onOptionToggle={(group, option) => setAnswers((current) => toggleSelection(current, group, option.value))}
          onSubmit={handleSubmitDraft}
          noticeHref={noticeHref}
          onUpload={(group, option, upload) => {
            setAnswers((current) => upsertImageSelection(current, group, option.value, upload));
          }}
          onRemoveUpload={(group, option, uploadKey) => {
            setAnswers((current) => removePendingImageSelection(current, group, option.value, uploadKey));
          }}
          onRemoveAsset={(group, option, assetId) => {
            setAnswers((current) => removeAssetImageSelection(current, group, option.value, assetId));
          }}
          pickupDate={selectedPickupDate}
          pickupTime={selectedTime}
          submitPhase={submitPhase}
          submitError={submitError}
          submitting={submitting}
        />
      ) : (
        <PickupSheetScreen
          onAbort={() => setShowAbort(true)}
          onDateSelect={handleDateSelect}
          onNext={() => {
            if (step === "pickup-selected" && selectedTime) router.push(buildStoreNoticeHref(storePath, { pickupSelection, startReferenceAssets, startUploadKey: initialStartUploadKey }));
          }}
          onTimeSelect={handleTimeSelect}
          selectedDate={selectedDate}
          selectedPickupDate={selectedPickupDate}
          selectedTime={selectedTime}
          slug={slug}
          step={step}
          orderSettings={orderSettings}
        />
      )}
      {showAbort ? <AbortOrderDialog onContinue={() => setShowAbort(false)} storePath={storePath} /> : null}
    </PhoneLayout>
  );
}

function normalizeStep(value?: string): OrderDraftStep {
  if (value === "pickup-time" || value === "pickup-selected" || value === "form") return value;
  return "pickup-date";
}

function normalizeFormState(value?: string): OrderDraftFormState {
  if (value === "design" || value === "shape" || value === "complete" || value === "submitted") return value;
  return "start";
}

function normalizeStartReferenceSource(value?: string): OrderFormReferenceAssetSource {
  const normalized = value?.replaceAll("\\", "").trim();
  return normalized === "USER_UPLOAD" ? "USER_UPLOAD" : "STORE_GALLERY";
}

function normalizeIsoDateParam(value?: string) {
  const trimmed = value?.trim() ?? "";
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : "";
}

function normalizePickupTimeParam(value?: string) {
  const trimmed = value?.trim() ?? "";
  if (/^(오전|오후)\s*\d{1,2}:\d{2}$/.test(trimmed)) return trimmed;
  return formatPickupTimeLabel(trimmed);
}

function getDayOfMonth(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? 0 : date.getDate();
}

function getInitialAnswers(state: OrderDraftFormState): OrderFormAnswers {
  void state;
  return {};
}

function buildFormAnswers(orderForm: OrderFormResponse, answers: OrderFormAnswers) {
  const formAnswers: { optionGroupId: string; value: OrderFormAnswerSubmitValue[] }[] = [];

  for (const group of getOrderFormOptionGroups(orderForm)) {
    const optionMap = new Map(group.options.map((option) => [option.value, option]));
    const value: OrderFormAnswerSubmitValue[] = [];
    const seenOptionValues = new Set<string>();

    for (const selection of answers[group.id] ?? []) {
      if (seenOptionValues.has(selection.optionValue)) continue;
      seenOptionValues.add(selection.optionValue);

      const option = optionMap.get(selection.optionValue);
      if (!option?.active || !isSelectionComplete(option, selection)) continue;

      if (option.inputType === "SELECT") {
        value.push({ optionValue: option.value });
        continue;
      }

      if (isTextInputOption(option.inputType)) {
        value.push({
          optionValue: option.value,
          text: selection.text?.trim() ?? "",
        });
        continue;
      }

      if (option.inputType === "IMAGE") {
        value.push({
          assetIds: uniqueValues(selection.assetIds ?? []).slice(0, 5),
          optionValue: option.value,
        });
      }
    }

    if (value.length) {
      formAnswers.push({
        optionGroupId: group.id,
        value,
      });
    }
  }

  return formAnswers;
}

function toggleSelection(
  answers: OrderFormAnswers,
  group: OrderFormOptionGroupResponse,
  optionValue: string,
): OrderFormAnswers {
  const selections = answers[group.id] ?? [];
  const selected = selections.some((selection) => selection.optionValue === optionValue);

  if (group.selectionType === "MULTI") {
    return setGroupSelections(
      answers,
      group.id,
      selected
        ? selections.filter((selection) => selection.optionValue !== optionValue)
        : [...selections, { optionValue }],
    );
  }

  return setGroupSelections(answers, group.id, selected ? selections : [{ optionValue }]);
}

function upsertSelection(
  answers: OrderFormAnswers,
  group: OrderFormOptionGroupResponse,
  optionValue: string,
  patch: Partial<OrderFormAnswerSelection>,
): OrderFormAnswers {
  const selections = answers[group.id] ?? [];
  const existing = selections.find((selection) => selection.optionValue === optionValue);
  const nextSelection = { optionValue, ...existing, ...patch };

  if (group.selectionType === "MULTI") {
    return setGroupSelections(
      answers,
      group.id,
      existing
        ? selections.map((selection) => (selection.optionValue === optionValue ? nextSelection : selection))
        : [...selections, nextSelection],
    );
  }

  return setGroupSelections(answers, group.id, [nextSelection]);
}

function upsertImageSelection(
  answers: OrderFormAnswers,
  group: OrderFormOptionGroupResponse,
  optionValue: string,
  upload: PendingUploadReference,
): OrderFormAnswers {
  const current = answers[group.id]?.find((selection) => selection.optionValue === optionValue);
  const pendingUploads = uniquePendingUploads([...(current?.pendingUploads ?? []), upload]).slice(0, 5);
  return upsertSelection(answers, group, optionValue, { pendingUploads });
}

function removePendingImageSelection(
  answers: OrderFormAnswers,
  group: OrderFormOptionGroupResponse,
  optionValue: string,
  uploadKey: string,
): OrderFormAnswers {
  const current = answers[group.id]?.find((selection) => selection.optionValue === optionValue);
  if (!current) return answers;

  return upsertSelection(answers, group, optionValue, {
    pendingUploads: uniquePendingUploads(current.pendingUploads ?? []).filter((upload) => upload.uploadKey !== uploadKey),
  });
}

function removeAssetImageSelection(
  answers: OrderFormAnswers,
  group: OrderFormOptionGroupResponse,
  optionValue: string,
  assetId: string,
): OrderFormAnswers {
  const current = answers[group.id]?.find((selection) => selection.optionValue === optionValue);
  if (!current) return answers;

  return upsertSelection(answers, group, optionValue, {
    assetIds: uniqueValues(current.assetIds ?? []).filter((value) => value !== assetId),
    assets: (current.assets ?? []).filter((asset) => asset.assetId !== assetId),
  });
}

function setGroupSelections(
  answers: OrderFormAnswers,
  optionGroupId: string,
  selections: OrderFormAnswerSelection[],
): OrderFormAnswers {
  const next = { ...answers };
  const completeSelections = selections.filter((selection) => selection.optionValue);

  if (completeSelections.length) {
    next[optionGroupId] = completeSelections;
  } else {
    delete next[optionGroupId];
  }

  return next;
}

function isOptionSelected(answers: OrderFormAnswers, groupId: string, optionValue: string) {
  return Boolean(answers[groupId]?.some((selection) => selection.optionValue === optionValue));
}

function getSelection(answers: OrderFormAnswers, groupId: string, optionValue: string) {
  return answers[groupId]?.find((selection) => selection.optionValue === optionValue);
}

function isGroupAnswerComplete(group: OrderFormOptionGroupResponse, selections: OrderFormAnswerSelection[]) {
  const optionMap = new Map(group.options.map((option) => [option.value, option]));
  const validSelections = selections.filter((selection) => {
    const option = optionMap.get(selection.optionValue);
    return Boolean(option?.active && isSelectionComplete(option, selection));
  });

  if (group.selectionType === "SINGLE") return validSelections.length === 1;
  return validSelections.length > 0;
}

function getOrderFormCtaHint(
  optionGroups: OrderFormOptionGroupResponse[],
  answers: OrderFormAnswers,
  pickupDate: string,
  pickupTime: string,
) {
  if (!pickupDate || !pickupTime) return "픽업 일시를 선택해주세요.";

  for (const group of optionGroups.filter((item) => item.required)) {
    const selections = answers[group.id] ?? [];
    if (!selections.length) return `${group.label} 필수 옵션을 선택해주세요.`;

    const optionMap = new Map(group.options.map((option) => [option.value, option]));
    for (const selection of selections) {
      const option = optionMap.get(selection.optionValue);
      if (!option?.active) continue;
      if (isTextInputOption(option.inputType) && !selection.text?.trim()) return `${group.label} 입력칸도 작성해주세요.`;
      if (option.inputType === "IMAGE" && getImageSelectionCount(selection) === 0) return `${group.label} 이미지를 추가해주세요.`;
    }

    if (!isGroupAnswerComplete(group, selections)) return `${group.label} 필수 옵션을 완료해주세요.`;
  }

  return "";
}

function isSelectionComplete(
  option: OrderFormOptionGroupResponse["options"][number],
  selection: OrderFormAnswerSelection,
) {
  if (option.inputType === "SELECT") return true;
  if (isTextInputOption(option.inputType)) return Boolean(selection.text?.trim());
  if (option.inputType === "IMAGE") return getImageSelectionCount(selection) > 0;
  return false;
}

function uniqueValues(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function uniquePendingUploads(values: PendingUploadReference[]) {
  const byKey = new Map<string, PendingUploadReference>();
  for (const value of values) {
    if (value.uploadKey) byKey.set(value.uploadKey, value);
  }
  return [...byKey.values()];
}

function getImageSelectionCount(selection: OrderFormAnswerSelection) {
  return uniqueValues(selection.assetIds ?? []).length + uniquePendingUploads(selection.pendingUploads ?? []).length;
}

function buildOrderDraftHref(
  basePath: string,
  step: OrderDraftStep,
  state: OrderDraftFormState | undefined,
  pickupSelection: PickupSelection,
  startReferenceAssets: StartReferenceAsset[],
  startUploadKey?: string,
) {
  const params = new URLSearchParams({ step });
  if (state) params.set("state", state);
  appendPickupSelectionParams(params, pickupSelection);
  appendStartReferenceParams(params, startReferenceAssets);
  appendStartUploadParam(params, startUploadKey);
  return `${basePath}?${params.toString()}`;
}

function withResumeSubmitParam(href: string) {
  return `${href}${href.includes("?") ? "&" : "?"}resumeSubmit=1`;
}

function buildStoreNoticeHref(
  storePath: string,
  {
    agreed = false,
    pickupSelection,
    readonly = false,
    startReferenceAssets,
    startUploadKey,
  }: {
    agreed?: boolean;
    pickupSelection?: PickupSelection;
    readonly?: boolean;
    startReferenceAssets: StartReferenceAsset[];
    startUploadKey?: string;
  },
) {
  const params = new URLSearchParams({ notice: "1" });
  if (agreed) params.set("agree", "1");
  if (readonly) params.set("readonly", "1");
  if (pickupSelection) appendPickupSelectionParams(params, pickupSelection);
  appendStartReferenceParams(params, startReferenceAssets);
  appendStartUploadParam(params, startUploadKey);
  return `${storePath}?${params.toString()}`;
}

function appendPickupSelectionParams(params: URLSearchParams, pickupSelection: PickupSelection) {
  if (pickupSelection.pickupDate) params.set("pickupDate", pickupSelection.pickupDate);
  if (pickupSelection.pickupTime) params.set("pickupTime", pickupSelection.pickupTime);
}

function appendStartReferenceParams(params: URLSearchParams, startReferenceAssets: StartReferenceAsset[]) {
  const startReferenceAsset = startReferenceAssets[0];
  if (!startReferenceAsset) return;

  params.set("startAssetId", startReferenceAsset.assetId);
  params.set("startSource", startReferenceAsset.source);
}

function appendStartUploadParam(params: URLSearchParams, startUploadKey?: string) {
  if (!startUploadKey) return;

  params.set("startUploadKey", startUploadKey);
  params.set("startSource", "USER_UPLOAD");
}

async function resolveStartReferenceAsset(
  existingAsset: StartReferenceAsset | undefined,
  pendingUploadKey?: string,
) {
  if (existingAsset) {
    return {
      assetId: existingAsset.assetId,
      source: existingAsset.source,
    };
  }

  const pendingUpload = await readPendingUpload(pendingUploadKey);
  if (!pendingUpload) return null;

  const uploaded = await uploadAsset(pendingUpload.file);
  return {
    assetId: uploaded.assetId,
    source: "USER_UPLOAD" as const,
  };
}

async function resolvePendingAnswerUploads(answers: OrderFormAnswers): Promise<OrderFormAnswers> {
  const nextAnswers: OrderFormAnswers = {};

  for (const [groupId, selections] of Object.entries(answers)) {
    nextAnswers[groupId] = await Promise.all(
      selections.map(async (selection) => {
        const pendingUploads = uniquePendingUploads(selection.pendingUploads ?? []);
        if (!pendingUploads.length) return selection;

        const uploadedAssetIds: string[] = [];
        for (const pendingUpload of pendingUploads) {
          const record = await readPendingUpload(pendingUpload.uploadKey);
          if (!record) {
            throw new Error(`${pendingUpload.name} 이미지를 찾지 못했어요. 다시 선택해 주세요.`);
          }
          const uploaded = await uploadAsset(record.file);
          uploadedAssetIds.push(uploaded.assetId);
        }

        return {
          ...selection,
          assetIds: uniqueValues([...(selection.assetIds ?? []), ...uploadedAssetIds]).slice(0, 5),
          pendingUploads: [],
        };
      }),
    );
  }

  return nextAnswers;
}

async function clearPendingAnswerUploads(answers: OrderFormAnswers) {
  for (const selections of Object.values(answers)) {
    for (const selection of selections) {
      for (const pendingUpload of selection.pendingUploads ?? []) {
        await clearPendingUpload(pendingUpload.uploadKey);
      }
    }
  }
}

function hasPendingOrderFormUploads(answers: OrderFormAnswers, startUploadKey?: string) {
  return Boolean(startUploadKey) || getPendingUploadKeysFromAnswers(answers).length > 0;
}

function getPendingUploadKeysFromAnswers(answers: OrderFormAnswers) {
  return uniqueValues(
    Object.values(answers).flatMap((selections) =>
      selections.flatMap((selection) => (selection.pendingUploads ?? []).map((pendingUpload) => pendingUpload.uploadKey)),
    ),
  );
}

async function refreshSubmittedInquiryQueries(queryClient: QueryClient, inquiryId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["buyer", "inquiries"] }),
    queryClient.invalidateQueries({ queryKey: ["buyer", "inquiry", inquiryId] }),
  ]);
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

function toPickupDate(day: number) {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day || today.getDate()).padStart(2, "0")}`;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatCalendarMonth(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatPickupDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(date);
}

function formatPickupTimeLabel(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})/);
  if (!match) return value;

  const hour = Number(match[1]);
  const minute = match[2];
  const meridiem = hour >= 12 ? "오후" : "오전";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${meridiem} ${displayHour}:${minute}`;
}

function toPickupTime(label: string) {
  const match = label.match(/(오전|오후)\s*(\d+):(\d+)/);
  if (!match) return "";

  const [, meridiem, hourValue, minute] = match;
  let hour = Number(hourValue);
  if (meridiem === "오후" && hour < 12) hour += 12;
  if (meridiem === "오전" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minute}:00`;
}

function PhoneLayout({ children, railLinks, railTitle }: { children: ReactNode; railLinks: Array<[string, string]>; railTitle: string }) {
  void railLinks;
  void railTitle;

  return (
    <main className="min-h-dvh overflow-x-clip bg-[var(--figma-color-surface-subtle)] text-[var(--figma-color-text-primary)]">
      <div className="mx-auto min-h-dvh w-full max-w-[var(--figma-container-lg)] overflow-x-hidden">
        <div className="relative h-dvh w-full overflow-hidden bg-[var(--figma-color-surface-background)]">
          {children}
        </div>
      </div>
    </main>
  );
}

function PickupSheetScreen({
  onAbort,
  onDateSelect,
  onNext,
  onTimeSelect,
  selectedDate,
  selectedPickupDate,
  selectedTime,
  slug,
  step,
  orderSettings,
}: {
  onAbort: () => void;
  onDateSelect: (date: number, dateValue?: string) => void;
  onNext: () => void;
  onTimeSelect: (time: string) => void;
  selectedDate: number;
  selectedPickupDate: string;
  selectedTime: string;
  slug: string;
  step: OrderDraftStep;
  orderSettings: StoreOrderSettingAvailabilityResponse | null;
}) {
  const showTimes = selectedDate > 0;
  const nextEnabled = step === "pickup-selected" && Boolean(selectedTime);
  const selectedAvailability = orderSettings?.dates.find((date) => date.date === selectedPickupDate);
  const enabledTimes = selectedAvailability?.pickupSlots?.map(formatPickupTimeLabel) ?? [];
  const displayDate = selectedPickupDate || orderSettings?.dates[0]?.date || toIsoDate(new Date());

  return (
    <div className="relative h-full bg-[var(--figma-color-surface-scrim)]">
      <div className="pb-safe-sheet absolute inset-x-0 bottom-0 flex h-[726px] max-h-full flex-col overflow-y-auto rounded-t-[24px] bg-white pt-[var(--figma-space-xl)] shadow-[var(--figma-shadow-dropdown)]" data-ui="pickup-sheet">
        <div className="mb-[var(--figma-space-md)] flex h-7 items-center justify-between px-[var(--figma-space-md)]">
          <h1 className="text-heading-lg">픽업 시간을 선택해주세요</h1>
          <button aria-label="주문 중단" className="grid h-10 w-10 place-items-center text-[28px] leading-none text-[var(--figma-color-icon-default)]" onClick={onAbort} type="button">
            ×
          </button>
        </div>
        <div className="mb-[var(--figma-space-md)] flex h-6 items-center justify-center gap-[var(--figma-space-md)] px-[var(--figma-space-md)]">
          <span className="grid h-12 w-12 place-items-center text-[30px] font-light text-[var(--figma-color-text-unavailable)]">‹</span>
          <p className="text-heading-md">{formatCalendarMonth(displayDate)}</p>
          <span className="grid h-12 w-12 place-items-center text-[30px] font-light text-[var(--figma-color-text-unavailable)]">›</span>
        </div>
        <div className="px-[var(--figma-space-md)]" data-ui="calendar">
          <CalendarGrid displayDate={displayDate} onDateSelect={onDateSelect} orderSettings={orderSettings} selectedDate={selectedDate} />
        </div>
        {showTimes ? (
          <div className="mt-[var(--figma-space-md)] flex flex-col gap-[var(--figma-space-md)]">
            <p className="px-[var(--figma-space-md)] text-heading-md">{selectedPickupDate ? formatPickupDateLabel(selectedPickupDate) : "-"}</p>
            <div className="grid grid-cols-4 gap-x-1 gap-y-2 px-[var(--figma-space-md)]">
              {enabledTimes.map((time) => (
                <button
                  className={`h-9 rounded-[12px] border text-label-sm ${selectedTime === time ? "border-[var(--figma-color-action-primary)] bg-[var(--figma-color-action-primary)] text-white" : "border-[var(--figma-color-border-default)] bg-white text-[var(--figma-color-text-primary)]"}`}
                  key={time}
                  onClick={() => onTimeSelect(time)}
                  type="button"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-auto flex gap-2 px-[var(--figma-space-md)] pt-[var(--figma-space-md)]">
          <OpenInquiryButton slug={slug} />
          <button
            className={`h-11 flex-1 rounded-[var(--figma-radius-md)] text-label-md ${nextEnabled ? "bg-[var(--figma-color-action-primary)] text-white" : "bg-[var(--figma-color-action-disabled)] text-[var(--figma-color-text-disabled)]"}`}
            disabled={!nextEnabled}
            onClick={onNext}
            type="button"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}

function CalendarGrid({
  displayDate,
  onDateSelect,
  orderSettings,
  selectedDate,
}: {
  displayDate: string;
  onDateSelect: (date: number, dateValue?: string) => void;
  orderSettings: StoreOrderSettingAvailabilityResponse | null;
  selectedDate: number;
}) {
  const monthDate = new Date(`${displayDate}T00:00:00`);
  const year = Number.isNaN(monthDate.getTime()) ? 2026 : monthDate.getFullYear();
  const month = Number.isNaN(monthDate.getTime()) ? 7 : monthDate.getMonth();
  const blankCount = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array.from({ length: blankCount }, () => 0), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  const availability = new Map(orderSettings?.dates.map((date) => [date.date, date]) ?? []);

  return (
    <div className="mx-auto grid w-full max-w-[358px] gap-[var(--figma-space-xs)]">
      <div className="grid h-6 grid-cols-7 gap-[var(--figma-space-sm)] text-center text-label-sm" data-ui="calendar-week">
        {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
          <span className={index === 0 ? "grid place-items-center text-[var(--figma-color-status-error)]" : "grid place-items-center text-[var(--figma-color-text-secondary)]"} key={day}>
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 justify-items-center text-center text-[15px] font-semibold leading-[22px] tracking-[-0.15px]" data-ui="calendar-grid">
        {cells.map((day, index) => {
          if (!day) {
            return <span className="aspect-square w-full" data-ui="calendar-cell" key={`blank-${index}`} />;
          }

          const dateValue = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayAvailability = availability.get(dateValue);
          const disabled = orderSettings ? !dayAvailability?.available || dayAvailability.pickupSlots.length === 0 : true;
          const sunday = index % 7 === 0;
          const selectable = !disabled;
          const selected = selectedDate === day;

          return (
            <button
              className={`grid place-items-center ${selected ? "h-[52px] w-[52px] rounded-[12px] bg-[var(--figma-color-action-primary)] text-white" : "aspect-square w-full rounded-full"} ${disabled ? "text-[var(--figma-color-text-unavailable)]" : sunday ? "text-[var(--figma-color-text-error)]" : "text-[var(--figma-color-text-primary)]"}`}
              data-ui="calendar-cell"
              disabled={!selectable}
              key={day}
              onClick={() => onDateSelect(day, dateValue)}
              type="button"
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OpenInquiryButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function openChat() {
    setPending(true);
    try {
      const response = await openInquiry(slug);
      router.push(`/inquiries/${encodeURIComponent(response.inquiryId)}`);
    } catch {
      router.push("/inquiries");
    }
  }

  return (
    <button
      className="flex h-11 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-strong)] text-label-md text-[var(--figma-color-text-primary)] disabled:text-[var(--figma-color-text-disabled)]"
      disabled={pending}
      onClick={openChat}
      type="button"
    >
      {pending ? "연결중" : "상담하기"}
    </button>
  );
}

function AbortOrderDialog({ onContinue, storePath }: { onContinue: () => void; storePath: string }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-[rgb(18_22_28/88%)] px-14">
      <div className="w-full rounded-[24px] bg-white px-4 pb-4 pt-8 text-center shadow-[var(--figma-shadow-dropdown)]">
        <h2 className="text-heading-lg">주문을 중단하시겠어요?</h2>
        <p className="mt-1 text-label-sm text-[var(--figma-color-text-tertiary)]">지금까지 정보가 모두 사라져요</p>
        <div className="mt-6 flex gap-2">
          <Link className="flex h-11 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-default)] text-label-md text-[var(--figma-color-text-tertiary)]" href={storePath}>
            확인
          </Link>
          <button className="h-11 flex-1 rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] text-label-md text-white" onClick={onContinue} type="button">
            이어하기
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderFormScreen({
  answers,
  formReady,
  formState,
  optionGroups,
  orderFormError,
  onAbort,
  onAnswerText,
  onEditPickup,
  onOptionToggle,
  onRemoveAsset,
  onRemoveUpload,
  onSubmit,
  onUpload,
  noticeHref,
  pickupDate,
  pickupTime,
  submitPhase,
  submitError,
  submitting,
}: {
  answers: OrderFormAnswers;
  formReady: boolean;
  formState: OrderDraftFormState;
  optionGroups: OrderFormOptionGroupResponse[];
  orderFormError: string;
  onAbort: () => void;
  onAnswerText: (
    group: OrderFormOptionGroupResponse,
    option: OrderFormOptionGroupResponse["options"][number],
    text: string,
  ) => void;
  onEditPickup: () => void;
  onOptionToggle: (
    group: OrderFormOptionGroupResponse,
    option: OrderFormOptionGroupResponse["options"][number],
  ) => void;
  onRemoveAsset: (
    group: OrderFormOptionGroupResponse,
    option: OrderFormOptionGroupResponse["options"][number],
    assetId: string,
  ) => void;
  onRemoveUpload: (
    group: OrderFormOptionGroupResponse,
    option: OrderFormOptionGroupResponse["options"][number],
    uploadKey: string,
  ) => void;
  onSubmit: () => void;
  onUpload: (
    group: OrderFormOptionGroupResponse,
    option: OrderFormOptionGroupResponse["options"][number],
    upload: PendingUploadReference,
  ) => void;
  noticeHref: string;
  pickupDate: string;
  pickupTime: string;
  submitPhase: OrderSubmitPhase;
  submitError: string;
  submitting: boolean;
}) {
  void formState;
  const hasOrderForm = optionGroups.length > 0;
  const ctaEnabled = formReady && Boolean(pickupDate) && Boolean(pickupTime);
  const ctaHint = getOrderFormCtaHint(optionGroups, answers, pickupDate, pickupTime);

  return (
    <div className="figma-scrollbar-none relative h-full w-full overflow-x-hidden overflow-y-auto bg-white" data-ui="order-form-screen">
      <header className="flex h-14 shrink-0 items-center justify-between bg-white">
        <button aria-label="뒤로" className="grid h-12 w-12 place-items-center text-[28px] text-[var(--figma-color-icon-default)]" onClick={onEditPickup} type="button">
          ‹
        </button>
        <h1 className="text-display-sm">주문서</h1>
        <span className="h-12 w-12" />
      </header>
      <div className="flex min-w-0 flex-col gap-[var(--figma-space-lg)] overflow-x-hidden bg-[var(--figma-color-surface-subtle)] p-[var(--figma-space-md)]" data-ui="order-form-body">
        <Link className="flex h-14 items-center justify-between rounded-[var(--figma-radius-sm)] bg-white px-[var(--figma-space-md)] text-heading-md shadow-[var(--figma-shadow-card)]" href={noticeHref}>
          공지사항
          <span className="text-[24px] text-[var(--figma-color-icon-default)]">›</span>
        </Link>
        <section className="min-w-0 overflow-x-hidden rounded-[var(--figma-radius-sm)] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-lg)] shadow-[var(--figma-shadow-card)]" data-ui="ordersheet">
          <h2 className="mb-[var(--figma-space-md)] text-heading-lg">픽업 일시</h2>
          <button className="mb-[var(--figma-space-section-mobile)] flex h-[52px] w-full items-center justify-between rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] px-[var(--figma-space-md)] text-heading-md text-[var(--figma-color-text-tertiary)]" onClick={onEditPickup} type="button">
            <span>{formatPickupDateLabel(pickupDate)}</span>
            <span>{pickupTime}</span>
            <Image alt="" aria-hidden className="shrink-0" height={24} src="/figma-flowmap/calendar-week.svg" width={24} />
          </button>
          {hasOrderForm ? (
            optionGroups.map((group) => (
              <fieldset className="mb-[var(--figma-space-section-mobile)] min-w-0" key={group.id}>
                <legend className="mb-[var(--figma-space-md)] text-heading-lg">
                  {group.required ? <span className="mr-1 text-[var(--figma-color-status-error)]">*</span> : null}
                  {group.label}
                </legend>
                <div className="grid min-w-0 gap-[var(--figma-space-md)]">
                  {group.options.map((option) => {
                    const checked = isOptionSelected(answers, group.id, option.value);
                    const selection = getSelection(answers, group.id, option.value);

                    if (option.inputType === "IMAGE") {
                      return (
                        <UploadOption
                          assetIds={selection?.assetIds}
                          assets={selection?.assets}
                          checked={checked}
                          control={group.selectionType === "MULTI" ? "checkbox" : "radio"}
                          key={option.id}
                          label={option.label}
                          name={group.id}
                          onRemoveAsset={(assetId) => onRemoveAsset(group, option, assetId)}
                          onRemoveUpload={(uploadKey) => onRemoveUpload(group, option, uploadKey)}
                          onSelect={() => onOptionToggle(group, option)}
                          onUpload={(upload) => onUpload(group, option, upload)}
                          pendingUploads={selection?.pendingUploads ?? []}
                          price={formatOptionPrice(option.price, option.priceLabel)}
                        />
                      );
                    }

                    if (isTextInputOption(option.inputType)) {
                      return (
                        <OptionWithInput
                          checked={checked}
                          control={group.selectionType === "MULTI" ? "checkbox" : "radio"}
                          inputType={option.inputType}
                          key={option.id}
                          label={option.label}
                          name={group.id}
                          onSelect={() => onOptionToggle(group, option)}
                          onTextChange={(text) => onAnswerText(group, option, text)}
                          placeholder="입력해주세요"
                          price={formatOptionPrice(option.price, option.priceLabel)}
                          text={selection?.text ?? ""}
                        />
                      );
                    }

                    return (
                      <ChoiceRow
                        checked={checked}
                        control={group.selectionType === "MULTI" ? "checkbox" : "radio"}
                        key={option.id}
                        label={option.label}
                        name={group.id}
                        onSelect={() => onOptionToggle(group, option)}
                        price={formatOptionPrice(option.price, option.priceLabel)}
                      />
                    );
                  })}
                </div>
              </fieldset>
            ))
          ) : (
            <div className="py-[var(--figma-space-xl)] text-center text-body-md text-[var(--figma-color-text-secondary)]">
              {orderFormError || "스토어 주문서를 불러오는 중입니다."}
            </div>
          )}
        </section>
      </div>
      <div className="flex flex-col gap-[13px] bg-white px-[var(--figma-space-md)] pb-[34px] pt-[var(--figma-space-md)]" data-ui="order-form-cta">
        <button
          className={`h-[52px] w-full rounded-[var(--figma-radius-md)] text-heading-md ${ctaEnabled ? "bg-[var(--figma-color-action-primary)] text-white" : "bg-[var(--figma-color-action-disabled)] text-[var(--figma-color-text-disabled)]"}`}
          disabled={!ctaEnabled || submitting}
          onClick={onSubmit}
          type="button"
        >
          {submitting ? getSubmitPhaseLabel(submitPhase) : "다음"}
        </button>
        {!ctaEnabled && ctaHint ? <p className="text-center text-label-sm text-[var(--figma-color-status-error)]">{ctaHint}</p> : null}
        {submitError ? <p className="text-center text-label-sm text-[var(--figma-color-status-error)]">{submitError}</p> : null}
        <button className="w-full text-label-sm text-[var(--figma-color-text-link)]" onClick={onAbort} type="button">
          다음에 주문할게요
        </button>
      </div>
    </div>
  );
}

function isTextInputOption(inputType: string) {
  return inputType === "SELECT_WITH_TEXT" || inputType === "TEXT" || inputType === "TEXTAREA";
}

function formatOptionPrice(price: number | null, priceLabel?: string | null) {
  if (price === null) return priceLabel ?? "";
  return `+ ${new Intl.NumberFormat("ko-KR").format(price)}원`;
}

function getSubmitPhaseLabel(phase: OrderSubmitPhase) {
  if (phase === "uploading") return "이미지 업로드 중";
  if (phase === "drafting") return "주문서 접수 중";
  if (phase === "consuming") return "채팅방 준비 중";
  if (phase === "redirecting") return "로그인으로 이동 중";
  if (phase === "navigating") return "채팅방으로 이동 중";
  return "저장 중";
}

function ChoiceRow({
  checked,
  control,
  label,
  name,
  onSelect,
  price,
}: {
  checked: boolean;
  control: "checkbox" | "radio";
  label: string;
  name: string;
  onSelect: () => void;
  price: string;
}) {
  return (
    <label className="flex min-h-9 items-center justify-between gap-[var(--figma-space-md)]">
      <span className="flex min-w-0 items-center gap-[var(--figma-space-sm)]">
        <input checked={checked} className="sr-only" name={name} onChange={onSelect} type={control} />
        <SelectionControl checked={checked} control={control} />
        <span className="min-w-0 text-body-md">{label}</span>
      </span>
      {price ? <span className="shrink-0 text-number-md">{price}</span> : null}
    </label>
  );
}

function OptionWithInput({
  checked,
  control,
  inputType,
  label,
  name,
  onSelect,
  onTextChange,
  placeholder,
  price,
  text,
}: {
  checked: boolean;
  control: "checkbox" | "radio";
  inputType: string;
  label: string;
  name: string;
  onSelect: () => void;
  onTextChange: (text: string) => void;
  placeholder: string;
  price: string;
  text: string;
}) {
  const inputClassName = "mt-2 w-full rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] px-[var(--figma-space-md)] text-body-md outline-none placeholder:text-[var(--figma-color-text-unavailable)]";

  return (
    <div className="mb-[var(--figma-space-md)]">
      <label className="flex items-center justify-between gap-[var(--figma-space-md)]">
        <span className="flex items-center gap-[var(--figma-space-sm)]">
          <input checked={checked} className="sr-only" name={name} onChange={onSelect} type={control} />
          <SelectionControl checked={checked} control={control} />
          <span className="text-body-md">{label}</span>
        </span>
        {price ? <span className="text-label-md">{price}</span> : null}
      </label>
      {inputType === "TEXTAREA" ? (
        <textarea
          className={`${inputClassName} min-h-[92px] resize-none py-[var(--figma-space-sm)]`}
          onChange={(event) => onTextChange(event.target.value)}
          onFocus={onSelect}
          placeholder={placeholder}
          value={text}
        />
      ) : (
        <input
          className={`${inputClassName} h-11`}
          onChange={(event) => onTextChange(event.target.value)}
          onFocus={onSelect}
          placeholder={placeholder}
          value={text}
        />
      )}
    </div>
  );
}

function UploadOption({
  assetIds = EMPTY_ASSET_IDS,
  assets,
  checked,
  control,
  label,
  name,
  onRemoveAsset,
  onRemoveUpload,
  onSelect,
  onUpload,
  pendingUploads,
  price,
}: {
  assetIds?: string[];
  assets?: ReferenceAssetPreview[];
  checked: boolean;
  control: "checkbox" | "radio";
  label: string;
  name: string;
  onRemoveAsset: (assetId: string) => void;
  onRemoveUpload: (uploadKey: string) => void;
  onSelect: () => void;
  onUpload: (upload: PendingUploadReference) => void;
  pendingUploads: PendingUploadReference[];
  price: string;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("사진을 임시 저장하지 못했어요");
  const [previewUrlsByKey, setPreviewUrlsByKey] = useState<Record<string, string>>({});
  const [deliveryUrlByAssetId, setDeliveryUrlByAssetId] = useState<Map<string, string>>(() => new Map());
  const resolvedAssets = useMemo(() => buildAssetPreviews(assetIds, assets, deliveryUrlByAssetId), [assetIds, assets, deliveryUrlByAssetId]);
  const previewUrlsRef = useRef<Record<string, string>>({});
  const imageCount = assetIds.length + pendingUploads.length;

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;
    return () => {
      Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const activeKeys = new Set(pendingUploads.map((upload) => upload.uploadKey));

    for (const [uploadKey, previewUrl] of Object.entries(previewUrlsRef.current)) {
      if (!activeKeys.has(uploadKey)) {
        URL.revokeObjectURL(previewUrl);
        delete previewUrlsRef.current[uploadKey];
      }
    }

    for (const pendingUpload of pendingUploads) {
      if (previewUrlsRef.current[pendingUpload.uploadKey]) continue;

      void readPendingUpload(pendingUpload.uploadKey).then((record) => {
        if (cancelled || !record?.file || previewUrlsRef.current[pendingUpload.uploadKey]) return;

        const previewUrl = URL.createObjectURL(record.file);
        previewUrlsRef.current[pendingUpload.uploadKey] = previewUrl;
        setPreviewUrlsByKey((current) => ({ ...current, [pendingUpload.uploadKey]: previewUrl }));
      });
    }

    return () => {
      cancelled = true;
    };
  }, [pendingUploads]);

  useEffect(() => {
    let cancelled = false;
    const missingAssetIds = resolvedAssets.filter((asset) => asset.assetId && !asset.deliveryUrl).map((asset) => asset.assetId as string);
    if (!missingAssetIds.length) {
      return () => {
        cancelled = true;
      };
    }

    void resolveAssetDeliveryUrls(uniqueValues(missingAssetIds)).then((deliveryUrlByAssetId) => {
      if (cancelled || !deliveryUrlByAssetId.size) return;
      setDeliveryUrlByAssetId((current) => new Map([...current, ...deliveryUrlByAssetId]));
    });

    return () => {
      cancelled = true;
    };
  }, [resolvedAssets]);

  async function handleFiles(files?: FileList | null) {
    const selectedFiles = Array.from(files ?? []).slice(0, Math.max(0, 5 - imageCount));
    if (!selectedFiles.length) return;

    const validationError = selectedFiles.map(validateImageUploadFile).find(Boolean);
    if (validationError) {
      setStatus("error");
      setErrorMessage(validationError);
      return;
    }

    onSelect();
    setStatus("uploading");
    setErrorMessage("");
    try {
      const pendingReferences = await Promise.all(selectedFiles.map((file) => persistPendingUpload(file)));
      const nextPreviewUrls: Record<string, string> = {};

      pendingReferences.forEach((pendingReference, index) => {
        const previewUrl = URL.createObjectURL(selectedFiles[index]);
        previewUrlsRef.current[pendingReference.uploadKey] = previewUrl;
        nextPreviewUrls[pendingReference.uploadKey] = previewUrl;
      });

      setPreviewUrlsByKey((current) => ({ ...current, ...nextPreviewUrls }));
      pendingReferences.forEach(onUpload);
      setStatus("done");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "사진을 임시 저장하지 못했어요");
    }
  }

  function handleRemoveUpload(uploadKey: string) {
    const previewUrl = previewUrlsRef.current[uploadKey];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    delete previewUrlsRef.current[uploadKey];
    setPreviewUrlsByKey((current) => {
      const next = { ...current };
      delete next[uploadKey];
      return next;
    });
    void clearPendingUpload(uploadKey);
    onRemoveUpload(uploadKey);
  }

  return (
    <div className="mt-[var(--figma-space-md)] min-w-0">
      <label className="flex items-center justify-between gap-[var(--figma-space-md)]">
        <span className="flex items-center gap-[var(--figma-space-sm)]">
          <input checked={checked} className="sr-only" name={name} onChange={onSelect} type={control} />
          <SelectionControl checked={checked} control={control} />
          <span className="text-body-md">{label}</span>
        </span>
        {price ? <span className="text-label-md">{price}</span> : null}
      </label>
      <div className="figma-scrollbar-none mt-3 flex w-full min-w-0 max-w-full touch-pan-x gap-2 overflow-x-auto overscroll-x-contain pb-1" data-ui="order-image-upload-list">
        <label className="relative grid h-[100px] w-[100px] shrink-0 place-items-center overflow-hidden rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] text-[28px] text-[var(--figma-color-text-tertiary)]">
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={status === "uploading" || imageCount >= 5}
            multiple
            onChange={(event) => {
              void handleFiles(event.target.files);
              event.currentTarget.value = "";
            }}
            type="file"
          />
          {status === "uploading" ? (
            "..."
          ) : (
            <Image alt="" aria-hidden className={imageCount >= 5 ? "opacity-35" : undefined} height={48} src="/figma-flowmap/upload.svg" width={48} />
          )}
        </label>
        {pendingUploads.map((upload, index) => {
          const previewUrl = previewUrlsByKey[upload.uploadKey];
          return (
            <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)]" key={upload.uploadKey}>
              {previewUrl ? (
                <SafeImage alt={`${label} 첨부 이미지 ${index + 1}`} className="object-cover" fill sizes="100px" src={previewUrl} />
              ) : (
                <div className="grid h-full w-full place-items-center text-label-xs text-[var(--figma-color-text-tertiary)]">이미지</div>
              )}
              <button
                aria-label={`${upload.name} 삭제`}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-[rgb(18_22_28/72%)] text-white"
                onClick={() => handleRemoveUpload(upload.uploadKey)}
                type="button"
              >
                <X aria-hidden size={14} strokeWidth={2.5} />
              </button>
            </div>
          );
        })}
        {resolvedAssets.map((asset, index) => (
          <div className="relative grid h-[100px] w-[100px] shrink-0 place-items-center overflow-hidden rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] text-label-xs text-[var(--figma-color-text-tertiary)]" key={asset.assetId ?? `${asset.deliveryUrl}-${index}`}>
            {asset.deliveryUrl ? (
              <SafeImage alt={`${label} 첨부 이미지 ${index + 1}`} className="object-cover" fill sizes="100px" src={asset.deliveryUrl} />
            ) : (
              `이미지 ${index + 1}`
            )}
            <button
              aria-label={`첨부 이미지 ${index + 1} 삭제`}
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-[rgb(18_22_28/72%)] text-white"
              onClick={() => {
                if (asset.assetId) onRemoveAsset(asset.assetId);
              }}
              type="button"
            >
              <X aria-hidden size={14} strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
      <p className={`mt-2 text-label-xs ${status === "error" ? "text-[var(--figma-color-status-error)]" : "text-[var(--figma-color-text-tertiary)]"}`}>
        {status === "error" ? errorMessage : "* 기본체 or 필기체 작성해서 보내주세요"}
      </p>
    </div>
  );
}

function buildAssetPreviews(
  assetIds: string[],
  assets: ReferenceAssetPreview[] | undefined,
  deliveryUrlByAssetId = new Map<string, string>(),
) {
  return uniqueValues(assetIds).map((assetId, index) => {
    const asset = findAssetPreview(assets, assetId, index);
    return {
      ...asset,
      assetId,
      deliveryUrl: asset?.deliveryUrl ?? deliveryUrlByAssetId.get(assetId) ?? null,
      sortOrder: asset?.sortOrder ?? index,
      source: asset?.source ?? null,
    };
  });
}

function findAssetPreview(assets: ReferenceAssetPreview[] | undefined, assetId: string, index: number) {
  return assets?.find((asset) => asset.assetId === assetId) ?? assets?.[index];
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
    // Asset variants may not be ready yet. Fall back to the original asset URL.
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
    variants.find((variant) => variant.type === "THUMBNAIL" && variant.deliveryUrl) ??
    variants.find((variant) => variant.type === "MEDIUM" && variant.deliveryUrl) ??
    variants.find((variant) => variant.type === "LARGE" && variant.deliveryUrl) ??
    variants.find((variant) => variant.deliveryUrl)
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
