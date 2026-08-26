import Image from "next/image";
import Link from "next/link";
import { ChatComposer } from "@/features/chat-flow/chat-composer";
import { FlowLoginSheet } from "@/features/flow-blueprint/login-sheet";
import { StoreOrderSection } from "@/features/flow-blueprint/store-order-section";

type PageKey =
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

type ScreenMode = "store" | "imageOrder" | "notice" | "login" | "chat" | "summary" | "system";

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

export function BuyerBlueprintPage({ page, context }: { page: BuyerPage; context?: string }) {
  const mode = getScreenMode(page.key);

  return (
    <main className="min-h-screen bg-[var(--figma-color-surface-subtle)] text-[var(--figma-color-text-primary)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[var(--figma-container-lg)] place-items-center lg:grid-cols-[1fr_390px_1fr] lg:gap-8 lg:px-8">
        <DesktopRail page={page} side="left" />
        <div className="relative h-screen w-full max-w-[390px] overflow-hidden bg-[var(--figma-color-surface-background)] shadow-[var(--figma-shadow-dropdown)] lg:h-[844px] lg:rounded-[28px]">
          {renderPhoneScreen(mode, page, context)}
        </div>
        <DesktopRail page={page} side="right" />
      </div>
    </main>
  );
}

function getScreenMode(key: PageKey): ScreenMode {
  if (key === "auth" || key === "role" || key === "authCallback" || key === "authSync") return "login";
  if (key === "productDetail") return "imageOrder";
  if (key === "storeDetail" || key === "stores" || key === "home") return "store";
  if (key === "inquiryDetail" || key === "inquiries") return "chat";
  if (key === "settings") return "notice";
  if (key === "forbidden" || key === "error") return "system";
  return "summary";
}

function renderPhoneScreen(mode: ScreenMode, page: BuyerPage, context?: string) {
  if (mode === "login") return <FlowLoginSheet />;
  if (mode === "imageOrder") return <StoreScreen modal="imageOrder" />;
  if (mode === "notice") return <NoticeScreen />;
  if (mode === "chat") return <ChatScreen context={context} />;
  if (mode === "summary") return <SummaryScreen context={context} page={page} />;
  if (mode === "system") return <SystemScreen page={page} />;
  return <StoreScreen />;
}

function StatusBar() {
  return (
    <div className="flex h-[46.977px] items-center justify-between pb-[12.409px] pl-[23.932px] pr-[23.045px] pt-[15.955px]">
      <span className="w-[47.864px] text-center text-[13.36px] font-semibold leading-[17.284px] tracking-[-0.3616px]">9:41</span>
      <Image alt="" height={12} src={asset("statusbar.svg")} width={69} />
    </div>
  );
}

function IconAsset({ name, size = 48 }: { name: string; size?: number }) {
  return <Image alt="" height={size} src={asset(name)} width={size} />;
}

function Header({ title, variant = "home" }: { title?: string; variant?: "home" | "back" | "chat" }) {
  if (variant === "home") {
    return (
      <header className="flex h-14 items-center justify-between overflow-hidden pl-[var(--figma-space-md)]">
        <Link aria-label="홈" className="grid h-12 w-12 place-items-center" href="/">
          <IconAsset name="logo-symbol.svg" />
        </Link>
        <div className="flex items-center px-[var(--figma-space-xs)]">
          <Link aria-label="알림" className="grid h-12 w-12 place-items-center" href="/notifications">
            <IconAsset name="bell.svg" />
          </Link>
          <Link aria-label="메뉴" className="grid h-12 w-12 place-items-center" href="/me">
            <IconAsset name="hamburger.svg" />
          </Link>
        </div>
      </header>
    );
  }

  if (variant === "chat") {
    return (
      <header className="flex h-14 items-center justify-between px-[var(--figma-space-md)]">
        <Link aria-label="뒤로" className="grid h-6 w-6 place-items-center" href="/inquiries">
          <IconAsset name="chat-back.svg" size={24} />
        </Link>
        <h1 className="text-display-sm">포싵</h1>
        <button aria-label="상담 메뉴" className="grid h-6 w-6 place-items-center" type="button">
          <IconAsset name="chat-menu.svg" size={24} />
        </button>
      </header>
    );
  }

  return (
    <header className="flex h-14 items-center justify-between">
      <Link aria-label="뒤로" className="grid h-12 w-12 place-items-center" href="/stores/faucet">
        <IconAsset name="chevron-left.svg" />
      </Link>
      <h1 className="text-display-sm">{title}</h1>
      <Link aria-label="메뉴" className="grid h-12 w-12 place-items-center" href="/me">
        <IconAsset name="hamburger.svg" />
      </Link>
    </header>
  );
}

