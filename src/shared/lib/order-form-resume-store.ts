import { clearPendingUpload } from "@/shared/lib/pending-image-upload-store";

const ORDER_FORM_RESUME_KEY_PREFIX = "p3.buyer.order-form-resume.";
const ORDER_FORM_SUBMITTED_DRAFT_CLEANUP_KEY_PREFIX = "p3.buyer.order-form-submitted-draft.";

export type OrderFormResumeMode = "edit" | "new";
export type OrderFormResumeStep = "pickup-date" | "pickup-time" | "pickup-selected" | "form";

export type OrderFormResumeStartReference = {
  assetId?: string;
  source?: string;
  uploadKey?: string;
};

export type OrderFormResume<TAnswers> = {
  answers: TAnswers;
  mode?: OrderFormResumeMode;
  noticeAgreed?: boolean;
  pickupDate?: string;
  pickupTime?: string;
  startReference?: OrderFormResumeStartReference;
  startUploadKey?: string;
  submissionId?: string;
  step: OrderFormResumeStep;
};

type SubmittedOrderFormDraftCleanup = {
  pendingUploadKeys: string[];
  slug: string;
  startUploadKey?: string;
};

export function readOrderFormResume<TAnswers>(slug: string): OrderFormResume<TAnswers> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(`${ORDER_FORM_RESUME_KEY_PREFIX}${slug}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<OrderFormResume<TAnswers>>;
    const step = normalizeResumeStep(parsed.step);
    if (!parsed.answers || !step) return null;

    return {
      answers: parsed.answers,
      mode: parsed.mode === "edit" ? "edit" : "new",
      noticeAgreed: parsed.noticeAgreed === true,
      pickupDate: typeof parsed.pickupDate === "string" ? parsed.pickupDate : "",
      pickupTime: typeof parsed.pickupTime === "string" ? parsed.pickupTime : "",
      startReference: normalizeStartReference(parsed.startReference, parsed.startUploadKey),
      startUploadKey: parsed.startUploadKey,
      submissionId: typeof parsed.submissionId === "string" ? parsed.submissionId : undefined,
      step,
    };
  } catch {
    return null;
  }
}

export function saveOrderFormResume<TAnswers>(slug: string, value: OrderFormResume<TAnswers>) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${ORDER_FORM_RESUME_KEY_PREFIX}${slug}`, JSON.stringify(value));
}

export function clearOrderFormResume(slug: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(`${ORDER_FORM_RESUME_KEY_PREFIX}${slug}`);
}

export function saveSubmittedOrderFormDraftCleanup(draftKey: string, cleanup: SubmittedOrderFormDraftCleanup) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${ORDER_FORM_SUBMITTED_DRAFT_CLEANUP_KEY_PREFIX}${draftKey}`, JSON.stringify(cleanup));
}

export async function clearSubmittedOrderFormDraftCleanup(draftKey: string) {
  if (typeof window === "undefined") return;

  const cleanup = readSubmittedOrderFormDraftCleanup(draftKey);
  window.sessionStorage.removeItem(`${ORDER_FORM_SUBMITTED_DRAFT_CLEANUP_KEY_PREFIX}${draftKey}`);

  if (!cleanup) return;

  clearOrderFormResume(cleanup.slug);

  const uploadKeys = uniqueValues([cleanup.startUploadKey, ...cleanup.pendingUploadKeys]);
  await Promise.all(uploadKeys.map((uploadKey) => clearPendingUpload(uploadKey)));
}

function readSubmittedOrderFormDraftCleanup(draftKey: string): SubmittedOrderFormDraftCleanup | null {
  try {
    const raw = window.sessionStorage.getItem(`${ORDER_FORM_SUBMITTED_DRAFT_CLEANUP_KEY_PREFIX}${draftKey}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<SubmittedOrderFormDraftCleanup>;
    if (!parsed.slug || !Array.isArray(parsed.pendingUploadKeys)) return null;

    return {
      pendingUploadKeys: parsed.pendingUploadKeys.filter((value): value is string => Boolean(value)),
      slug: parsed.slug,
      startUploadKey: parsed.startUploadKey,
    };
  } catch {
    return null;
  }
}

function uniqueValues(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function normalizeResumeStep(value: unknown): OrderFormResumeStep | null {
  if (value === "pickup-date" || value === "pickup-time" || value === "pickup-selected" || value === "form") return value;
  return null;
}

function normalizeStartReference(
  value: unknown,
  legacyStartUploadKey?: string,
): OrderFormResumeStartReference | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return legacyStartUploadKey ? { source: "USER_UPLOAD", uploadKey: legacyStartUploadKey } : undefined;
  }

  const record = value as Record<string, unknown>;
  const assetId = typeof record.assetId === "string" ? record.assetId : undefined;
  const source = typeof record.source === "string" ? record.source : undefined;
  const uploadKey = typeof record.uploadKey === "string" ? record.uploadKey : legacyStartUploadKey;

  if (!assetId && !uploadKey) return undefined;
  return { assetId, source, uploadKey };
}
