type Id = string;

const path = (value: string) => encodeURIComponent(value);

export const apiEndpoints = {
  assets: {
    list: "/assets",
    upload: "/assets",
    detail: (assetId: Id) => `/assets/${path(assetId)}`,
    delete: (assetId: Id) => `/assets/${path(assetId)}`,
    variants: (assetId: Id) => `/assets/${path(assetId)}/variants`,
  },
  auth: {
    me: "/auth/me",
    syncMe: "/auth/me/sync",
    registerMe: "/auth/me/registration",
  },
  stores: {
    detail: (slug: string) => `/stores/${path(slug)}`,
    representativeImages: (slug: string) => `/stores/${path(slug)}/representative-images`,
    galleryItems: (slug: string) => `/stores/${path(slug)}/gallery-items`,
    galleryItem: (slug: string, galleryItemId: Id) => `/stores/${path(slug)}/gallery-items/${path(galleryItemId)}`,
    orderForm: (slug: string) => `/stores/${path(slug)}/order-form`,
    orderSettings: (slug: string) => `/stores/${path(slug)}/order-settings`,
  },
  orderFormDrafts: {
    create: (slug: string) => `/stores/${path(slug)}/order-form-drafts`,
    consume: (draftKey: string) => `/order-form-drafts/${path(draftKey)}/consume`,
  },
  inquiries: {
    open: (slug: string) => `/stores/${path(slug)}/inquiries/open`,
    list: "/inquiries",
    detail: (inquiryId: Id) => `/inquiries/${path(inquiryId)}`,
    events: (inquiryId: Id) => `/inquiries/${path(inquiryId)}/events`,
    storePolicies: (inquiryId: Id) => `/inquiries/${path(inquiryId)}/store-policies`,
    orderFormSubmission: (inquiryId: Id, submissionId: Id) => `/inquiries/${path(inquiryId)}/order-form-submissions/${path(submissionId)}`,
    markRead: (inquiryId: Id) => `/inquiries/${path(inquiryId)}/read`,
    trash: (inquiryId: Id) => `/inquiries/${path(inquiryId)}/trash`,
    restore: (inquiryId: Id) => `/inquiries/${path(inquiryId)}/restore`,
  },
  confirmations: {
    list: (inquiryId: Id) => `/inquiries/${path(inquiryId)}/confirmations`,
    detail: (inquiryId: Id, confirmationId: Id) => `/inquiries/${path(inquiryId)}/confirmations/${path(confirmationId)}`,
    markViewed: (inquiryId: Id, confirmationId: Id) => `/inquiries/${path(inquiryId)}/confirmations/${path(confirmationId)}/viewed`,
    requestRevision: (inquiryId: Id, confirmationId: Id) => `/inquiries/${path(inquiryId)}/confirmations/${path(confirmationId)}/revision`,
    paymentCta: (inquiryId: Id, confirmationId: Id) => `/inquiries/${path(inquiryId)}/confirmations/${path(confirmationId)}/payment-cta`,
    paymentAttempts: (inquiryId: Id, confirmationId: Id) => `/inquiries/${path(inquiryId)}/confirmations/${path(confirmationId)}/payment-attempts`,
  },
  paymentAttempts: {
    capture: (paymentAttemptId: Id) => `/payment-attempts/${path(paymentAttemptId)}/capture`,
  },
  reports: {
    create: "/reports",
  },
  serviceInquiries: {
    create: "/service-inquiries",
  },
  orders: {
    list: "/orders",
    detail: (orderId: Id) => `/orders/${path(orderId)}`,
    refundRequest: (orderId: Id) => `/orders/${path(orderId)}/refund-request`,
  },
  notifications: {
    list: "/notifications",
    detail: (notificationId: Id) => `/notifications/${path(notificationId)}`,
    unreadCount: "/notifications/unread-count",
    read: (notificationId: Id) => `/notifications/${path(notificationId)}/read`,
    readAll: "/notifications/read-all",
  },
} as const;