function StoreScreen({ modal }: { modal?: "imageOrder" }) {
  return (
    <div className="relative h-full overflow-y-auto bg-white">
      <StatusBar />
      <Header />
      <section className="flex flex-col gap-[var(--figma-space-xs)] px-[var(--figma-space-md)] pt-[var(--figma-space-md)]">
        <h1 className="text-display-sm">위하다</h1>
        <p className="text-body-sm text-[var(--figma-color-text-secondary)]">@faucet.cake.shop</p>
      </section>
      <section className="px-[var(--figma-space-md)] py-[var(--figma-space-md)]">
        <div className="grid grid-cols-3 overflow-hidden rounded-[var(--figma-radius-sm)] bg-white">
          {["cake-01.png", "cake-02.png", "cake-03.png"].map((name, index) => (
            <div className="relative aspect-[116/140] border-r border-white last:border-r-0" key={name}>
              <Image alt={`위하다 대표 이미지 ${index + 1}`} className="object-cover" fill sizes="120px" src={asset(name)} />
            </div>
          ))}
        </div>
      </section>
      <section className="px-[var(--figma-space-md)] pb-[var(--figma-space-xl)]">
        <p className="text-[17px] leading-[26px] tracking-[-0.02em] text-[var(--figma-color-text-secondary)]">
          위하다 - 연희동 케이크 • 연남동케이크 • 홍대케이크 • 망원동케이크 • 합정케이크
        </p>
      </section>
      <section className="px-[var(--figma-space-md)] py-[var(--figma-space-md)]">
        <div className="rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] p-[var(--figma-space-md)]">
          <InfoRow label="픽업 장소" value="서울 서대문구 연희로12길 10-4 1층 FAUCET" />
          <InfoRow label="영업시간" value="월~일 오후 12:00-17:00 · 마감 휴무 유동적" />
          <InfoRow label="취소와 환불" value="픽업 7일 전까지 전액 환불" />
        </div>
      </section>
      <StoreOrderSection />
      {modal === "imageOrder" ? <ImageOrderModal /> : null}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-[var(--figma-space-md)] py-[var(--figma-space-sm)] text-body-sm">
      <span className="w-[72px] shrink-0 font-medium leading-4 text-[var(--figma-color-text-secondary)]">{label}</span>
      <span className="min-w-0 flex-1 text-[var(--figma-color-text-primary)]">{value}</span>
    </div>
  );
}

function ImageOrderModal() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--figma-color-surface-scrim)] px-[var(--figma-space-md)]">
      <div className="flex w-full flex-col items-center gap-[var(--figma-space-md)] rounded-[var(--figma-radius-lg)] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-lg)]">
        <div className="flex w-full justify-end">
          <button aria-label="닫기" className="grid h-12 w-12 place-items-center" type="button">
            <IconAsset name="cancel.svg" />
          </button>
        </div>
        <h2 className="text-center text-heading-lg">
          선택한 케이크 이미지로
          <br />
          주문하시겠어요?
        </h2>
        <div className="relative aspect-square w-full overflow-hidden rounded-[21px]">
          <Image alt="선택한 케이크" className="object-cover" fill sizes="326px" src={asset("cake-01.png")} />
        </div>
        <div className="flex w-full gap-[var(--figma-space-sm)]">
          <Link className="flex h-11 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-default)] text-label-md" href="/inquiries/sample-inquiry">
            문의하기
          </Link>
          <Link className="flex h-11 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] text-label-md text-white" href="/stores/faucet/order-form-drafts/new?step=pickup-date">
            주문하기
          </Link>
        </div>
        <Link className="text-label-sm text-[var(--figma-color-text-tertiary)]" href="/stores/faucet">
          괜찮아요
        </Link>
      </div>
    </div>
  );
}

