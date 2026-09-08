import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChatLeaveDialogAction, ChatMenuActionButton, MarkInquiryReadOnMount, NotificationActionItem, OrderCancelRequestDialog } from "@/features/api-backed/buyer-actions";
import { ChatComposer } from "@/features/chat-flow/chat-composer";
import { ChatTimelineViewport } from "@/features/chat-flow/chat-timeline-viewport";
import { FlowLoginSheet } from "@/features/flow-blueprint/login-sheet";
import { NoticeAgreementControls } from "@/features/flow-blueprint/notice-agreement-controls";
import { PendingUploadPreviewImage } from "@/features/flow-blueprint/pending-upload-preview-image";
import { SidebarLoginAction } from "@/features/flow-blueprint/sidebar-login-action";
import { getGalleryImageUrl, StoreOrderSection } from "@/features/flow-blueprint/store-order-section";
import { OrderFormSubmissionCard } from "@/features/order-flow/order-form-submission-card";
import { formatOrderSummaryPreview } from "@/shared/lib/order-summary-format";
import { getBuyerBackHref, getSafeBuyerReturnTo } from "@/shared/navigation/buyer-back-routes";
import { FlowCard, FlowCardAction } from "@/shared/ui/flow-card";
import type {
  ChatTimelinePageResponse,
  ChatTimelineItemResponse,
  GalleryItemResponse,
  InquiryChatDetailResponse,
  InquiryListItemResponse,
  NotificationResponse,
  OrderConfirmationResponse,
  OrderDetailResponse,
  OrderListItemResponse,
  PublicStoreResponse,
  StoreOrderSettingAvailabilityResponse,
  UserProfileResponse,
} from "@/shared/api/buyer-api";
import { SafeImage } from "@/shared/ui/safe-image";

export type PageKey =
  | "home"
  | "auth"
  | "role"
  | "authCallback"
  | "authSync"
  | "forbidden"
  | "error"
  | "stores"
  | "storeDetail"
  | "productDetail"
  | "inquiries"
  | "inquiryDetail"
  | "orders"
  | "orderDetail"
  | "payments"
  | "paymentDetail"
  | "notifications"
  | "me"
  | "settings";

type BuyerPage = {
  key: PageKey;
  title: string;
  section: string;
};

export type BuyerApiData = {
  confirmations?: OrderConfirmationResponse[];
  inquiry?: InquiryChatDetailResponse;
  inquiryStatus?: string;
  inquiryTimeline?: ChatTimelinePageResponse;
  inquiries?: InquiryListItemResponse[];
  notifications?: NotificationResponse[];
  orderDetail?: OrderDetailResponse;
  orders?: OrderListItemResponse[];
  profile?: UserProfileResponse;
  selectedGalleryItem?: GalleryItemResponse;
  store?: PublicStoreResponse;
  storeOrderSettings?: StoreOrderSettingAvailabilityResponse;
  stores?: PublicStoreResponse[];
};

type ScreenMode = "store" | "imageOrder" | "notice" | "login" | "chat" | "inquiryList" | "orderList" | "orderDetail" | "notifications" | "account" | "summary" | "system";
type StartReferenceAssetSource = "STORE_GALLERY" | "USER_UPLOAD";
type NoticeStartReferenceAsset = {
  assetId: string;
  source: StartReferenceAssetSource;
};
type NoticePickupSelection = {
  pickupDate: string;
  pickupTime: string;
};

const asset = (name: string) => `/figma-flowmap/${name}`;
export const buyerPages = {
  home: { key: "home", title: "구매자 홈", section: "home" },
  auth: { key: "auth", title: "통합 로그인", section: "auth" },
  role: { key: "role", title: "가입 역할 선택", section: "auth" },
  authCallback: { key: "authCallback", title: "Cognito Callback", section: "auth" },
  authSync: { key: "authSync", title: "회원 동기화", section: "auth" },
  forbidden: { key: "forbidden", title: "접근 권한 없음", section: "system" },
  error: { key: "error", title: "오류", section: "system" },
  stores: { key: "stores", title: "스토어 탐색", section: "stores" },
  storeDetail: { key: "storeDetail", title: "스토어 상세", section: "stores" },
  productDetail: { key: "productDetail", title: "상품 상세", section: "stores" },
  inquiries: { key: "inquiries", title: "상담", section: "inquiries" },
  inquiryDetail: { key: "inquiryDetail", title: "상담 채팅방", section: "inquiries" },
  orders: { key: "orders", title: "주문", section: "orders" },
  orderDetail: { key: "orderDetail", title: "주문 상세", section: "orders" },
  payments: { key: "payments", title: "결제 내역", section: "payments" },
  paymentDetail: { key: "paymentDetail", title: "결제 상세", section: "payments" },
  notifications: { key: "notifications", title: "알림", section: "notifications" },
  me: { key: "me", title: "내 정보", section: "me" },
  settings: { key: "settings", title: "설정", section: "me" },
} satisfies Record<string, BuyerPage>;

export function BuyerBlueprintPage({
  apiData,
  context,
  onInquiryTimelineRefresh,
  page,
}: {
  apiData?: BuyerApiData;
  context?: string;
  onInquiryTimelineRefresh?: () => void;
  page: BuyerPage;
}) {
  const mode = getScreenMode(page.key);
  const useDocumentScroll = mode === "store" && !context?.includes("notice=1");

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[var(--figma-color-surface-subtle)] text-[var(--figma-color-text-primary)]">
      <div className="mx-auto min-h-dvh w-full max-w-[var(--figma-container-lg)] overflow-x-hidden">
        <div className={`relative w-full bg-[var(--figma-color-surface-background)] ${useDocumentScroll ? "min-h-dvh" : "h-dvh overflow-hidden"}`}>
          {renderPhoneScreen(mode, page, context, apiData, onInquiryTimelineRefresh)}
        </div>
      </div>
    </main>
  );
}

function getScreenMode(key: PageKey): ScreenMode {
  if (key === "auth" || key === "role" || key === "authCallback" || key === "authSync") return "login";
  if (key === "productDetail") return "imageOrder";
  if (key === "storeDetail" || key === "stores" || key === "home") return "store";
  if (key === "inquiryDetail") return "chat";
  if (key === "inquiries") return "inquiryList";
  if (key === "orders") return "orderList";
  if (key === "orderDetail") return "orderDetail";
  if (key === "notifications") return "notifications";
  if (key === "me" || key === "settings") return "account";
  if (key === "forbidden" || key === "error") return "system";
  return "summary";
}

function renderPhoneScreen(mode: ScreenMode, page: BuyerPage, context?: string, apiData?: BuyerApiData, onInquiryTimelineRefresh?: () => void) {
  if (mode === "login") return <FlowLoginSheet returnTo={getContextValue(context, "next") ?? "/"} />;
  if (mode === "imageOrder") {
    return (
      <StoreScreen
        backHref={getBuyerBackHref("productDetail", context)}
        modal="imageOrder"
        startAssetId={getContextValue(context, "startAssetId")}
        startSource={getContextStartSource(context)}
        selectedGalleryItem={apiData?.selectedGalleryItem}
        store={apiData?.store}
      />
    );
  }
  if (mode === "store") {
    if (context?.includes("notice=1")) {
      return (
        <NoticeScreen
          agreed={context.includes("agree=1")}
          orderSettings={apiData?.storeOrderSettings}
          pickupDate={getContextValue(context, "pickupDate")}
          pickupTime={getContextValue(context, "pickupTime")}
          readonly={context.includes("readonly=1")}
          returnTo={getContextValue(context, "returnTo")}
          startAssetId={getContextValue(context, "startAssetId")}
          startSource={getContextStartSource(context)}
          startUploadKey={getContextValue(context, "startUploadKey")}
          storeSlug={apiData?.store?.slug}
        />
      );
    }
    if (!apiData?.store) return <StoreListScreen stores={apiData?.stores} />;
    return (
      <StoreScreen
        backHref={getBuyerBackHref("storeDetail", context)}
        galleryExpanded={context?.includes("gallery=expanded")}
        initialTab={context?.includes("tab=other") || context?.includes("upload=done") || context?.includes("permission=1") ? "other" : "best"}
        bannerIndex={Number(context?.match(/banner=([0-9]+)/)?.[1] ?? 0)}
        imageConfirm={context?.includes("imageConfirm=1")}
        permissionOpen={context?.includes("permission=1")}
        sidebar={context?.includes("panel=sidebar")}
        startAssetId={getContextValue(context, "startAssetId")}
        startSource={getContextStartSource(context)}
        startUploadKey={getContextValue(context, "startUploadKey")}
        store={apiData?.store}
        uploadDone={context?.includes("upload=done")}
      />
    );
  }
  if (mode === "notice") return <NoticeScreen />;
  if (mode === "chat") {
    return <ChatScreen confirmations={apiData?.confirmations} context={context} detail={apiData?.inquiry} inquiryStatus={apiData?.inquiryStatus} onTimelineRefresh={onInquiryTimelineRefresh} store={apiData?.store} timeline={apiData?.inquiryTimeline} />;
  }
  if (mode === "inquiryList") return <InquiryListScreen empty={context?.includes("state=empty")} items={apiData?.inquiries} />;
  if (mode === "orderList") return <OrderListScreen empty={context?.includes("state=empty")} items={apiData?.orders} />;
  if (mode === "orderDetail") return <OrderDetailScreen detail={apiData?.orderDetail} state={getContextState(context)} />;
  if (mode === "notifications") return <NotificationsScreen empty={context?.includes("state=empty")} items={apiData?.notifications} />;
  if (mode === "account") return <AccountScreen pageKey={page.key} profile={apiData?.profile} />;
  if (mode === "summary") return <SummaryScreen context={context} page={page} />;
  if (mode === "system") return <SystemScreen context={context} page={page} />;
  return <StoreScreen />;
}

