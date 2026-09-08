import { clearPendingUpload } from "@/shared/lib/pending-image-upload-store";

const ORDER_FORM_RESUME_KEY_PREFIX = "p3.buyer.order-form-resume.";
const ORDER_FORM_SUBMITTED_DRAFT_CLEANUP_KEY_PREFIX = "p3.buyer.order-form-submitted-draft.";

export type OrderFormResume<TAnswers> = {
  answers: TAnswers;
  pickupDate: string;
  pickupTime: string;
  startUploadKey?: string;
  step: "form";
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
    if (!parsed.answers || !parsed.pickupDate || !parsed.pickupTime || parsed.step !== "form") return null;

    return {
      answers: parsed.answers,
      pickupDate: parsed.pickupDate,
      pickupTime: parsed.pickupTime,
      startUploadKey: parsed.startUploadKey,
      step: parsed.step,
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