function NoticeScreen() {
  const notices = [
    ["픽업 안내", "일찍 오시면 케이크가 준비되지 않았을 수 있어요. 당일 픽업 시간에 맞춰 케이크를 만들고 있습니다. 픽업시 케이크 디자인, 문구를 꼭 확인 부탁드려요. 확인 후에는 케이크 환불 및 수정이 어렵습니다. 예약 후 픽업 당일 2일 전에는 디자인 변경이 어려운 점 안내드립니다."],
    ["디자인", "타 업체 디자인은 받고 있지 않아요. 인스타 업로드를 원치 않으시면 사전에 말씀해주세요. 디자인 같은 경우 wihada 서비스 외 인스타에서 추가적으로 확인할 수 있어요. 그림 및 포토 케이크 주문받지 않고 있어요. 실제 케이크와 사진과 다소 다를 수 있습니다. 원하시는 색상에 가깝게 맞춰 드리지만, 직접 조색하는 과정에서 약간의 차이가 있을 수 있어요."],
    ["결제", "문의 순이 아닌 입금 순으로 주문이 확정됩니다. 미입금시 주문하지 않으시는 것으로 간주하고 다음 분에게 주문이 넘어갑니다. 카드 결제는 선입금 후 픽업시 계좌 환불 후 재결제, 현금영수증 필요시 입금 당일에 말씀해주세요."],
    ["케이크 관리", "부주의로 인한 케이크 파손은 책임지지 않습니다. 냉장보관, 이틀 내에 드시는게 좋아요. 주문하신 케이크는 구매 후 30분 ~ 1시간 이내 꼭 냉장 보관해 주세요. 그 이상 이동시 온도에 의해 무너지거나 변형될 수 있어요."],
    ["영업시간", "영업시간은 오후 12시부터 17시까지에요. 마감이랑 휴무는 유동적인 편입니다"],
  ];

  return (
    <div className="relative h-full overflow-hidden bg-[var(--figma-color-surface-subtle)]">
      <StatusBar />
      <Header title="공지사항" variant="back" />
      <div className="h-[calc(100%-211px)] overflow-y-auto p-[var(--figma-space-md)]">
        <section className="flex flex-col gap-[var(--figma-space-xl)] rounded-[var(--figma-radius-sm)] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-lg)] shadow-[var(--figma-shadow-card)]">
          {notices.map(([title, body]) => (
            <article className="flex flex-col gap-[var(--figma-space-sm)]" key={title}>
              <h2 className="text-heading-md">{title}</h2>
              <p className="text-body-sm text-[var(--figma-color-text-secondary)]">{body}</p>
            </article>
          ))}
          <div>
            <label className="flex items-center gap-[var(--figma-space-sm)]">
              <IconAsset name="checkbox-false.svg" />
              <span className="text-label-md text-[var(--figma-color-text-secondary)]">약관 전체동의</span>
            </label>
            <p className="text-label-sm text-[var(--figma-color-text-tertiary)]">* 전체 동의하에 케이크 주문이 가능합니다</p>
          </div>
        </section>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-[var(--figma-space-md)] border-t border-[var(--figma-color-border-default)] bg-white p-[var(--figma-space-md)]">
        <button className="h-11 rounded-[var(--figma-radius-md)] bg-[#c6c6ca] text-label-md text-white" type="button">
          다음
        </button>
        <Link className="text-center text-label-sm text-[var(--figma-color-text-tertiary)]" href="/stores/faucet">
          다음에 주문할게요
        </Link>
      </div>
    </div>
  );
}

