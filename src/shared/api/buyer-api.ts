import { ApiError, apiFetch } from "@/shared/api/client";
import { apiEndpoints } from "@/shared/api/endpoints";

export type PublicRepresentativeImageResponse = {
  id: string;
  assetId: string;
  deliveryUrl: string;
  sortOrder: number;
};

export type PublicAssetVariantResponse = {
  type: "THUMBNAIL" | "MEDIUM" | "LARGE" | string;
  deliveryUrl: string;
  width: number;
  height: number;
};

export type PublicStoreResponse = {
  id: string;
  profileAssetId: string | null;
  profileDeliveryUrl: string | null;
  name: string;
  slug: string;
  description: string;
  contact: string | null;
  contactVisible: boolean;
  snsLinks: string | null;
  businessHours: string | null;
  address: string | null;
  representativeImages: PublicRepresentativeImageResponse[];
};

export type PublicStorePageResponse = {
  items: PublicStoreResponse[];
  hasNext: boolean;
  nextCursorUpdatedAt: string | null;
  nextCursorId: string | null;
};

export type GalleryItemResponse = {
  id: string;
  storeId: string;
  assetId: string;
  deliveryUrl: string | null;
  variants: PublicAssetVariantResponse[];
  sortOrder: number;
  featured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderFormOptionResponse = {
  id: string;
  label: string;
  value: string;
  inputType: string;
  price: number | null;
  priceLabel: string | null;
  settings: string | null;
  active: boolean;
  sortOrder: number;
};

export type OrderFormOptionGroupResponse = {
  id: string;
  categoryGroupId: string | null;
  label: string;
  selectionType: string;
  required: boolean;
  sortOrder: number;
  options: OrderFormOptionResponse[];
};

export type OrderFormCategoryGroupResponse = {
  id: string;
  category: string;
  title: string;
  description: string | null;
  sortOrder: number;
  optionGroups: OrderFormOptionGroupResponse[];
};

export type OrderFormResponse = {
  id: string;
  storeId: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  optionGroups: OrderFormOptionGroupResponse[];
  groups: OrderFormCategoryGroupResponse[];
};

export type StoreOrderSettingAvailabilityResponse = {
  storeId: string;
  preOrderNotice: string | null;
  cancellationCutoffDays: number;
  dates: {
    date: string;
    available: boolean;
    holiday: boolean;
    pickupSlots: string[];
    dailyOrderCapacity: number;
    remainingOrderCapacity: number;
    cancellationCutoffAt: string;
  }[];
};

export type UserProfileResponse = {
  userId: string;
  email: string | null;
  phoneNumber: string | null;
  signupProvider: string;
  name: string | null;
  role: string | null;
  status: string;
  nextRoute: string | null;
};

export type UserProfileUpdateRequest = {
  email?: string | null;
  name?: string | null;
};

export type AssetDetailResponse = {
  id: string;
  uploadedBy: string;
  originalFilename: string;
  contentType: string;
  size: number;
  status: string;
  deliveryUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type AssetUploadResponse = {
  assetId: string;
  deliveryUrl: string;
};

export type AssetUploadType = "ORDER_REFERENCE" | "STORE_GALLERY" | "STORE_PROFILE";

export type AssetVariantResponse = {
  assetId: string;
  variants: {
    variantId: string;
    type: string;
    deliveryUrl: string;
    width?: number;
    height?: number;
  }[];
};

export type InquiryLatestEventResponse = {
  eventId: string;
  referenceId: string | null;
  type: string;
  senderUserId: string | null;
  content: string | null;
  createdAt: string;
};

export type InquiryLatestOrderFormSubmissionResponse = {
  submissionId: string;
  submittedAt: string;
};

export type InquiryListItemResponse = {
  inquiryId: string;
  storeId: string;
  status: string;
  storeName: string;
  storeSlug: string;
  participant: {
    userId: string;
    name: string;
    profileImageDeliveryUrl?: string | null;
  };
  unreadCount: number;
  latestEventAt: string | null;
  latestEvent?: InquiryLatestEventResponse | null;
  latestOrderFormSubmission?: InquiryLatestOrderFormSubmissionResponse | null;
  myLastReadAt: string | null;
  createdAt: string;
};

export type InquiryChatDetailResponse = {
  inquiryId: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  participant: {
    userId: string;
    name: string;
    profileImageDeliveryUrl?: string | null;
  };
  startReferenceAsset: {
    assetId: string;
    source: string;
    deliveryUrl: string | null;
  } | null;
  startReferenceAssets?: {
    assetId: string;
    source: string;
    sortOrder?: number;
    deliveryUrl?: string | null;
  }[];
  myLastReadAt: string | null;
  participantLastReadAt: string | null;
  createdAt: string;
};

export type ChatTimelineItemResponse = {
  eventId: string;
  referenceId: string;
  type: string;
  senderUserId: string | null;
  createdAt: string;
  content: string | null;
  assetIds: string[];
};

export type ChatTimelinePageResponse = {
  items: ChatTimelineItemResponse[];
  hasNext: boolean;
  nextCursorCreatedAt: string | null;
  nextCursorId: string | null;
};

export type OrderListItemResponse = {
  id: string;
  storeId: string;
  buyerUserId: string;
  inquiryId: string;
  confirmationId: string;
  orderNumber: string;
  menuName: string;
  optionSummary: string;
  startReferenceAssets: string[];
  paidAmount: number;
  pickupAt: string;
  status: string;
  cancelRequestedAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderResponse = Omit<OrderListItemResponse, "startReferenceAssets">;

export type OrderDetailResponse = {
  order: OrderResponse;
  paymentAttempt: {
    paymentAttemptId: string;
    confirmationId: string;
    sessionId: string;
    amount: number;
    status: string;
    failureCode: string | null;
    createdAt: string;
    completedAt: string | null;
    expiresAt: string;
    expired: boolean;
  } | null;
  refunds: unknown[];
};

export type NotificationResponse = {
  id: string;
  type: string;
  referenceType: string;
  referenceId: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type OrderFormReferenceAssetSource = "STORE_GALLERY" | "USER_UPLOAD";

export type OrderFormDraftRequest = {
  orderFormTemplateId: string;
  pickupDate: string;
  pickupTime: string;
  noticeAgreed: boolean;
  cancellationRefundAgreed: boolean;
  formAnswers: {
    optionGroupId: string;
    value: {
      optionValue: string;
      text?: string;
      assetIds?: string[];
    }[];
  }[];
  startReferenceAsset?: {
    assetId: string;
    source: OrderFormReferenceAssetSource;
  } | null;
};

export type OrderFormDraftResponse = {
  draftKey: string;
  expiresAt: string;
};

export type OrderFormDraftConsumeResponse = {
  inquiryId: string;
  submissionId: string;
};

export type InquiryOpenResponse = {
  inquiryId: string;
};

export type InquiryStorePolicyResponse = {
  orderNotice: string;
  cancellationRefundPolicy: string;
};

export type OrderFormSubmissionResponse = {
  id: string;
  inquiryId: string;
  templateId: string;
  submittedBy: string;
  pickupDate: string;
  pickupTime: string;
  answers: string;
  referenceAssets: OrderFormSubmissionReferenceAsset[] | string | null;
  cancellationRefundAgreed: boolean;
  submittedAt: string;
};

export type OrderFormSubmissionReferenceAsset = {
  assetId?: string | null;
  deliveryUrl?: string | null;
  sortOrder?: number | null;
  source?: OrderFormReferenceAssetSource | string | null;
};

export type OrderConfirmationResponse = {
  confirmationId: string;
  inquiryId: string;
  orderFormSubmissionId: string;
  confirmationTitle: string;
  summaryText: string | null;
  amount: number;
  pickupAt: string | null;
  status: string;
  sentAt: string | null;
  buyerViewedAt: string | null;
  createdAt: string;
};

export type OrderConfirmationDetailResponse = OrderConfirmationResponse & {
  storeNameSnapshot: string | null;
  orderSummary: string | null;
  additionalItems: string | null;
  sellerNote: string | null;
  revisionRequestedAt: string | null;
  replacedByConfirmationId: string | null;
};

export type PaymentAttemptResponse = {
  paymentAttemptId: string;
  confirmationId: string;
  sessionId: string;
  amount: number;
  status: string;
  failureCode: string | null;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string;
  expired: boolean;
};

export type PaymentCtaResponse = {
  inquiryId: string;
  confirmationId: string;
  amount: number;
  canPay: boolean;
  status: string;
  reason: string | null;
  buyerViewedAt: string | null;
  latestPaymentAttempt: PaymentAttemptResponse | null;
};

export type PaymentPreparationResponse = {
  paymentAttemptId: string;
  clientId: string;
  sessionId: string;
  amount: number;
  payerId?: string | null;
  orderName: string;
  authnClientId: string;
  authnState: string;
  entryPath: string;
  authenticationUrl: string;
  point3PaymentOrigin: string;
  failUrl?: string;
  successUrl?: string;
  expiresAt: string;
};

export type PaymentCaptureRequest = {
  sessionId: string;
  payerId: string;
};

export type PaymentCaptureResponse = {
  paymentAttemptId: string;
  sessionId: string;
  amount: number;
  status: string;
  orderId: string | null;
  failureCode: string | null;
};

export type ReportCreateRequest = {
  targetType: "USER" | "STORE" | "GALLERY_ITEM" | "ORDER" | "PAYMENT_ATTEMPT" | "MESSAGE" | "REVIEW";
  targetId: string;
  reason: string;
  evidence?: string | null;
};

export type ServiceInquiryCreateRequest = {
  title: string;
  body: string;
};

export type NotificationUnreadCountResponse = {
  unreadCount: number;
};

export function getStores() {
  return apiFetch<PublicStorePageResponse>("/stores");
}

export function getStore(slug: string) {
  return apiFetch<PublicStoreResponse>(apiEndpoints.stores.detail(slug));
}

export function getStoreRepresentativeImages(slug: string) {
  return apiFetch<PublicRepresentativeImageResponse[]>(apiEndpoints.stores.representativeImages(slug));
}

export function getStoreGalleryItems(slug: string) {
  return apiFetch<GalleryItemResponse[]>(apiEndpoints.stores.galleryItems(slug));
}

export function getStoreGalleryItem(slug: string, galleryItemId: string) {
  return apiFetch<GalleryItemResponse>(apiEndpoints.stores.galleryItem(slug, galleryItemId));
}

export function getStoreOrderForm(slug: string) {
  return apiFetch<OrderFormResponse>(apiEndpoints.stores.orderForm(slug));
}

export function getStoreOrderSettings(slug: string, from: string, to: string) {
  return apiFetch<StoreOrderSettingAvailabilityResponse>(`${apiEndpoints.stores.orderSettings(slug)}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
}

export function getMe() {
  return apiFetch<UserProfileResponse>(apiEndpoints.auth.me);
}

export function updateMe(request: UserProfileUpdateRequest) {
  return apiFetch<UserProfileResponse>(apiEndpoints.auth.me, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export function getAssets() {
  return apiFetch<AssetDetailResponse[]>(apiEndpoints.assets.list);
}

export function uploadAsset(file: File, type: AssetUploadType = "ORDER_REFERENCE") {
  if (!(file instanceof File)) {
    throw new ApiError("이미지 파일을 다시 선택해 주세요.", 400);
  }

  const formData = new FormData();
  formData.set("file", file);
  formData.set("type", type);

  return apiFetch<AssetUploadResponse>(apiEndpoints.assets.upload, {
    method: "POST",
    body: formData,
  });
}

export function getAsset(assetId: string) {
  return apiFetch<AssetDetailResponse>(apiEndpoints.assets.detail(assetId));
}

export function deleteAsset(assetId: string) {
  return apiFetch<void>(apiEndpoints.assets.delete(assetId), {
    method: "DELETE",
  });
}

export function getAssetVariants(assetId: string) {
  return apiFetch<AssetVariantResponse>(apiEndpoints.assets.variants(assetId));
}

export function openInquiry(slug: string) {
  return apiFetch<InquiryOpenResponse>(apiEndpoints.inquiries.open(slug), {
    method: "POST",
  });
}

export function createOrderFormDraft(slug: string, request: OrderFormDraftRequest) {
  const startReferenceAsset = request.startReferenceAsset
    ? {
        assetId: request.startReferenceAsset.assetId,
        source: normalizeOrderFormReferenceAssetSource(request.startReferenceAsset.source),
      }
    : undefined;

  const wireRequest: OrderFormDraftRequest = {
    ...request,
  };

  if (startReferenceAsset) {
    wireRequest.startReferenceAsset = startReferenceAsset;
  } else {
    delete wireRequest.startReferenceAsset;
  }

  return apiFetch<OrderFormDraftResponse>(apiEndpoints.orderFormDrafts.create(slug), {
    method: "POST",
    body: JSON.stringify(wireRequest),
  });
}

function normalizeOrderFormReferenceAssetSource(source: string): OrderFormReferenceAssetSource {
  const normalized = source.replaceAll("\\", "").trim();
  return normalized === "USER_UPLOAD" ? "USER_UPLOAD" : "STORE_GALLERY";
}

export function consumeOrderFormDraft(draftKey: string) {
  return apiFetch<OrderFormDraftConsumeResponse>(apiEndpoints.orderFormDrafts.consume(draftKey), {
    method: "POST",
  });
}

export function getInquiries(params: { status?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set("status", params.status);

  const query = searchParams.toString();
  return apiFetch<InquiryListItemResponse[]>(`${apiEndpoints.inquiries.list}${query ? `?${query}` : ""}`);
}

export function getInquiry(inquiryId: string) {
  return apiFetch<InquiryChatDetailResponse>(apiEndpoints.inquiries.detail(inquiryId));
}

export function getInquiryTimeline(inquiryId: string, params: { size?: number } = {}) {
  const searchParams = new URLSearchParams();
  if (params.size) searchParams.set("size", String(params.size));

  const query = searchParams.toString();
  return apiFetch<ChatTimelinePageResponse>(`${apiEndpoints.inquiries.events(inquiryId)}${query ? `?${query}` : ""}`);
}

export function markInquiryRead(inquiryId: string) {
  return apiFetch<void>(apiEndpoints.inquiries.markRead(inquiryId), {
    method: "PATCH",
  });
}

export function trashInquiry(inquiryId: string) {
  return apiFetch<void>(apiEndpoints.inquiries.trash(inquiryId), {
    method: "PATCH",
  });
}

export function restoreInquiry(inquiryId: string) {
  return apiFetch<void>(apiEndpoints.inquiries.restore(inquiryId), {
    method: "PATCH",
  });
}

export function getInquiryStorePolicies(inquiryId: string) {
  return apiFetch<InquiryStorePolicyResponse>(apiEndpoints.inquiries.storePolicies(inquiryId));
}

export function getOrderFormSubmission(inquiryId: string, submissionId: string) {
  return apiFetch<OrderFormSubmissionResponse>(apiEndpoints.inquiries.orderFormSubmission(inquiryId, submissionId));
}

export function getOrderConfirmations(inquiryId: string) {
  return apiFetch<OrderConfirmationDetailResponse[]>(apiEndpoints.confirmations.list(inquiryId));
}

export function getOrderConfirmation(inquiryId: string, confirmationId: string) {
  return apiFetch<OrderConfirmationDetailResponse>(apiEndpoints.confirmations.detail(inquiryId, confirmationId));
}

export function markOrderConfirmationViewed(inquiryId: string, confirmationId: string) {
  return apiFetch<OrderConfirmationDetailResponse>(apiEndpoints.confirmations.markViewed(inquiryId, confirmationId), {
    method: "PATCH",
  });
}

export function requestOrderConfirmationRevision(inquiryId: string, confirmationId: string) {
  return apiFetch<OrderConfirmationDetailResponse>(apiEndpoints.confirmations.requestRevision(inquiryId, confirmationId), {
    method: "PATCH",
  });
}

export function getPaymentCta(inquiryId: string, confirmationId: string) {
  return apiFetch<PaymentCtaResponse>(apiEndpoints.confirmations.paymentCta(inquiryId, confirmationId));
}

export function getPaymentAttempts(inquiryId: string, confirmationId: string) {
  return apiFetch<PaymentAttemptResponse[]>(apiEndpoints.confirmations.paymentAttempts(inquiryId, confirmationId));
}

export function preparePaymentAttempt(inquiryId: string, confirmationId: string) {
  return apiFetch<PaymentPreparationResponse>(apiEndpoints.confirmations.paymentAttempts(inquiryId, confirmationId), {
    method: "POST",
  });
}

export function capturePaymentAttempt(paymentAttemptId: string, request: PaymentCaptureRequest) {
  return apiFetch<PaymentCaptureResponse>(apiEndpoints.paymentAttempts.capture(paymentAttemptId), {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function createReport(request: ReportCreateRequest) {
  return apiFetch<unknown>(apiEndpoints.reports.create, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function createServiceInquiry(request: ServiceInquiryCreateRequest) {
  return apiFetch<unknown>(apiEndpoints.serviceInquiries.create, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getOrders() {
  return apiFetch<OrderListItemResponse[]>(apiEndpoints.orders.list);
}

export function getOrder(orderId: string) {
  return apiFetch<OrderDetailResponse>(apiEndpoints.orders.detail(orderId));
}

export function requestOrderCancel(orderId: string, reason: string) {
  return apiFetch<OrderResponse>(apiEndpoints.orders.cancelRequest(orderId), {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function getNotifications() {
  return apiFetch<NotificationResponse[]>(apiEndpoints.notifications.list);
}

export function readNotification(notificationId: string) {
  return apiFetch<NotificationResponse>(apiEndpoints.notifications.read(notificationId), {
    method: "PATCH",
  });
}

export function getNotification(notificationId: string) {
  return apiFetch<NotificationResponse>(apiEndpoints.notifications.detail(notificationId));
}

export function getNotificationUnreadCount() {
  return apiFetch<NotificationUnreadCountResponse>(apiEndpoints.notifications.unreadCount);
}

export function readAllNotifications() {
  return apiFetch<void>(apiEndpoints.notifications.readAll, {
    method: "PATCH",
  });
}