function getContextState(context?: string) {
  return context?.match(/state=([^,\s]+)/)?.[1] ?? "";
}

function getContextValue(context: string | undefined, key: string) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = context?.match(new RegExp(`${escapedKey}\\s*=\\s*([^,\\s]+)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function getContextStartSource(context: string | undefined) {
  const value = getContextValue(context, "startSource")?.replaceAll("\\", "").trim();
  return value === "USER_UPLOAD" ? "USER_UPLOAD" : "STORE_GALLERY";
}

function IconAsset({ name, size = 48 }: { name: string; size?: number }) {
  return <Image alt="" height={size} src={asset(name)} width={size} />;
}

function Header({
  chatMenuToggleId,
  backHref,
  menuToggleId,
  storePath = "/stores",
  title,
  variant = "home",
}: {
  backHref?: string;
  chatMenuToggleId?: string;
  menuToggleId?: string;
  storePath?: string;
  title?: string;
  variant?: "home" | "back" | "chat";
}) {
  if (variant === "home") {
    return (
      <header className="flex h-14 w-full items-center justify-between overflow-hidden bg-white pl-[var(--figma-space-md)]">
        {backHref ? (
          <Link aria-label="뒤로" className="mr-[var(--figma-space-sm)] grid h-12 w-12 shrink-0 place-items-center" href={backHref}>
            <IconAsset name="chevron-left.svg" />
          </Link>
        ) : (
          <Link aria-label="홈" className="mr-[var(--figma-space-sm)] grid h-8 w-8 shrink-0 place-items-center" href="/">
            <Image alt="" height={32} src={asset("wihada-symbol-logo.svg")} width={32} />
          </Link>
        )}
        <div className="flex h-12 w-24 shrink-0 items-center">
          <Link aria-label="알림" className="grid h-12 w-12 place-items-center" href="/notifications">
            <IconAsset name="bell.svg" />
          </Link>
          {menuToggleId ? (
            <label aria-label="메뉴" className="grid h-12 w-12 cursor-pointer place-items-center" htmlFor={menuToggleId} role="button">
              <IconAsset name="hamburger.svg" />
            </label>
          ) : (
            <Link aria-label="메뉴" className="grid h-12 w-12 place-items-center" href={`${storePath}?panel=sidebar`}>
              <IconAsset name="hamburger.svg" />
            </Link>
          )}
        </div>
      </header>
    );
  }

  if (variant === "chat") {
    return (
      <header className="flex h-14 items-center justify-between bg-white px-[var(--figma-space-md)]">
        <Link aria-label="뒤로" className="grid h-6 w-6 place-items-center" href={backHref ?? getBuyerBackHref("inquiryDetail")}>
          <IconAsset name="chat-back.svg" size={24} />
        </Link>
        <h1 className="text-display-sm">{title ?? "상담"}</h1>
        <label aria-label="상담 메뉴" className="grid h-6 w-6 cursor-pointer place-items-center" htmlFor={chatMenuToggleId} role="button">
          <IconAsset name="chat-menu.svg" size={24} />
        </label>
      </header>
    );
  }

  return (
    <header className="flex h-14 items-center justify-between">
      <Link aria-label="뒤로" className="grid h-12 w-12 place-items-center" href={backHref ?? storePath}>
        <IconAsset name="chevron-left.svg" />
      </Link>
      <h1 className="text-display-sm">{title}</h1>
      {menuToggleId ? (
        <label aria-label="메뉴" className="grid h-12 w-12 cursor-pointer place-items-center" htmlFor={menuToggleId} role="button">
          <IconAsset name="hamburger.svg" />
        </label>
      ) : (
        <Link aria-label="메뉴" className="grid h-12 w-12 place-items-center" href="/me">
          <IconAsset name="hamburger.svg" />
        </Link>
      )}
    </header>
  );
}

function StoreListScreen({ stores }: { stores?: PublicStoreResponse[] }) {
  const sidebarToggleId = "store-list-sidebar-toggle";

  if (!stores) {
    return (
      <div className="relative flex h-full flex-col bg-white">
        <input className="peer sr-only" id={sidebarToggleId} type="checkbox" />
        <Header menuToggleId={sidebarToggleId} />
        <LoadingState title="스토어를 불러오는 중입니다" />
        <StoreSidebar toggleId={sidebarToggleId} />
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col bg-white">
      <input className="peer sr-only" id={sidebarToggleId} type="checkbox" />
      <Header menuToggleId={sidebarToggleId} />
      <div className="flex-1 overflow-y-auto px-[var(--figma-space-md)] py-[var(--figma-space-md)]">
        {stores.length ? (
          <div className="grid gap-[var(--figma-space-sm)]">
            {stores.map((store) => (
              <Link className="flex min-h-20 gap-[var(--figma-space-md)] rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] p-[var(--figma-space-md)]" href={`/stores/${encodeURIComponent(store.slug)}`} key={store.id}>
                <StoreImage src={store.profileDeliveryUrl ?? store.representativeImages[0]?.deliveryUrl} size={48} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-heading-md">{store.name}</span>
                  <span className="mt-1 line-clamp-2 text-body-sm text-[var(--figma-color-text-secondary)]">{store.description}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState body="공개된 스토어가 아직 없습니다." title="스토어가 없습니다" />
        )}
      </div>
      <StoreSidebar toggleId={sidebarToggleId} />
    </div>
  );
}

function StoreImage({ size, src }: { size: number; src?: string | null }) {
  return (
    <span
      className="relative shrink-0 overflow-hidden rounded-[var(--figma-radius-sm)] border border-[var(--figma-color-border-default)] bg-[var(--figma-color-surface-subtle)]"
      data-ui="store-profile"
      style={{ height: size, width: size }}
    >
      <SafeImage alt="" className="object-cover" fill sizes={`${size}px`} src={src} />
    </span>
  );
}

function StoreScreen({
  backHref,
  galleryExpanded = false,
  initialTab = "best",
  bannerIndex = 0,
  imageConfirm = false,
  modal,
  permissionOpen = false,
  sidebar = false,
  startAssetId,
  startSource = "STORE_GALLERY",
  startUploadKey,
  store,
  selectedGalleryItem,
  uploadDone = false,
}: {
  backHref?: string;
  galleryExpanded?: boolean;
  imageConfirm?: boolean;
  initialTab?: "best" | "other";
  bannerIndex?: number;
  modal?: "imageOrder";
  permissionOpen?: boolean;
  sidebar?: boolean;
  startAssetId?: string;
  startSource?: "STORE_GALLERY" | "USER_UPLOAD";
  startUploadKey?: string;
  store?: PublicStoreResponse;
  selectedGalleryItem?: GalleryItemResponse;
  uploadDone?: boolean;
}) {
  if (!store) return <StoreUnavailableScreen />;

  const storeSlug = store.slug;
  const storePath = `/stores/${encodeURIComponent(storeSlug)}`;
  const representativeImages = store?.representativeImages?.length ? store.representativeImages : [];
  const sidebarToggleId = "store-sidebar-toggle";

  return (
    <div className="relative min-h-dvh w-full bg-white">
      <input className="peer sr-only" defaultChecked={sidebar} id={sidebarToggleId} type="checkbox" />
      <Header backHref={backHref ?? getBuyerBackHref("storeDetail")} menuToggleId={sidebarToggleId} storePath={storePath} />
      <section className="min-w-0 overflow-x-hidden bg-white py-[var(--figma-space-md)]" data-ui="store-info">
        <div className="flex h-[58px] min-w-0 flex-col gap-[var(--figma-space-xs)] px-[var(--figma-space-md)]">
          <h1 className="min-w-0 break-words text-display-lg">{store.name}</h1>
          <p className="min-w-0 break-words text-body-sm text-[var(--figma-color-text-secondary)]">{formatStoreHandle(store)}</p>
        </div>
        <div className="min-w-0 px-[var(--figma-space-md)] py-[var(--figma-space-md)]">
          <div className="grid h-[140px] min-w-0 grid-cols-3 gap-px overflow-hidden rounded-[var(--figma-radius-sm)] bg-white">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="relative min-w-0" key={representativeImages[index]?.id ?? index}>
                <SafeImage alt={`${store.name} 대표 이미지 ${index + 1}`} className="object-cover" fill sizes="120px" src={representativeImages[index]?.deliveryUrl} />
              </div>
            ))}
          </div>
        </div>
        <div className="min-w-0 px-[var(--figma-space-md)] pb-[var(--figma-space-md)]">
          <p className="text-body-md font-normal text-[var(--figma-color-text-secondary)]" data-ui="store-description">
            {store.description}
          </p>
        </div>
        <div className="min-w-0 px-[var(--figma-space-md)] py-[var(--figma-space-md)]">
          <div className="grid min-w-0 gap-[var(--figma-space-sm)] rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] px-[var(--figma-space-md)] py-[var(--figma-space-md)]">
            <InfoRow label="픽업 장소" value={store.address ?? "-"} />
            <InfoRow label="영업시간" value={formatBusinessHours(store.businessHours)} />
            <InfoRow label="취소와 환불" value="픽업 7일 전까지 전액 환불" />
          </div>
        </div>
      </section>
      <div className="h-12 bg-white" />
      <div className="h-2 bg-[var(--figma-color-surface-subtle)]" />
      <div className="h-12 bg-white" />
      <StoreOrderSection defaultTab={initialTab} galleryExpanded={galleryExpanded} initialPermissionOpen={permissionOpen} initialUploaded={uploadDone} storeSlug={storeSlug} />
      {modal === "imageOrder" || imageConfirm ? <ImageOrderModal selectedGalleryItem={selectedGalleryItem} startAssetId={startAssetId} startSource={startSource} startUploadKey={startUploadKey} storeSlug={storeSlug} /> : null}
      {bannerIndex > 0 ? <BannerOverlay activeIndex={bannerIndex - 1} storePath={storePath} /> : null}
      <StoreSidebar toggleId={sidebarToggleId} />
    </div>
  );
}

function StoreUnavailableScreen() {
  return (
    <div className="flex h-full flex-col bg-white">
      <Header />
      <EmptyState body="스토어 API 응답이 없어 화면을 표시할 수 없습니다." title="스토어 정보를 불러오지 못했어요" />
    </div>
  );
}

function formatStoreHandle(store?: PublicStoreResponse) {
  if (!store) return "";
  const snsLink = getFirstStringValue(store.snsLinks);
  if (snsLink) return formatSocialLink(snsLink);
  if (store.contactVisible && store.contact?.trim()) return store.contact;
  return `@${store.slug}`;
}

const dayOrder = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const dayLabels: Record<(typeof dayOrder)[number], string> = {
  fri: "금",
  mon: "월",
  sat: "토",
  sun: "일",
  thu: "목",
  tue: "화",
  wed: "수",
};

function formatBusinessHours(value?: string | null) {
  const parsed = parseJson(value);

  if (isStringRecord(parsed)) {
    const entries = dayOrder
      .map((day) => ({
        day,
        label: dayLabels[day],
        time: normalizeDisplayText(parsed[day]),
      }))
      .filter((entry) => entry.time);

    if (entries.length) return groupBusinessHours(entries);
  }

  if (Array.isArray(parsed)) {
    const values = parsed.map((item) => normalizeDisplayText(item)).filter(Boolean);
    if (values.length) return values.join(", ");
  }

  const text = normalizeDisplayText(value);
  return text || "-";
}

function groupBusinessHours(entries: { day: (typeof dayOrder)[number]; label: string; time: string }[]) {
  const groups: { from: string; time: string; to: string }[] = [];

  for (const entry of entries) {
    const latestGroup = groups.at(-1);
    if (latestGroup?.time === entry.time) {
      latestGroup.to = entry.label;
    } else {
      groups.push({ from: entry.label, time: entry.time, to: entry.label });
    }
  }

  return groups.map((group) => `${group.from === group.to ? group.from : `${group.from}-${group.to}`} ${group.time}`).join(", ");
}

function formatSocialLink(value: string) {
  try {
    const url = new URL(value);
    const pathName = url.pathname.replace(/^\/+|\/+$/g, "");

    if (url.hostname.includes("instagram.com") && pathName) {
      return `@${pathName.split("/")[0]}`;
    }

    return `${url.hostname}${pathName ? `/${pathName}` : ""}`;
  } catch {
    return value;
  }
}

function getFirstStringValue(value?: string | null) {
  const parsed = parseJson(value);

  if (typeof parsed === "string") return parsed.trim();
  if (Array.isArray(parsed)) {
    return parsed.find((item): item is string => typeof item === "string" && item.trim().length > 0)?.trim() ?? "";
  }

  return normalizeDisplayText(value);
}

function parseJson(value?: string | null): unknown {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return trimmed;
  }
}

function normalizeDisplayText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function BannerOverlay({ storePath = "/stores" }: { activeIndex: number; storePath?: string }) {
  return (
    <Link aria-label="배너 닫기" className="absolute inset-0 z-40 grid place-items-center bg-[var(--figma-color-surface-scrim)] px-[var(--figma-space-md)]" href={storePath} data-screen="banner-overlay">
      <section className="w-full rounded-[var(--figma-radius-lg)] bg-white p-[var(--figma-space-lg)] text-center shadow-[var(--figma-shadow-dropdown)]">
        <h2 className="text-heading-lg">표시할 배너가 없습니다</h2>
        <p className="mt-[var(--figma-space-xs)] text-body-sm text-[var(--figma-color-text-secondary)]">배너 API 데이터가 연결되면 이 영역에 표시됩니다.</p>
      </section>
    </Link>
  );
}

function StoreSidebar({ toggleId }: { toggleId: string }) {
  return (
    <div className="figma-sidebar-overlay fixed inset-0 z-50 flex justify-end overflow-x-hidden" data-screen="store-sidebar-overlay">
      <label aria-label="메뉴 닫기" className="absolute inset-0 cursor-pointer" htmlFor={toggleId} />
      <aside className="figma-sidebar-sheet relative flex h-full w-[300px] flex-col gap-[var(--figma-space-lg)] bg-white py-[41px]" data-screen="store-sidebar">
        <div className="flex h-10 items-center justify-between pl-[var(--figma-space-lg)] pr-[var(--figma-space-md)]">
          <Image alt="wihada" height={19} src={asset("wihada-wordmark.svg")} width={87} />
          <label aria-label="닫기" className="grid h-10 w-10 cursor-pointer place-items-center" htmlFor={toggleId} role="button">
            <IconAsset name="cancel.svg" />
          </label>
        </div>
        <div className="h-px bg-[var(--figma-color-surface-subtle)]" />
        <div className="flex min-h-0 flex-1 flex-col gap-[var(--figma-space-section-mobile)] py-[var(--figma-space-lg)]">
          <nav className="grid gap-[var(--figma-space-md)] px-[var(--figma-space-lg)]">
            <p className="text-label-xs text-[var(--figma-color-text-tertiary)]">계정</p>
            <Link className="text-heading-md" href="/inquiries">
              문의 목록
            </Link>
            <div className="h-px bg-[var(--figma-color-surface-subtle)]" />
            <Link className="text-heading-md" href="/orders">
              주문 내역
            </Link>
          </nav>
          <nav className="grid gap-[var(--figma-space-md)] px-[var(--figma-space-lg)]">
            <p className="text-label-xs text-[var(--figma-color-text-tertiary)]">계정</p>
            <Link className="text-heading-md" href="/me">
              마이페이지
            </Link>
          </nav>
          <SidebarLoginAction />
        </div>
      </aside>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-[var(--figma-space-md)] text-body-sm">
      <span className="w-[72px] shrink-0 font-medium leading-4 text-[var(--figma-color-text-tertiary)]">{label}</span>
      <span className="min-w-0 flex-1 break-words text-[var(--figma-color-text-primary)]">{value}</span>
    </div>
  );
}

function ImageOrderModal({
  selectedGalleryItem,
  startAssetId,
  startSource = "STORE_GALLERY",
  startUploadKey,
  storeSlug,
}: {
  selectedGalleryItem?: GalleryItemResponse;
  startAssetId?: string;
  startSource?: "STORE_GALLERY" | "USER_UPLOAD";
  startUploadKey?: string;
  storeSlug: string;
}) {
  const storePath = `/stores/${encodeURIComponent(storeSlug)}`;
  const selectedAssetId = startAssetId ?? selectedGalleryItem?.assetId;
  const selectedSource = startAssetId ? startSource : "STORE_GALLERY";
  const selectedImageUrl = getGalleryImageUrl(selectedGalleryItem, "MEDIUM");
  const orderParams = new URLSearchParams({ step: "pickup-date" });
  if (startUploadKey) {
    orderParams.set("startUploadKey", startUploadKey);
    orderParams.set("startSource", "USER_UPLOAD");
  } else if (selectedAssetId) {
    orderParams.set("startAssetId", selectedAssetId);
    orderParams.set("startSource", selectedSource);
  }
  const orderHref = `${storePath}/order-form-drafts/new?${orderParams.toString()}`;

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end overflow-x-hidden bg-[var(--figma-color-surface-scrim)]">
      <div className="flex w-full min-w-0 flex-col items-center gap-[var(--figma-space-lg)] rounded-t-[var(--figma-radius-lg)] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-xl)]">
        <div className="flex w-full min-w-0 flex-col items-end gap-[var(--figma-space-xs)]">
          <div className="flex w-full min-w-0 items-center justify-between">
            <div className="flex min-w-0 items-center gap-[var(--figma-space-sm)]">
              <h2 className="text-heading-lg">
                선택한 케이크 이미지로
                <br />
                주문하시겠어요?
              </h2>
            </div>
            <div className="flex self-stretch">
              <div className="flex h-full w-10 items-start justify-end">
                <Link aria-label="닫기" className="relative block h-12 w-12 shrink-0" href={storePath}>
                  <IconAsset name="cancel.svg" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="relative grid aspect-square w-full min-w-0 max-w-full place-items-center overflow-hidden rounded-[21px] bg-[var(--figma-color-surface-subtle)] text-body-sm text-[var(--figma-color-text-tertiary)]">
          {selectedImageUrl ? (
            <SafeImage alt="선택한 케이크 이미지" className="object-cover" fill sizes="358px" src={selectedImageUrl} />
          ) : startUploadKey ? (
            <PendingUploadPreviewImage uploadKey={startUploadKey} />
          ) : (
            "선택한 이미지"
          )}
        </div>
        <div className="flex w-full min-w-0 gap-[var(--figma-space-sm)]">
          <Link className="flex h-11 min-w-0 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-strong)] px-[var(--figma-space-lg)] text-label-md text-[var(--figma-color-text-tertiary)]" href={storePath}>
            둘러보기
          </Link>
          <Link className="flex h-11 min-w-0 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] px-[var(--figma-space-lg)] text-label-md text-white" href={orderHref}>
            주문하기
          </Link>
        </div>
      </div>
    </div>
  );
}

function NoticeScreen({
  agreed = false,
  orderSettings,
  pickupDate,
  pickupTime,
  readonly = false,
  returnTo,
  startAssetId,
  startSource = "STORE_GALLERY",
  startUploadKey,
  storeSlug,
}: {
  agreed?: boolean;
  orderSettings?: StoreOrderSettingAvailabilityResponse;
  pickupDate?: string;
  pickupTime?: string;
  readonly?: boolean;
  returnTo?: string;
  startAssetId?: string;
  startSource?: StartReferenceAssetSource;
  startUploadKey?: string;
  storeSlug?: string;
}) {
  const storePath = storeSlug ? `/stores/${encodeURIComponent(storeSlug)}` : "/stores";
  const backHref = getSafeBuyerReturnTo(returnTo) ?? storePath;
  const startReferenceAssets = startAssetId ? [{ assetId: startAssetId, source: startSource }] : [];
  const pickupSelection = { pickupDate: pickupDate ?? "", pickupTime: pickupTime ?? "" };
  const noticeHref = buildStoreNoticeHref(storePath, { agreed: true, pickupSelection, readonly, startReferenceAssets, startUploadKey });
  const nextHref = buildOrderFormStartHref(storePath, pickupSelection, startReferenceAssets, startUploadKey);
  const noticeItems = getNoticeItems(orderSettings);
  const sidebarToggleId = "notice-sidebar-toggle";

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <input className="peer sr-only" id={sidebarToggleId} type="checkbox" />
      <Header backHref={backHref} menuToggleId={sidebarToggleId} storePath={storePath} title="공지사항" variant="back" />
      <div className="flex-1 overflow-y-auto p-[var(--figma-space-md)]">
        <section className="flex flex-col gap-[var(--figma-space-sm)]">
          {noticeItems.length ? (
            noticeItems.map((item) => (
              <section className="rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] p-[var(--figma-space-md)]" key={item.title}>
                <h2 className="text-heading-md">{item.title}</h2>
                <p className="mt-[var(--figma-space-sm)] whitespace-pre-line text-body-md text-[var(--figma-color-text-secondary)]">{item.body}</p>
              </section>
            ))
          ) : (
            <EmptyState body="스토어 공지가 아직 등록되지 않았습니다." title="공지사항이 없습니다" />
          )}
        </section>
      </div>
      {readonly ? null : <NoticeAgreementControls agreeHref={noticeHref} initialAgreed={agreed} nextHref={nextHref} storePath={storePath} unagreeHref={buildStoreNoticeHref(storePath, { pickupSelection, startReferenceAssets, startUploadKey })} />}
      <StoreSidebar toggleId={sidebarToggleId} />
    </div>
  );
}

function getNoticeItems(orderSettings?: StoreOrderSettingAvailabilityResponse) {
  const items: Array<{ body: string; title: string }> = [];
  const preOrderNotice = orderSettings?.preOrderNotice?.trim();

  if (preOrderNotice) {
    items.push({ body: preOrderNotice, title: "주문 전 안내" });
  }

  if (typeof orderSettings?.cancellationCutoffDays === "number") {
    items.push({
      body: `픽업 ${orderSettings.cancellationCutoffDays}일 전까지 취소 요청 기준이 적용됩니다.`,
      title: "취소/환불 안내",
    });
  }

  return items;
}

function buildOrderFormStartHref(storePath: string, pickupSelection: NoticePickupSelection, startReferenceAssets: NoticeStartReferenceAsset[], startUploadKey?: string) {
  const params = new URLSearchParams({ state: "start", step: "form" });
  appendPickupSelectionParams(params, pickupSelection);
  appendStartReferenceParams(params, startReferenceAssets);
  appendStartUploadParam(params, startUploadKey);
  return `${storePath}/order-form-drafts/new?${params.toString()}`;
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
    pickupSelection?: NoticePickupSelection;
    readonly?: boolean;
    startReferenceAssets: NoticeStartReferenceAsset[];
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

function appendPickupSelectionParams(params: URLSearchParams, pickupSelection: NoticePickupSelection) {
  if (pickupSelection.pickupDate) params.set("pickupDate", pickupSelection.pickupDate);
  if (pickupSelection.pickupTime) params.set("pickupTime", pickupSelection.pickupTime);
}

function appendStartReferenceParams(params: URLSearchParams, startReferenceAssets: NoticeStartReferenceAsset[]) {
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

function ChatScreen({
  confirmations,
  context,
  detail,
  inquiryStatus,
  onTimelineRefresh,
  store,
  timeline,
}: {
  confirmations?: OrderConfirmationResponse[];
  context?: string;
  detail?: InquiryChatDetailResponse;
  inquiryStatus?: string;
  onTimelineRefresh?: () => void;
  store?: PublicStoreResponse;
  timeline?: ChatTimelinePageResponse;
}) {
  const state = getContextState(context);
  const inquiryId = detail?.inquiryId;
  const timelineItems = timeline?.items ?? [];
  const confirmationsById = new Map(confirmations?.map((confirmation) => [confirmation.confirmationId, confirmation]) ?? []);
  const latestConfirmation = confirmations?.at(0);
  const storeProfileSrc = detail?.participant.profileImageDeliveryUrl ?? store?.profileDeliveryUrl ?? store?.representativeImages[0]?.deliveryUrl;

  if (!detail) {
    return (
      <div className="flex h-full flex-col bg-white">
        <AppTitleHeader backHref={getBuyerBackHref("inquiryDetail")} title="상담 채팅방" />
        <LoadingState title="문의 정보를 불러오는 중입니다" />
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col bg-[var(--figma-color-surface-subtle)]">
      <MarkInquiryReadOnMount inquiryId={inquiryId} />
      <input className="peer sr-only" defaultChecked={state === "menu"} id="chat-menu-toggle" readOnly type="checkbox" />
      <div className="shrink-0">
        <Header backHref={getBuyerBackHref("inquiryDetail")} chatMenuToggleId="chat-menu-toggle" title={detail?.storeName} variant="chat" />
        <ChatMetaBar status={inquiryStatus} store={store} />
      </div>
      <ChatTimelineViewport scrollKey={`${timelineItems.at(-1)?.eventId ?? "empty"}:${timelineItems.length}`}>
        <section className="flex flex-col gap-[var(--figma-space-sm)] pb-[var(--figma-space-lg)] pt-[var(--figma-space-md)]">
          {timelineItems.length ? (
            timelineItems.map((item) => (
              <TimelineBubble
                confirmation={confirmationsById.get(item.referenceId)}
                inquiryId={detail.inquiryId}
                item={item}
                key={item.eventId}
                latestConfirmation={latestConfirmation}
                participantUserId={detail.participant.userId}
                storeName={detail.storeName}
                storeProfileSrc={storeProfileSrc}
              />
            ))
          ) : (
            <EmptyState body="아직 표시할 메시지가 없습니다." title="대화가 없습니다" />
          )}
        </section>
      </ChatTimelineViewport>
      <div className="shrink-0 bg-white px-[var(--figma-space-md)] pb-[34px] pt-[var(--figma-space-md)] shadow-[var(--figma-shadow-modal)]">
        <ChatComposer inquiryId={inquiryId} onTimelineChanged={onTimelineRefresh} placeholder="메시지를 입력하세요" />
      </div>
      <ChatMenuOverlay inquiryId={inquiryId} storeId={detail?.storeId} storeSlug={detail?.storeSlug} toggleId="chat-menu-toggle" />
      {state === "leave" ? <ChatLeaveDialogAction cancelHref={inquiryId ? `/inquiries/${encodeURIComponent(inquiryId)}?state=menu` : "/inquiries"} inquiryId={inquiryId} /> : null}
    </div>
  );
}

function TimelineBubble({
  confirmation,
  inquiryId,
  item,
  latestConfirmation,
  participantUserId,
  storeName,
  storeProfileSrc,
}: {
  confirmation?: OrderConfirmationResponse;
  inquiryId: string;
  item: ChatTimelineItemResponse;
  latestConfirmation?: OrderConfirmationResponse;
  participantUserId: string;
  storeName: string;
  storeProfileSrc?: string | null;
}) {
  const mine = Boolean(item.senderUserId) && item.senderUserId !== participantUserId;
  const label = item.content ?? formatTimelineItemType(item.type);

  if (isOrderFormSubmissionEvent(item.type)) {
    return (
      <div className="flex min-w-0 flex-col gap-[var(--figma-space-sm)] overflow-hidden">
        <div className="flex min-w-0 items-end justify-end gap-[var(--figma-space-xs)] pl-[48px] pr-[var(--figma-space-sm)]">
          <OrderFormSubmissionCard inquiryId={inquiryId} submissionId={item.referenceId} />
        </div>
        <OrderReceivedNotice createdAt={item.createdAt} />
      </div>
    );
  }

  if (isOrderConfirmationEvent(item.type) && confirmation) {
    if (!mine) {
      return (
        <div className="flex min-w-0 items-end gap-[var(--figma-space-xs)] overflow-hidden pl-[var(--figma-space-sm)] pr-[48px]">
          <StoreAvatar label={storeName} src={storeProfileSrc} />
          <div className="min-w-0">
            <PaymentRequestCard confirmation={confirmation} inquiryId={inquiryId} />
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-w-0 items-end justify-end gap-[var(--figma-space-xs)] overflow-hidden pl-[48px] pr-[var(--figma-space-sm)]">
        <PaymentRequestCard confirmation={confirmation} inquiryId={inquiryId} />
      </div>
    );
  }

  if (isPaymentCompletedEvent(item.type)) {
    return (
      <div className="flex min-w-0 items-end justify-end gap-[var(--figma-space-xs)] overflow-hidden pl-[48px] pr-[var(--figma-space-sm)]">
        <PaymentCompletedCard amount={latestConfirmation?.amount} orderId={item.referenceId} storeName={storeName} />
      </div>
    );
  }

  const eventHref = getTimelineEventHref(item, inquiryId);

  if (!mine) {
    return (
      <div className="flex min-w-0 items-end gap-[var(--figma-space-xs)] overflow-hidden pl-[var(--figma-space-sm)] pr-[48px]">
        <StoreAvatar label={storeName} src={storeProfileSrc} />
        {eventHref && !item.content ? (
          <Link className="min-w-0 max-w-[236px] break-words rounded-[var(--figma-radius-lg)] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-sm)] text-body-md text-[var(--figma-color-text-primary)] shadow-[var(--figma-shadow-card)]" href={eventHref}>
            {label}
          </Link>
        ) : (
          <p className="min-w-0 max-w-[236px] whitespace-pre-wrap break-words rounded-[var(--figma-radius-lg)] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-sm)] text-body-md text-[var(--figma-color-text-primary)] shadow-[var(--figma-shadow-card)]">
            {label}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-end justify-end gap-[var(--figma-space-xs)] overflow-hidden pl-[48px] pr-[var(--figma-space-sm)]">
      {eventHref && !item.content ? (
        <Link className="min-w-0 max-w-[280px] break-words rounded-[var(--figma-radius-lg)] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-sm)] text-body-md text-[var(--figma-color-text-primary)] shadow-[var(--figma-shadow-card)]" href={eventHref}>
          {label}
        </Link>
      ) : (
        <p className="min-w-0 max-w-[280px] whitespace-pre-wrap break-words rounded-[var(--figma-radius-lg)] bg-[var(--figma-color-action-primary)] px-[var(--figma-space-md)] py-[var(--figma-space-sm)] text-body-md text-white">
          {label}
        </p>
      )}
    </div>
  );
}

function StoreAvatar({ label, size = 40, src }: { label: string; size?: number; src?: string | null }) {
  const initial = label.trim().slice(0, 1) || "스";

  return (
    <span
      aria-label={`${label} 프로필`}
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-[var(--figma-radius-sm)] border border-[var(--figma-color-border-default)] bg-[var(--figma-color-surface-default)] text-label-sm text-[var(--figma-color-text-tertiary)]"
      style={{ height: size, width: size }}
    >
      <SafeImage alt="" className="object-cover" fallback={<span aria-hidden>{initial}</span>} fill sizes={`${size}px`} src={src} />
    </span>
  );
}

function OrderReceivedNotice({ createdAt }: { createdAt: string }) {
  return (
    <div className="flex w-full items-center justify-center overflow-hidden px-[var(--figma-space-sm)]" data-ui="order-received-notice">
      <div className="rounded-[var(--figma-radius-lg)] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-sm)]">
        <p className="whitespace-nowrap text-body-sm text-[var(--figma-color-text-secondary)]">{formatOrderReceivedNotice(createdAt)}</p>
      </div>
    </div>
  );
}

function ChatMetaBar({ status, store }: { status?: string; store?: PublicStoreResponse }) {
  const metadata = formatChatMetadata(store);

  if (!metadata && !status) return null;

  return (
    <div className="flex h-10 shrink-0 items-center justify-between gap-[var(--figma-space-md)] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-sm)]">
      <p className="min-w-0 truncate text-label-sm text-[var(--figma-color-text-secondary)]">{metadata}</p>
      {status ? <span className="shrink-0 rounded-full bg-[var(--figma-color-action-subtle)] px-3 py-1 text-label-sm text-[var(--figma-color-action-primary)]">{formatInquiryStatus(status)}</span> : null}
    </div>
  );
}

function formatChatMetadata(store?: PublicStoreResponse) {
  const businessHours = formatBusinessHours(store?.businessHours);
  if (!businessHours || businessHours === "-") return "픽업만 가능";
  return `픽업만 가능 · ${businessHours}`;
}

function getTimelineEventHref(item: ChatTimelineItemResponse, inquiryId: string) {
  const type = item.type.toUpperCase();

  if (type === "ORDER_FORM_SUBMISSION" || type === "ORDER_FORM_SUBMITTED") {
    return `/inquiries/${encodeURIComponent(inquiryId)}/order-form-submissions/${encodeURIComponent(item.referenceId)}`;
  }

  if (type === "ORDER_CONFIRMATION" || type === "ORDER_CONFIRMATION_SENT" || type === "ORDER_CONFIRMATION_REVISION") {
    return `/inquiries/${encodeURIComponent(inquiryId)}/confirmations/${encodeURIComponent(item.referenceId)}`;
  }

  if (type === "PAYMENT_COMPLETED") {
    return `/orders/${encodeURIComponent(item.referenceId)}`;
  }

  return "";
}

function isOrderFormSubmissionEvent(type: string) {
  const normalized = type.toUpperCase();
  return normalized === "ORDER_FORM_SUBMISSION" || normalized === "ORDER_FORM_SUBMITTED";
}

function isOrderConfirmationEvent(type: string) {
  const normalized = type.toUpperCase();
  return normalized === "ORDER_CONFIRMATION" || normalized === "ORDER_CONFIRMATION_SENT" || normalized === "ORDER_CONFIRMATION_REVISION";
}

function isPaymentCompletedEvent(type: string) {
  return type.toUpperCase() === "PAYMENT_COMPLETED";
}

function PaymentCompletedCard({ amount, orderId, storeName }: { amount?: number; orderId: string; storeName: string }) {
  return (
    <FlowCard className="w-[240px] shrink-0 rounded-[24px] px-[var(--figma-space-md)] py-[var(--figma-space-md)]" data-ui="payment-completed-card">
      <div className="grid w-full gap-[var(--figma-space-sm)]">
        <p className="text-label-sm text-[var(--figma-color-text-secondary)]">결제 완료</p>
        <p className="text-display-sm">{amount !== undefined ? `${formatWon(amount)}을 보냈어요.` : "결제를 완료했어요."}</p>
        <p className="text-label-sm text-[var(--figma-color-text-tertiary)]">{storeName} 사장님께 결제금액을 보냈어요</p>
      </div>
      <FlowCardAction className="mt-[var(--figma-space-md)] h-9 w-full rounded-[var(--figma-radius-lg)]" href={`/orders/${encodeURIComponent(orderId)}`} variant="secondary">
        주문내역 보기
      </FlowCardAction>
    </FlowCard>
  );
}

function PaymentRequestCard({ confirmation, inquiryId }: { confirmation: OrderConfirmationResponse; inquiryId: string }) {
  const summaryPreview = formatOrderSummaryPreview(confirmation.summaryText);

  return (
    <FlowCard className="w-[240px] shrink-0 rounded-[24px] px-[var(--figma-space-md)] py-[var(--figma-space-md)]" data-ui="payment-request-card">
      <p className="text-label-sm text-[var(--figma-color-text-secondary)]">{confirmation.confirmationTitle}</p>
      <div className="mt-2 flex items-end justify-between">
        <h2 className="text-display-sm">최종 가격</h2>
        <p className="text-display-sm">{formatWon(confirmation.amount)}</p>
      </div>
      {summaryPreview ? <p className="mt-[var(--figma-space-md)] whitespace-pre-line text-body-sm text-[var(--figma-color-text-secondary)]">{summaryPreview}</p> : null}
      <FlowCardAction className="mt-[var(--figma-space-md)] w-full rounded-[var(--figma-radius-lg)]" href={`/inquiries/${encodeURIComponent(inquiryId)}/confirmations/${encodeURIComponent(confirmation.confirmationId)}`} variant="secondary">
        주문확인서 보기
      </FlowCardAction>
    </FlowCard>
  );
}

function ChatMenuOverlay({ inquiryId, storeId, storeSlug, toggleId }: { inquiryId?: string; storeId?: string; storeSlug?: string; toggleId: string }) {
  const returnTo = inquiryId ? `/inquiries/${encodeURIComponent(inquiryId)}` : "";
  const noticeParams = new URLSearchParams({ notice: "1", readonly: "1" });
  if (returnTo) noticeParams.set("returnTo", returnTo);
  const noticeHref = storeSlug ? `/stores/${encodeURIComponent(storeSlug)}?${noticeParams.toString()}` : "/stores";
  const leaveHref = inquiryId ? `/inquiries/${encodeURIComponent(inquiryId)}?state=leave` : "/inquiries?state=leave";

  return (
    <div className="figma-chat-menu-overlay absolute inset-0 z-50 flex items-end">
      <label aria-label="상담 메뉴 닫기" className="absolute inset-0 cursor-pointer" htmlFor={toggleId} />
      <section className="figma-chat-menu-sheet relative flex w-full flex-col gap-[var(--figma-space-lg)] rounded-t-[var(--figma-radius-lg)] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-xl)] shadow-[var(--figma-shadow-dropdown)]" data-ui="chat-menu-sheet">
        <nav className="grid gap-[var(--figma-space-sm)]" data-ui="chat-menu-items">
          <Link className="flex h-14 w-full items-center rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] p-[var(--figma-space-md)] text-heading-md" href={noticeHref}>
            공지사항
          </Link>
          <div className="overflow-hidden rounded-[var(--figma-radius-sm)]">
            <ChatMenuActionButton action="report" inquiryId={inquiryId} storeId={storeId} />
            <ChatMenuActionButton action="serviceInquiry" inquiryId={inquiryId} storeId={storeId} />
          </div>
          <Link className="flex h-14 w-full items-center rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] p-[var(--figma-space-md)] text-heading-md text-[var(--figma-color-action-destructive)]" href={leaveHref}>
            채팅방 나가기
          </Link>
        </nav>
        <label className="flex h-[52px] cursor-pointer items-center justify-center rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] text-heading-md text-white" htmlFor={toggleId} role="button">
          닫기
        </label>
      </section>
    </div>
  );
}

function AppTitleHeader({ title, backHref }: { title: string; backHref: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-white">
      <Link aria-label="뒤로" className="grid h-12 w-12 place-items-center" href={backHref}>
        <IconAsset name="chevron-left.svg" />
      </Link>
      <h1 className="text-display-sm">{title}</h1>
      <span className="h-12 w-12" />
    </header>
  );
}

function LoadingState({ title }: { title: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-[var(--figma-space-md)] text-center">
      <p className="text-body-md text-[var(--figma-color-text-secondary)]">{title}</p>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-[var(--figma-space-xs)] pb-[103px] text-center">
      <h2 className="w-full text-display-sm">{title}</h2>
      <p className="w-full text-body-md text-[var(--figma-color-text-secondary)]">{body}</p>
    </div>
  );
}

function InquiryListScreen({ empty = false, items }: { empty?: boolean; items?: InquiryListItemResponse[] }) {
  const hasApiData = items !== undefined;
  const list = items ?? [];

  if (!hasApiData) {
    return (
      <div className="flex h-full flex-col bg-white">
        <AppTitleHeader backHref={getBuyerBackHref("inquiries")} title="문의 목록" />
        <LoadingState title="문의 목록을 불러오는 중입니다" />
      </div>
    );
  }

  if (empty || (hasApiData && list.length === 0)) {
    return (
      <div className="flex h-full flex-col bg-white">
        <AppTitleHeader backHref={getBuyerBackHref("inquiries")} title="문의 목록" />
        <EmptyState body="스토어에서 문의를 시작하면 이 곳에 모여요." title="아직 상담한 스토어가 없어요" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
        <AppTitleHeader backHref={getBuyerBackHref("inquiries")} title="문의 목록" />
        <div className="h-px shrink-0 bg-[var(--figma-color-surface-subtle)] opacity-90" />
        <div className="flex-1 overflow-y-auto py-[var(--figma-space-sm)]">
        {list.map((item) => (
          <InquiryListItem
            href={`/inquiries/${encodeURIComponent(item.inquiryId)}`}
            key={item.inquiryId}
            preview={formatInquiryPreview(item)}
            profileImageUrl={item.participant.profileImageDeliveryUrl}
            time={formatRelativeTime(getInquiryLatestActivityAt(item))}
            title={item.storeName}
            unreadCount={item.unreadCount}
          />
        ))}
      </div>
    </div>
  );
}

function InquiryListItem({ href, preview, profileImageUrl, time, title, unreadCount = 0 }: { href: string; preview: string; profileImageUrl?: string | null; time: string; title: string; unreadCount?: number }) {
  return (
    <Link className="flex h-20 w-full items-center gap-[var(--figma-space-md)] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-md)]" href={href}>
      <StoreImage size={48} src={profileImageUrl} />
      <div className="flex min-w-0 flex-1 self-stretch">
        <div className="flex min-w-0 flex-1 items-start justify-between">
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <div className="flex w-full min-w-0 items-center gap-[var(--figma-space-xs)]">
              <h2 className="min-w-0 truncate text-heading-md">{title}</h2>
              {unreadCount > 0 ? <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[var(--figma-color-action-destructive)] px-[3px] text-label-xs text-white">{formatUnreadCount(unreadCount)}</span> : null}
            </div>
            <p className="w-full truncate text-body-md text-[var(--figma-color-text-secondary)]">{preview}</p>
          </div>
          <time className="h-full w-11 shrink-0 text-right text-label-xs text-[var(--figma-color-text-tertiary)]">{time}</time>
        </div>
      </div>
    </Link>
  );
}

function OrderListScreen({ empty = false, items }: { empty?: boolean; items?: OrderListItemResponse[] }) {
  const hasApiData = items !== undefined;
  const list = items ?? [];

  if (!hasApiData) {
    return (
      <div className="flex h-full flex-col bg-white">
        <AppTitleHeader backHref={getBuyerBackHref("orders")} title="주문 내역" />
        <LoadingState title="주문 내역을 불러오는 중입니다" />
      </div>
    );
  }

  if (empty || (hasApiData && list.length === 0)) {
    return (
      <div className="flex h-full flex-col bg-white">
        <AppTitleHeader backHref={getBuyerBackHref("orders")} title="주문 내역" />
        <EmptyState body="스토어에서 문의를 시작하면 이 곳에 모여요." title="아직 주문한 스토어가 없어요" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <AppTitleHeader backHref={getBuyerBackHref("orders")} title="주문 내역" />
      <div className="flex-1 overflow-y-auto">
        {groupOrdersByYear(list).map(([year, yearOrders]) => (
          <OrderYearSection key={year} year={year}>
            {yearOrders.map((order) => (
              <OrderListItem
                amount={formatWon(order.paidAmount)}
                date={formatOrderPickup(order.pickupAt)}
                href={`/orders/${encodeURIComponent(order.id)}`}
                key={order.id}
                status={formatOrderStatus(order.status)}
                statusTone={getOrderStatusTone(order.status)}
                store={order.menuName || order.orderNumber}
              />
            ))}
          </OrderYearSection>
        ))}
      </div>
    </div>
  );
}

function OrderYearSection({ children, year }: { children: ReactNode; year: string }) {
  return (
    <section>
      <div className="flex h-[46px] items-start gap-[var(--figma-space-sm)] px-[var(--figma-space-md)] pb-[var(--figma-space-sm)] pt-[var(--figma-space-md)]">
        <h2 className="text-number-md">{year}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

function OrderListItem({ amount, date, href, status, statusTone, store }: { amount: string; date: string; href: string; status: string; statusTone: StatusTone; store: string }) {
  return (
    <Link className="flex h-[104px] w-full gap-[var(--figma-space-md)] bg-white p-[var(--figma-space-md)]" href={href}>
      <StoreImage size={70} />
      <div className="flex min-w-0 flex-1 items-start justify-between gap-[var(--figma-space-md)]">
        <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
          <h3 className="text-heading-md">{store}</h3>
          <p className="truncate text-body-sm text-[var(--figma-color-text-tertiary)]">{date}</p>
          <p className="text-number-md text-[var(--figma-color-text-secondary)]">{amount}</p>
        </div>
        <div className="flex h-full shrink-0 flex-col items-end justify-end">
          <StatusPill label={status} tone={statusTone} />
          <span className="grid h-12 w-12 place-items-center text-[28px] text-[var(--figma-color-icon-default)]">›</span>
        </div>
      </div>
    </Link>
  );
}

function NotificationsScreen({ empty = false, items }: { empty?: boolean; items?: NotificationResponse[] }) {
  const hasApiData = items !== undefined;
  const list = items ?? [];

  if (!hasApiData) {
    return (
      <div className="flex h-full flex-col bg-white">
        <AppTitleHeader backHref={getBuyerBackHref("notifications")} title="알림" />
        <LoadingState title="알림을 불러오는 중입니다" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <AppTitleHeader backHref={getBuyerBackHref("notifications")} title="알림" />
      <div className="flex h-[68px] gap-[var(--figma-space-sm)] px-[var(--figma-space-md)] pb-[var(--figma-space-sm)] pt-[var(--figma-space-md)]">
        <button className="h-11 rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] px-[var(--figma-space-md)] text-label-md text-[var(--figma-color-text-secondary)]" type="button">
          전체
        </button>
        <button className="h-11 rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-action-primary)] px-[var(--figma-space-md)] text-label-md text-white" type="button">
          활동
        </button>
      </div>
      {empty || (hasApiData && list.length === 0) ? (
        <EmptyState body="스토어에서 문의를 시작하면 이 곳에 모여요." title="아직 주문한 스토어가 없어요" />
      ) : (
        <div className="figma-scrollbar-none flex-1 overflow-y-auto">
          {list.map((item) => (
            <NotificationActionItem
              body={item.body}
              item={item}
              key={item.id}
              read={Boolean(item.readAt)}
              referenceHref={getNotificationReferenceHref(item)}
              time={formatRelativeTime(item.createdAt)}
              title={item.title}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getNotificationReferenceHref(item: NotificationResponse) {
  const referenceType = item.referenceType.toUpperCase();

  if (referenceType.includes("CONFIRMATION")) {
    return "/notifications";
  }

  if (referenceType.includes("ORDER")) {
    return `/orders/${encodeURIComponent(item.referenceId)}`;
  }

  if (referenceType.includes("INQUIRY") || referenceType.includes("CHAT")) {
    return `/inquiries/${encodeURIComponent(item.referenceId)}`;
  }

  return "/notifications";
}

function AccountScreen({ pageKey, profile }: { pageKey: PageKey; profile?: UserProfileResponse }) {
  const signupProvider = formatSignupProvider(profile?.signupProvider);
  const title = pageKey === "settings" ? "설정" : "마이페이지";
  const backHref = getBuyerBackHref(pageKey);

  if (!profile) {
    return (
      <div className="flex h-full flex-col bg-white">
        <AppTitleHeader backHref={backHref} title={title} />
        <LoadingState title="프로필을 불러오는 중입니다" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <AppTitleHeader backHref={backHref} title={title} />
      <div className="flex-1 overflow-y-auto px-[var(--figma-space-md)] pb-safe-lg pt-[57px]">
        <SettingsSection title="개인 정보">
          <SettingRow label="이름" value={profile.name ?? "-"} />
          <SettingRow label="이메일" value={profile.email ?? "-"} />
          <SettingRow label="전화번호" value={profile.phoneNumber ?? "-"} />
        </SettingsSection>
        <SettingsSection>
          <SettingRow label="소셜연동" value={signupProvider} />
        </SettingsSection>
        <SettingsSection title="알림">
          <Link className="flex h-14 items-center justify-between rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] px-[var(--figma-space-md)] text-heading-md" href="/notifications">
            알림 설정
            <span className="text-[28px] text-[var(--figma-color-icon-default)]">›</span>
          </Link>
        </SettingsSection>
        <SettingsSection title="계정">
          <div className="overflow-hidden rounded-[var(--figma-radius-sm)]">
            <SettingRow label="약관 및 정책" />
            <SettingRow label="문의하기" />
          </div>
          <div className="mt-[var(--figma-space-md)] flex justify-center gap-[var(--figma-space-sm)] text-label-sm text-[var(--figma-color-text-tertiary)]">
            <button type="button">회원탈퇴</button>
            <span className="h-3 w-px bg-[var(--figma-color-border-subtle)]" />
            <button type="button">로그아웃</button>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

function formatSignupProvider(value?: string | null) {
  const providers: Record<string, string> = {
    GOOGLE: "구글",
    KAKAO: "카카오",
  };

  return value ? providers[value.toUpperCase()] ?? value : "-";
}

function SettingsSection({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <section className="mb-[var(--figma-space-md)] grid gap-[var(--figma-space-sm)]">
      {title ? <h2 className="text-label-xs text-[var(--figma-color-text-tertiary)]">{title}</h2> : null}
      <div className="overflow-hidden rounded-[var(--figma-radius-sm)]">{children}</div>
    </section>
  );
}

function SettingRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex min-h-14 items-center justify-between bg-[var(--figma-color-surface-subtle)] px-[var(--figma-space-md)] py-[var(--figma-space-md)]">
      <p className="text-heading-md">{label}</p>
      {value ? <p className="text-body-md text-[var(--figma-color-text-secondary)]">{value}</p> : null}
    </div>
  );
}

function OrderDetailScreen({ detail, state }: { detail?: OrderDetailResponse; state: string }) {
  const order = detail?.order;
  const orderHref = order ? `/orders/${encodeURIComponent(order.id)}` : "/orders";
  const inquiryHref = order ? `/inquiries/${encodeURIComponent(order.inquiryId)}?state=paid` : "/inquiries";

  if (!order) {
    return (
      <div className="flex h-full flex-col bg-white">
        <AppTitleHeader backHref={getBuyerBackHref("orderDetail")} title="주문 내역" />
        <LoadingState title="주문 상세를 불러오는 중입니다" />
      </div>
    );
  }

  if (state === "cancel-submitted" || state === "cancel-failed") {
    return <CancelResultScreen failed={state === "cancel-failed"} inquiryHref={inquiryHref} />;
  }

  return (
    <div className="relative flex h-full flex-col bg-[var(--figma-color-surface-subtle)]">
      <AppTitleHeader backHref={getBuyerBackHref("orderDetail")} title="주문 내역" />
      <div className="flex-1 overflow-y-auto p-[var(--figma-space-md)]">
        <OrderDetailCard detail={detail} />
      </div>
      <div className="shrink-0 px-[var(--figma-space-md)] pb-safe-lg pt-[var(--figma-space-md)]">
        <div className="flex gap-[var(--figma-space-sm)]">
          <Link className="flex h-11 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-strong)] bg-white text-label-md text-[var(--figma-color-text-secondary)]" href={`${orderHref}?state=cancel`}>
            취소 요청
          </Link>
          <Link className="flex h-11 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] text-label-md text-white" href={inquiryHref}>
            채팅방 가기
          </Link>
        </div>
      </div>
      {state === "cancel" ? (
        <OrderCancelRequestDialog
          cancelHref={orderHref}
          failureHref={`${orderHref}?state=cancel-failed`}
          orderId={order?.id}
          successHref={`${orderHref}?state=cancel-submitted`}
        />
      ) : null}
    </div>
  );
}

function OrderDetailCard({ detail }: { detail?: OrderDetailResponse }) {
  const order = detail?.order;
  const optionRows = parseOptionSummary(order?.optionSummary);

  if (!order) return null;

  return (
    <section className="flex flex-col gap-[var(--figma-space-xl)] rounded-[var(--figma-radius-sm)] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-xl)] shadow-[var(--figma-shadow-card)]">
      <div className="flex flex-col gap-[var(--figma-space-lg)]">
        <div className="grid gap-[var(--figma-space-xs)]">
          <MetaLine label="결제일시" value={formatKoreanDateTime(order.createdAt)} />
          <MetaLine label="픽업일시" value={formatKoreanDateTime(order.pickupAt)} />
          <MetaLine label="스토어명" value={order.menuName || order.orderNumber} />
        </div>
        <div className="flex items-center justify-between">
          <StatusPill label={formatOrderStatus(order.status)} tone={getOrderStatusTone(order.status)} />
          <p className="text-display-sm">{formatWon(order.paidAmount)}</p>
        </div>
      </div>
      <Divider />
      <div className="grid gap-[var(--figma-space-lg)]">
        {optionRows.length ? optionRows.map((row) => <ConfirmationRow key={`${row.label}-${row.value}`} label={row.label} value={row.value} />) : <p className="text-body-sm text-[var(--figma-color-text-tertiary)]">주문 옵션 정보가 없습니다.</p>}
      </div>
    </section>
  );
}

function Divider() {
  return <div className="h-px bg-[var(--figma-color-border-subtle)]" />;
}

function ConfirmationRow({ label, price, value }: { label: string; price?: string; value: string }) {
  return (
    <div>
      <p className="text-label-sm text-[var(--figma-color-text-tertiary)]">{label}</p>
      <div className="mt-[var(--figma-space-sm)] flex items-start justify-between gap-[var(--figma-space-md)]">
        <p className="min-w-0 text-heading-md">{value}</p>
        {price ? <p className="shrink-0 text-number-md">{price}</p> : null}
      </div>
    </div>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-[var(--figma-space-md)] text-label-sm">
      <span className="text-[var(--figma-color-text-tertiary)]">{label}</span>
      <span className="min-w-0 text-right text-label-md text-[var(--figma-color-text-primary)]">{value}</span>
    </div>
  );
}

type StatusTone = "consulting" | "danger" | "paid" | "picked" | "received";

function StatusPill({ className = "", label, tone }: { className?: string; label: string; tone: StatusTone }) {
  const toneClass = {
    consulting: "bg-[var(--figma-color-status-consulting-bg)] text-[var(--figma-color-status-consulting)]",
    danger: "bg-[var(--figma-color-status-error-bg)] text-[var(--figma-color-status-error)]",
    paid: "bg-[var(--figma-color-status-paid-bg)] text-[var(--figma-color-status-paid)]",
    picked: "bg-[var(--figma-color-status-pickedup-bg)] text-[var(--figma-color-status-pickedup)]",
    received: "bg-[var(--figma-color-status-received-bg)] text-[var(--figma-color-status-received)]",
  }[tone];

  return <span className={`inline-flex h-6 items-center rounded-[var(--figma-radius-sm)] px-[var(--figma-space-sm)] text-label-sm ${toneClass} ${className}`}>{label}</span>;
}

function formatWon(value: number) {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function formatRelativeTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatOrderReceivedNotice(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "주문이 접수되었습니다.";

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${month}월 ${day}일 ${hour}:${minute}분 주문이 접수되었습니다.`;
}

function formatOrderPickup(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const time = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return `${month}월 ${day}일 ·${time}`;
}

function formatKoreanDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatOrderStatus(status: string) {
  const labels: Record<string, string> = {
    CANCEL_REQUESTED: "취소요청",
    CANCELED: "취소완료",
    PAID: "결제완료",
    PAYMENT_COMPLETED: "결제완료",
    PICKED_UP: "픽업완료",
    PICKUP_COMPLETED: "픽업완료",
    REFUND_PROCESSING: "환불처리중",
    REFUNDED: "환불완료",
  };

  return labels[status] ?? status;
}

function getOrderStatusTone(status: string): StatusTone {
  const tones: Record<string, StatusTone> = {
    CANCEL_REQUESTED: "consulting",
    CANCELED: "danger",
    PAID: "paid",
    PAYMENT_COMPLETED: "paid",
    PICKED_UP: "picked",
    PICKUP_COMPLETED: "picked",
    REFUND_PROCESSING: "consulting",
    REFUNDED: "received",
  };

  return tones[status] ?? "received";
}

function formatInquiryStatus(status: string) {
  const labels: Record<string, string> = {
    CONSULTING: "상담중",
    IN_PROGRESS: "상담중",
    OPEN: "접수대기",
    PAID: "결제완료",
    PENDING: "접수대기",
    PICKED_UP: "픽업완료",
    TRASH: "휴지통",
    WAITING: "접수대기",
  };

  return labels[status] ?? status;
}

function getInquiryLatestActivityAt(item: InquiryListItemResponse) {
  return (
    item.latestEvent?.createdAt ??
    item.latestOrderFormSubmission?.submittedAt ??
    item.latestEventAt ??
    item.createdAt
  );
}

function formatInquiryPreview(item: InquiryListItemResponse) {
  const content = item.latestEvent?.content?.trim();
  if (content) return content;

  if (item.latestEvent?.type) {
    return formatTimelineItemType(item.latestEvent.type);
  }

  if (item.latestOrderFormSubmission) {
    return formatTimelineItemType("ORDER_FORM_SUBMISSION");
  }

  return formatInquiryStatus(item.status);
}

function formatTimelineItemType(type: string) {
  const labels: Record<string, string> = {
    MESSAGE: "메시지가 도착했습니다.",
    ORDER_CONFIRMATION: "주문 확인서가 도착했습니다.",
    ORDER_CONFIRMATION_REVISION: "주문 확인서 수정 요청을 보냈습니다.",
    ORDER_FORM_SUBMITTED: "주문서가 접수되었습니다.",
    ORDER_FORM_SUBMISSION: "주문서가 접수되었습니다.",
    ORDER_CONFIRMATION_SENT: "주문 확인서가 도착했습니다.",
    PAYMENT_COMPLETED: "결제가 완료되었습니다.",
  };

  return labels[type] ?? type;
}

function formatUnreadCount(value: number) {
  return value > 99 ? "99+" : String(value);
}

function groupOrdersByYear(orders: OrderListItemResponse[]) {
  const groups = new Map<string, OrderListItemResponse[]>();

  for (const order of orders) {
    const date = new Date(order.pickupAt);
    const year = Number.isNaN(date.getTime()) ? "기타" : String(date.getFullYear());
    groups.set(year, [...(groups.get(year) ?? []), order]);
  }

  return Array.from(groups.entries()).sort(([left], [right]) => right.localeCompare(left));
}

function parseOptionSummary(value?: string | null) {
  if (!value) return [];

  return value
    .split(/\n|,/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part, index) => {
      const [label, ...rest] = part.split(":");
      return {
        label: rest.length ? label.trim() : `옵션 ${index + 1}`,
        value: rest.length ? rest.join(":").trim() : part,
      };
    });
}