function ChatScreen({ context }: { context?: string }) {
  if (context?.includes("state=final-price") || context?.includes("submitted=1")) {
    return <FinalPriceChatScreen />;
  }

  return (
    <div className="flex h-full flex-col bg-[var(--figma-color-surface-subtle)]">
      <StatusBar />
      <div className="shrink-0">
        <Header variant="chat" />
        <div className="flex h-10 items-center justify-between bg-[var(--figma-color-action-subtle)] px-[var(--figma-space-md)]">
          <p className="text-body-sm text-[var(--figma-color-text-secondary)]">픽업만 가능 · 월~일 오후 12:00-17:00</p>
          <span className="rounded-[var(--figma-radius-full)] bg-[var(--figma-color-action-subtle)] px-[var(--figma-space-sm)] py-[var(--figma-space-xs)] text-label-sm">접수됨</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex justify-center pt-[var(--figma-space-md)]">
          <time className="text-label-sm text-[var(--figma-color-text-tertiary)]">8월 14일 금요일</time>
        </div>
        <section className="flex flex-col gap-[var(--figma-space-md)] pb-[var(--figma-space-lg)] pl-[var(--figma-space-xl)] pr-[var(--figma-space-md)] pt-[var(--figma-space-md)]">
          <article className="rounded-[var(--figma-radius-md)] bg-white p-[var(--figma-space-md)] shadow-[var(--figma-shadow-card)]">
            <div className="flex items-center gap-[var(--figma-space-md)]">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--figma-radius-sm)]">
                <Image alt="주문 케이크" className="object-cover" fill sizes="80px" src={asset("cake-01.png")} />
              </div>
              <div className="min-w-0">
                <p className="text-label-sm text-[var(--figma-color-text-secondary)]">주문서</p>
                <h2 className="mt-[var(--figma-space-sm)] text-heading-md">케이크 2호 사이즈</h2>
                <p className="mt-[var(--figma-space-sm)] truncate text-label-sm text-[var(--figma-color-text-tertiary)]">안녕하세요. 케이크 잘 부탁드립니다!</p>
              </div>
            </div>
            <Link className="mt-[var(--figma-space-md)] flex h-11 items-center justify-center rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-default)] text-label-md" href={context ? "/orders/sample-order" : "/me/settings"}>
              주문서 보기
            </Link>
          </article>
          <div className="flex justify-end">
            <p className="rounded-[var(--figma-radius-lg)] bg-[var(--figma-color-action-subtle)] px-[var(--figma-space-md)] py-[var(--figma-space-sm)] text-body-sm text-[var(--figma-color-text-secondary)]">
              8월 14일 16:40분 주문이 접수되었습니다.
            </p>
          </div>
        </section>
      </div>
      <div className="shrink-0 border-t border-[var(--figma-color-border-default)] bg-white px-[var(--figma-space-md)] pb-[var(--figma-space-xl)] pt-[var(--figma-space-md)]">
        <ChatComposer placeholder="메시지를 입력하세요" />
      </div>
    </div>
  );
}

