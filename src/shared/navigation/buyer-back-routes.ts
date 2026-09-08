import type { PageKey } from "@/features/flow-blueprint/buyer-blueprint-page";

export const BUYER_ROOT_ROUTE = "/";

export const buyerBackRoutePolicy = {
  auth: BUYER_ROOT_ROUTE,
  authCallback: "/auth",
  authSync: "/auth",
  error: BUYER_ROOT_ROUTE,
  forbidden: BUYER_ROOT_ROUTE,
  home: BUYER_ROOT_ROUTE,
  inquiries: BUYER_ROOT_ROUTE,
  inquiryDetail: "/inquiries",
  me: BUYER_ROOT_ROUTE,
  notifications: BUYER_ROOT_ROUTE,
  orderDetail: "/orders",
  orders: BUYER_ROOT_ROUTE,
  paymentDetail: "/payments",
  payments: BUYER_ROOT_ROUTE,
  productDetail: "/stores",
  role: "/auth",
  settings: "/me",
  storeDetail: "/stores",
  stores: BUYER_ROOT_ROUTE,
} satisfies Record<PageKey, string>;

export function getBuyerBackHref(pageKey: PageKey, context?: string) {
  if (pageKey === "productDetail") {
    return getBuyerStoreHrefFromContext(context) ?? buyerBackRoutePolicy.productDetail;
  }

  if (pageKey === "storeDetail" && context?.includes("notice=1")) {
    return getBuyerStoreHrefFromContext(context) ?? buyerBackRoutePolicy.storeDetail;
  }

  return buyerBackRoutePolicy[pageKey];
}

export function getBuyerStoreHrefFromContext(context?: string) {
  const slug = context?.match(/store slug = ([^,]+)/)?.[1]?.trim();

  if (!slug) {
    return null;
  }

  return `/stores/${encodeURIComponent(slug)}`;
}

export function getSafeBuyerReturnTo(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export function getBuyerInquiryDetailHref(inquiryId: string) {
  return `/inquiries/${encodeURIComponent(inquiryId)}`;
}