function CancelResultScreen({ failed, inquiryHref }: { failed: boolean; inquiryHref: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <AppTitleHeader backHref={getBuyerBackHref("orderDetail")} title="주문 내역" />
      <div className="flex flex-1 flex-col items-center justify-center px-[var(--figma-space-md)] text-center">
        <h1 className="text-display-sm">{failed ? "취소 요청에 실패했어요" : "취소 요청이 접수되었습니다."}</h1>
        <p className="mt-[var(--figma-space-sm)] text-body-md text-[var(--figma-color-text-secondary)]">
          {failed ? "매장 내 환불정책 확인결과 환불 요청이 어려운 상태에요" : "스토어 사장님이 매장 환불정책 확인 후 환불 요청을 도와드려요"}
        </p>
      </div>
      <div className="px-[var(--figma-space-md)] pb-safe-lg pt-[var(--figma-space-md)]">
        <Link className="flex h-11 items-center justify-center rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] text-label-md text-white" href={inquiryHref}>
          채팅방 가기
        </Link>
      </div>
    </div>
  );
}

function SummaryScreen({ page, context }: { page: BuyerPage; context?: string }) {
  return (
    <div className="flex h-full flex-col bg-[var(--figma-color-surface-subtle)]">
      <Header backHref={getBuyerBackHref(page.key, context)} title={page.title} variant="back" />
      <div className="flex-1 overflow-y-auto p-[var(--figma-space-md)]">
        <section className="rounded-[var(--figma-radius-sm)] bg-white p-[var(--figma-space-md)] shadow-[var(--figma-shadow-card)]">
          <p className="text-label-md text-[var(--figma-color-text-secondary)]">wihada flowmap</p>
          <h1 className="mt-[var(--figma-space-sm)] text-display-sm">{page.title}</h1>
          <p className="mt-[var(--figma-space-md)] text-body-sm text-[var(--figma-color-text-secondary)]">
            {context ?? "상담, 확인서, 결제, 픽업 흐름은 flowmap 완성본의 모바일 UI 규칙으로 표시합니다."}
          </p>
          <div className="mt-[var(--figma-space-xl)] grid gap-[var(--figma-space-sm)]">
            <FlowLink href="/stores" label="스토어 목록" />
            <FlowLink href="/inquiries" label="상담 목록" />
            <FlowLink href="/orders" label="주문 내역" />
          </div>
        </section>
      </div>
    </div>
  );
}

function FlowLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="flex h-11 items-center justify-center rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] text-label-md text-white" href={href}>
      {label}
    </Link>
  );
}

function SystemScreen({ context, page }: { context?: string; page: BuyerPage }) {
  const reason = getContextReason(context);
  const copy =
    page.key === "error"
      ? {
          body: "잠시 후 다시 시도해 주세요.\n계속 안 되면 사장님께 문의해 주세요.",
          cta: "다시 시도하기",
          href: "/stores",
          secondary: "홈으로 가기",
          title: "문제가 생겼어요",
        }
      : reason === "seller-only"
        ? {
            body: "구매자 계정으로는 열 수 없어요.\n판매자 계정으로 로그인하면 이용할 수 있어요.",
            cta: "홈으로 가기",
            href: "/",
            title: "판매자 전용 화면이에요",
          }
        : reason === "private-store"
          ? {
              body: "사장님이 스토어를 비공개로 바꿨어요.\n다시 열리면 이 링크로 들어올 수 있어요.",
              cta: "홈으로 가기",
              href: "/",
              title: "지금은 볼 수 없는 스토어예요",
            }
          : {
              body: "다른 분의 문의 내용이라 볼 수 없어요.\n내 문의는 상담 목록에서 확인할 수 있어요.",
              cta: "홈으로 가기",
              href: "/",
              title: "이 대화는 열 수 없어요",
            };

  return (
    <div className="flex h-full flex-col bg-white">
      <Header backHref={getBuyerBackHref(page.key, context)} title={page.title} variant="back" />
      <div className="flex flex-1 flex-col items-center justify-center gap-[var(--figma-space-sm)] overflow-hidden p-[var(--figma-space-md)] text-center">
        <h1 className="w-full text-display-sm">{copy.title}</h1>
        <p className="w-full whitespace-pre-line text-body-md text-[var(--figma-color-text-secondary)]">{copy.body}</p>
      </div>
      <div className="shrink-0 px-[var(--figma-space-md)] pb-[34px] pt-[var(--figma-space-md)]">
        <Link className="flex h-[52px] items-center justify-center rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] text-heading-md text-white" href={copy.href}>
          {copy.cta}
        </Link>
        {"secondary" in copy ? (
          <Link className="mt-[13px] block text-center text-label-sm text-[var(--figma-color-text-link)]" href="/">
            {copy.secondary}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function getContextReason(context?: string) {
  return context?.match(/reason=([^,\s]+)/)?.[1] ?? "";
}