function FinalPriceChatScreen() {
  return (
    <div className="flex h-full flex-col bg-[var(--figma-color-surface-subtle)]">
      <StatusBar />
      <div className="shrink-0 bg-white">
        <header className="flex h-14 items-center justify-between px-[var(--figma-space-md)]">
          <Link aria-label="뒤로" className="grid h-6 w-6 place-items-center" href="/inquiries">
            <IconAsset name="chat-back.svg" size={24} />
          </Link>
          <h1 className="text-display-sm">위하다</h1>
          <Link aria-label="메뉴" className="grid h-6 w-6 place-items-center" href="/me">
            <IconAsset name="chat-menu.svg" size={24} />
          </Link>
        </header>
        <div className="flex h-10 items-center justify-between px-[var(--figma-space-md)]">
          <p className="text-body-sm text-[var(--figma-color-text-secondary)]">픽업만 가능 · 월~일 오후 12:00-17:00</p>
          <span className="rounded-[var(--figma-radius-full)] bg-[var(--figma-color-status-consulting-bg)] px-[var(--figma-space-sm)] py-[var(--figma-space-xs)] text-label-sm text-[var(--figma-color-status-consulting)]">상담중</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-[var(--figma-space-md)]">
        <div className="flex justify-center py-[var(--figma-space-md)]">
          <time className="text-label-sm text-[var(--figma-color-text-tertiary)]">8월 14일 금요일</time>
        </div>
        <section className="ml-auto w-[246px] rounded-[24px] bg-white p-[var(--figma-space-md)] shadow-[var(--figma-shadow-card)]">
          <div className="relative h-[212px] overflow-hidden rounded-[12px]">
            <Image alt="주문 케이크" className="object-cover" fill sizes="214px" src={asset("cake-01.png")} />
          </div>
          <h2 className="mt-[var(--figma-space-md)] text-heading-md">케이크 2호 사이즈</h2>
          <p className="mt-1 text-body-sm text-[var(--figma-color-text-secondary)]">원형 / 바닐라시트 + 생크림</p>
          <Link className="mt-[var(--figma-space-md)] flex h-9 items-center justify-center rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-default)] text-label-md" href="/stores/faucet/order-form-drafts/new?step=form">
            주문서 보기
          </Link>
        </section>
        <p className="mt-[var(--figma-space-md)] text-center text-label-sm text-[var(--figma-color-text-tertiary)]">8월 14일 16:40분 주문이 접수되었습니다.</p>
        <section className="mt-[var(--figma-space-xl)] max-w-[246px] rounded-[24px] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-md)] text-body-md shadow-[var(--figma-shadow-card)]">
          <p>
            안녕하세요. 주문 감사합니다!
            <br />
            케이크 레터링 색감은 원하시는 색 사진 넣어주시면 최대한 비슷하게 만들어 주고 있습니다!
          </p>
          <p className="mt-[var(--figma-space-lg)]">
            금액은 전체 생화 포함 64,000원입니다! 주문 확인 후 수정사항 없으면 결제 부탁드리겠습니다!
          </p>
        </section>
        <section className="mb-[var(--figma-space-lg)] mt-[var(--figma-space-sm)] max-w-[246px] rounded-[24px] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-md)] shadow-[var(--figma-shadow-card)]">
          <p className="text-label-sm text-[var(--figma-color-text-secondary)]">주문서를 확인해보세요</p>
          <div className="mt-2 flex items-end justify-between">
            <h2 className="text-heading-md">최종 가격</h2>
            <p className="text-[24px] font-bold leading-[32px] tracking-[-0.02em]">64,000원</p>
          </div>
          <p className="mt-[var(--figma-space-md)] text-label-sm text-[var(--figma-color-text-secondary)]">주문서를 확인해보세요</p>
          <Link className="mt-[var(--figma-space-md)] flex h-9 items-center justify-center rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-default)] text-label-md" href="/inquiries/sample-inquiry/confirmations/sample-confirmation">
            주문 확인서
          </Link>
          <button className="mt-[var(--figma-space-sm)] h-11 w-full rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-disabled)] text-label-md text-white" disabled type="button">
            바로 결제
          </button>
        </section>
      </div>
      <div className="shrink-0 border-t border-[var(--figma-color-border-default)] bg-white px-[var(--figma-space-md)] pb-[var(--figma-space-lg)] pt-[var(--figma-space-md)]">
        <ChatComposer />
      </div>
    </div>
  );
}

function SummaryScreen({ page, context }: { page: BuyerPage; context?: string }) {
  return (
    <div className="flex h-full flex-col bg-[var(--figma-color-surface-subtle)]">
      <StatusBar />
      <Header title={page.title} variant="back" />
      <div className="flex-1 overflow-y-auto p-[var(--figma-space-md)]">
        <section className="rounded-[var(--figma-radius-sm)] bg-white p-[var(--figma-space-md)] shadow-[var(--figma-shadow-card)]">
          <p className="text-label-md text-[var(--figma-color-text-secondary)]">wihada flowmap</p>
          <h1 className="mt-[var(--figma-space-sm)] text-display-sm">{page.title}</h1>
          <p className="mt-[var(--figma-space-md)] text-body-sm text-[var(--figma-color-text-secondary)]">
            {context ?? "상담, 확인서, 결제, 픽업 흐름은 flowmap 완성본의 모바일 UI 규칙으로 표시합니다."}
          </p>
          <div className="mt-[var(--figma-space-xl)] grid gap-[var(--figma-space-sm)]">
            <FlowLink href="/stores/faucet" label="스토어 상세" />
            <FlowLink href="/stores/faucet/products/cake-image" label="이미지로 주문하기" />
            <FlowLink href="/inquiries/sample-inquiry" label="상담 채팅방" />
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

function SystemScreen({ page }: { page: BuyerPage }) {
  return (
    <div className="flex h-full flex-col bg-[var(--figma-color-surface-subtle)]">
      <StatusBar />
      <Header title={page.title} variant="back" />
      <div className="grid flex-1 place-items-center p-[var(--figma-space-md)]">
        <section className="w-full rounded-[var(--figma-radius-sm)] bg-white p-[var(--figma-space-lg)] text-center shadow-[var(--figma-shadow-card)]">
          <h1 className="text-heading-lg">{page.title}</h1>
          <p className="mt-[var(--figma-space-sm)] text-body-sm text-[var(--figma-color-text-secondary)]">현재 흐름을 이어갈 수 없습니다.</p>
          <Link className="mt-[var(--figma-space-xl)] flex h-11 items-center justify-center rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] text-label-md text-white" href="/">
            홈으로
          </Link>
        </section>
      </div>
    </div>
  );
}

function DesktopRail({ page, side }: { page: BuyerPage; side: "left" | "right" }) {
  return (
    <aside className="hidden w-full max-w-[320px] lg:block">
      {side === "left" ? (
        <div>
          <p className="text-label-md text-[var(--figma-color-text-secondary)]">flowmap</p>
          <h2 className="mt-2 text-display-sm">{page.title}</h2>
          <p className="mt-4 text-body-sm text-[var(--figma-color-text-secondary)]">모바일 390px Figma 완성본을 기준으로 중앙 화면을 렌더링합니다.</p>
        </div>
      ) : (
        <nav className="grid gap-2">
          <FlowRailLink href="/stores/faucet" label="스토어 상세" />
          <FlowRailLink href="/stores/faucet/products/cake-image" label="주문 이미지 모달" />
          <FlowRailLink href="/stores/faucet/order-form-drafts/new?step=pickup-date" label="픽업 날짜 선택" />
          <FlowRailLink href="/stores/faucet/order-form-drafts/new?step=pickup-selected" label="픽업 선택완료" />
          <FlowRailLink href="/stores/faucet/order-form-drafts/new?step=form" label="주문서 작성" />
          <FlowRailLink href="/auth" label="로그인 바텀시트" />
          <FlowRailLink href="/inquiries/sample-inquiry?state=final-price" label="최종가 상담" />
          <FlowRailLink href="/inquiries/sample-inquiry/confirmations/sample-confirmation" label="주문확인서 상세" />
        </nav>
      )}
    </aside>
  );
}

function FlowRailLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="rounded-[var(--figma-radius-sm)] bg-white px-4 py-3 text-label-md shadow-[var(--figma-shadow-card)]" href={href}>
      {label}
    </Link>
  );
}
