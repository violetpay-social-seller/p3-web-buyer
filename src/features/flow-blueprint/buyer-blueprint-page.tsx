import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ImageIcon,
  MessageCircle,
  Search,
  Send,
  ShoppingBag,
  Store,
  UserRound,
} from "lucide-react";

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

type StoreSummary = {
  slug: string;
  name: string;
  area: string;
  shortIntro: string;
  pickup: string;
  response: string;
  image: string;
  tags: string[];
};

type ProductSummary = {
  id: string;
  storeSlug: string;
  name: string;
  price: string;
  leadTime: string;
  image: string;
  questions: string[];
};

const stores: StoreSummary[] = [
  {
    slug: "blue-dawn-cake",
    name: "블루던 케이크",
    area: "성수",
    shortIntro: "레터링 도시락 케이크와 소형 생일 케이크를 픽업 중심으로 제작합니다.",
    pickup: "목-일 13:00-19:00",
    response: "평균 18분",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
    tags: ["레터링", "도시락", "픽업"],
  },
  {
    slug: "amber-sugar-studio",
    name: "앰버슈가 스튜디오",
    area: "망원",
    shortIntro: "웨딩 샘플, 기업 행사 컵케이크, 캐릭터 디자인 케이크를 상담합니다.",
    pickup: "화-토 12:00-18:00",
    response: "평균 42분",
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80",
    tags: ["웨딩", "행사", "캐릭터"],
  },
  {
    slug: "sky-pastry-room",
    name: "스카이 페이스트리 룸",
    area: "연남",
    shortIntro: "과일 생크림과 알러지 요청이 많은 주문을 꼼꼼하게 확인합니다.",
    pickup: "금-일 11:30-17:30",
    response: "평균 25분",
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=900&q=80",
    tags: ["생크림", "알러지", "과일"],
  },
];

const products: ProductSummary[] = [
  {
    id: "mini-lettering",
    storeSlug: "blue-dawn-cake",
    name: "미니 레터링 케이크",
    price: "34,000원부터",
    leadTime: "최소 3일 전 문의",
    image: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=900&q=80",
    questions: ["문구", "크림 색상", "픽업 희망일", "참고 이미지"],
  },
  {
    id: "fruit-cream",
    storeSlug: "sky-pastry-room",
    name: "제철 과일 생크림",
    price: "48,000원부터",
    leadTime: "최소 5일 전 문의",
    image: "https://images.unsplash.com/photo-1557925923-cd4648e211a0?auto=format&fit=crop&w=900&q=80",
    questions: ["과일 선호", "알러지", "인원", "픽업 시간"],
  },
  {
    id: "event-cupcake",
    storeSlug: "amber-sugar-studio",
    name: "행사용 컵케이크 세트",
    price: "12구 42,000원부터",
    leadTime: "최소 7일 전 문의",
    image: "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=900&q=80",
    questions: ["수량", "로고 사용", "행사일", "포장 방식"],
  },
];

const inquiryMessages = [
  { from: "buyer", text: "6월 14일 오후 픽업으로 미니 레터링 케이크 가능할까요?", time: "14:02" },
  { from: "seller", text: "가능합니다. 원하시는 문구와 색상, 참고 이미지를 보내주세요.", time: "14:16" },
  { from: "buyer", text: "문구는 HAPPY YUNA, 하늘색 크림에 주황 포인트가 좋습니다.", time: "14:20" },
  { from: "seller", text: "확인했어요. 1호 사이즈 기준 확인서를 보내드릴게요.", time: "14:31" },
];

const orderItems = [
  { label: "상품", value: "미니 레터링 케이크 1호" },
  { label: "픽업", value: "2026-06-14 16:30" },
  { label: "문구", value: "HAPPY YUNA" },
  { label: "요청", value: "하늘색 크림, 주황 포인트, 초 5개" },
];

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

const navItems = [
  { href: "/", label: "홈", section: "home", icon: Store },
  { href: "/stores", label: "스토어", section: "stores", icon: Search },
  { href: "/inquiries", label: "상담", section: "inquiries", icon: MessageCircle },
  { href: "/orders", label: "주문", section: "orders", icon: ShoppingBag },
  { href: "/payments", label: "결제", section: "payments", icon: CreditCard },
  { href: "/notifications", label: "알림", section: "notifications", icon: Bell },
  { href: "/me", label: "내 정보", section: "me", icon: UserRound },
];

export function BuyerBlueprintPage({ page, context }: { page: BuyerPage; context?: string }) {
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <BuyerHeader activeSection={page.section} />
      <div className="mx-auto w-full max-w-[var(--layout-page-max)] px-[var(--layout-gutter)] py-6">
        {renderPage(page.key, context)}
      </div>
    </main>
  );
}

function BuyerHeader({ activeSection }: { activeSection: string }) {
  return (
    <header className="sticky top-0 z-[var(--z-header)] border-b-2 border-[var(--color-brand-space)] bg-white">
      <div className="mx-auto flex min-h-[var(--size-header-height)] w-full max-w-[var(--layout-page-max)] items-center justify-between gap-4 px-[var(--layout-gutter)]">
        <Link className="flex items-center gap-3 font-bold" href="/">
          <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] bg-[var(--color-brand-space)] text-white">P3</span>
          <span>Social Seller</span>
        </Link>
        <nav aria-label="구매자 메뉴" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.section;

            return (
              <Link
                className={`flex items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-sm font-semibold ${
                  active ? "bg-[var(--color-brand-amber)] text-[var(--color-brand-space)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link className="rounded-[var(--radius-control)] bg-[var(--color-brand-space)] px-4 py-2 text-sm font-bold text-white" href="/auth">
          로그인
        </Link>
      </div>
    </header>
  );
}

function renderPage(key: PageKey, context?: string) {
  switch (key) {
    case "home":
      return <HomeScreen />;
    case "stores":
      return <StoresScreen />;
    case "storeDetail":
      return <StoreDetailScreen context={context} />;
    case "productDetail":
      return <ProductDetailScreen context={context} />;
    case "inquiries":
      return <InquiriesScreen />;
    case "inquiryDetail":
      return <InquiryDetailScreen context={context} />;
    case "orders":
      return <OrdersScreen />;
    case "orderDetail":
      return <OrderDetailScreen context={context} />;
    case "payments":
      return <PaymentsScreen />;
    case "paymentDetail":
      return <PaymentDetailScreen context={context} />;
    case "notifications":
      return <NotificationsScreen />;
    case "me":
      return <AccountScreen />;
    case "settings":
      return <SettingsScreen />;
    case "auth":
    case "role":
    case "authCallback":
    case "authSync":
      return <AuthScreen mode={key} />;
    case "forbidden":
      return <SystemScreen tone="warning" title="접근 권한이 없습니다" body="현재 계정의 역할 또는 대상 소유권으로는 이 화면을 열 수 없습니다." />;
    case "error":
      return <SystemScreen tone="danger" title="작업을 이어갈 수 없습니다" body="일시 오류일 수 있습니다. 재시도하거나 안전한 목록 화면으로 이동하세요." />;
    default:
      return null;
  }
}

function HomeScreen() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.8fr]">
      <section className="overflow-hidden rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-[var(--color-brand-sky)]">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_300px]">
          <div>
            <p className="font-bold text-[var(--color-brand-space)]">주문제작 케이크 상담부터 결제까지</p>
            <h1 className="mt-3 text-4xl font-bold leading-[var(--line-height-tight)]">원하는 디자인을 보내고, 확인서를 받고, 결제까지 한 흐름으로 진행합니다.</h1>
            <div className="mt-6 flex max-w-xl items-center gap-2 rounded-[var(--radius-control)] border-2 border-[var(--color-brand-space)] bg-white p-2">
              <Search className="ml-2 h-5 w-5" />
              <span className="flex-1 text-sm font-semibold text-[var(--color-text-secondary)]">지역, 스토어명, 상품을 검색하세요</span>
              <Link className="rounded-[var(--radius-control)] bg-[var(--color-brand-orange)] px-4 py-2 text-sm font-bold text-white" href="/stores">
                검색
              </Link>
            </div>
          </div>
          <Image alt="레터링 케이크" className="h-full min-h-64 w-full rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] object-cover" height={900} src={products[0].image} width={900} />
        </div>
      </section>

      <StatusRail />

      <section className="lg:col-span-2">
        <SectionHeader eyebrow="오늘 살펴볼 스토어" title="픽업 가능 시간과 상담 응답 속도를 먼저 확인하세요" />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {stores.map((store) => (
            <StoreCard key={store.slug} store={store} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StoresScreen() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section>
        <SectionHeader eyebrow="Store Search" title="스토어 목록" description="커스텀 질문, 픽업 시간, 응답 속도가 주문 가능성을 좌우합니다." />
        <Toolbar chips={["성수", "망원", "연남", "이번 주 픽업", "참고 이미지 가능"]} />
        <div className="mt-4 grid gap-4">
          {stores.map((store) => (
            <StoreRow key={store.slug} store={store} />
          ))}
        </div>
      </section>
      <SidePanel title="탐색 체크포인트">
        <CheckItem text="문의 전 픽업 가능 요일 확인" />
        <CheckItem text="상품별 필수 질문과 참고 이미지 준비" />
        <CheckItem text="견적 확정 전 결제하지 않기" />
      </SidePanel>
    </div>
  );
}

function StoreDetailScreen({ context }: { context?: string }) {
  const store = stores[0];
  const storeProducts = products.filter((product) => product.storeSlug === store.slug);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="overflow-hidden rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white">
        <Image alt={store.name} className="h-72 w-full object-cover" height={500} src={store.image} width={900} />
        <div className="p-6">
          <p className="text-sm font-bold text-[var(--color-brand-sea)]">{context ?? store.slug}</p>
          <h1 className="mt-2 text-3xl font-bold">{store.name}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-[var(--color-text-secondary)]">{store.shortIntro}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {store.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </div>
      </section>
      <SidePanel title="스토어 정보">
        <InfoLine label="지역" value={store.area} />
        <InfoLine label="픽업" value={store.pickup} />
        <InfoLine label="응답" value={store.response} />
        <ButtonLink href="/inquiries/sample-inquiry">일반 문의 시작</ButtonLink>
      </SidePanel>
      <section className="lg:col-span-2">
        <SectionHeader eyebrow="Products" title="상담 가능한 상품" />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {storeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductDetailScreen({ context }: { context?: string }) {
  const product = products[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="grid overflow-hidden rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white lg:grid-cols-[1fr_0.85fr]">
        <Image alt={product.name} className="h-full min-h-[480px] w-full object-cover" height={900} src={product.image} width={900} />
        <div className="p-6">
          <p className="text-sm font-bold text-[var(--color-brand-sea)]">{context ?? product.id}</p>
          <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
          <p className="mt-3 text-2xl font-bold text-[var(--color-brand-orange)]">{product.price}</p>
          <p className="mt-3 leading-7 text-[var(--color-text-secondary)]">사진과 문구가 중요한 주문제작 상품입니다. 문의 단계에서 디자인 의도와 날짜를 먼저 확인합니다.</p>
          <div className="mt-5 grid gap-2">
            {product.questions.map((question) => (
              <CheckItem key={question} text={question} />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <ButtonLink href="/inquiries/sample-inquiry">상품 문의하기</ButtonLink>
            <ButtonLink href="/stores/blue-dawn-cake" variant="secondary">스토어 보기</ButtonLink>
          </div>
        </div>
      </section>
      <OrderFormPreview />
    </div>
  );
}

function InquiriesScreen() {
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <ConversationList />
      <section className="rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white p-6">
        <SectionHeader eyebrow="상담 흐름" title="문의는 상품 맥락과 주문서 상태를 같이 보여줍니다" />
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <StepCard title="1. 요청 정리" body="픽업일, 문구, 참고 이미지를 상담 초반에 모읍니다." />
          <StepCard title="2. 확인서 승인" body="판매자가 가격과 제작 내용을 확정해 보냅니다." />
          <StepCard title="3. 결제 요청" body="확인서 기준으로 Point3 결제 요청을 시작합니다." />
        </div>
      </section>
    </div>
  );
}

function InquiryDetailScreen({ context }: { context?: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr_340px]">
      <ConversationList compact />
      <section className="rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white">
        <div className="border-b-2 border-[var(--color-brand-space)] p-4">
          <p className="text-sm font-bold text-[var(--color-brand-sea)]">{context ?? "inquiryId = sample-inquiry"}</p>
          <h1 className="text-xl font-bold">블루던 케이크 상담</h1>
        </div>
        <div className="grid gap-3 p-4">
          <ProductMiniCard />
          {inquiryMessages.map((message) => (
            <MessageBubble key={`${message.time}-${message.text}`} message={message} />
          ))}
        </div>
        <div className="flex items-center gap-2 border-t-2 border-[var(--color-brand-space)] p-3">
          <button className="grid h-10 w-10 place-items-center rounded-[var(--radius-control)] border-2 border-[var(--color-brand-space)]" type="button">
            <ImageIcon className="h-5 w-5" />
          </button>
          <div className="flex-1 rounded-[var(--radius-control)] border-2 border-[var(--color-brand-space)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">메시지를 입력하세요</div>
          <button className="grid h-10 w-10 place-items-center rounded-[var(--radius-control)] bg-[var(--color-brand-orange)] text-white" type="button">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </section>
      <InquirySideRail />
    </div>
  );
}

function OrdersScreen() {
  return (
    <ListScreen
      eyebrow="Orders"
      title="주문 목록"
      rows={[
        ["P3-2026-0614-001", "제작 확정", "블루던 케이크", "픽업 6월 14일 16:30"],
        ["P3-2026-0529-004", "픽업 완료", "스카이 페이스트리 룸", "후기 작성 가능"],
      ]}
      detailHref="/orders/sample-order"
    />
  );
}

function OrderDetailScreen({ context }: { context?: string }) {
  return (
    <DetailScreen
      eyebrow="Order Detail"
      title="주문 상세"
      context={context ?? "orderId = sample-order"}
      primaryHref="/inquiries/sample-inquiry"
      primaryLabel="연결 상담 보기"
      secondaryHref="/payments/sample-payment"
      secondaryLabel="결제 상세"
    />
  );
}

function PaymentsScreen() {
  return (
    <ListScreen
      eyebrow="Payments"
      title="결제 내역"
      rows={[
        ["PAY-9J22", "승인 성공", "78,000원", "주문 P3-2026-0614-001"],
        ["PAY-7K10", "결과 확인 필요", "42,000원", "판매자 확인 대기"],
      ]}
      detailHref="/payments/sample-payment"
    />
  );
}

function PaymentDetailScreen({ context }: { context?: string }) {
  return (
    <DetailScreen
      eyebrow="Payment Detail"
      title="결제 상세"
      context={context ?? "paymentId = sample-payment"}
      primaryHref="/orders/sample-order"
      primaryLabel="주문 상세 보기"
      secondaryHref="/inquiries/sample-inquiry"
      secondaryLabel="상담으로 이동"
    />
  );
}

function NotificationsScreen() {
  return (
    <section>
      <SectionHeader eyebrow="Notifications" title="알림" description="상담 답변, 확인서, 결제, 주문 상태가 대상 화면으로 이어집니다." />
      <div className="mt-4 grid gap-3">
        {[
          ["확인서 도착", "블루던 케이크가 주문확인서를 보냈습니다.", "/inquiries/sample-inquiry"],
          ["결제 승인 성공", "78,000원 결제가 승인되었습니다.", "/payments/sample-payment"],
          ["픽업 하루 전", "내일 16:30 픽업 예정입니다.", "/orders/sample-order"],
        ].map(([title, body, href]) => (
          <Link className="flex items-center justify-between rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white p-4" href={href} key={title}>
            <span>
              <strong>{title}</strong>
              <span className="mt-1 block text-sm text-[var(--color-text-secondary)]">{body}</span>
            </span>
            <ChevronRight className="h-5 w-5" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function AccountScreen() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white p-6">
        <SectionHeader eyebrow="Account" title="김민서님" description="구매자 계정 정보와 최근 진행 흐름입니다." />
        <div className="mt-5 grid gap-3">
          <InfoLine label="이메일" value="buyer@example.com" />
          <InfoLine label="역할" value="BUYER" />
          <InfoLine label="최근 상담" value="블루던 케이크 미니 레터링" />
        </div>
      </section>
      <SidePanel title="계정 작업">
        <ButtonLink href="/me/settings">설정 열기</ButtonLink>
        <ButtonLink href="/auth" variant="secondary">로그아웃 플로우</ButtonLink>
      </SidePanel>
    </div>
  );
}

function SettingsScreen() {
  return (
    <section className="rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white p-6">
      <SectionHeader eyebrow="Settings" title="설정" description="알림 채널과 계정 작업이 들어갈 자리입니다." />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <StepCard title="상담 알림" body="새 메시지와 확인서 도착 알림을 받습니다." />
        <StepCard title="주문 알림" body="결제 결과와 픽업 리마인더를 받습니다." />
      </div>
    </section>
  );
}

function AuthScreen({ mode }: { mode: PageKey }) {
  const titleByMode: Record<string, string> = {
    auth: "계속하려면 로그인하세요",
    role: "가입 역할을 선택하세요",
    authCallback: "인증 결과를 확인하는 중입니다",
    authSync: "회원 정보를 동기화하는 중입니다",
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-[var(--color-brand-sky)] p-6">
        <p className="font-bold text-[var(--color-brand-space)]">Cognito + 역할 동기화</p>
        <h1 className="mt-3 text-3xl font-bold">{titleByMode[mode]}</h1>
        <div className="mt-6 grid gap-3">
          <ButtonLink href="/auth/sync">이메일로 계속하기</ButtonLink>
          <ButtonLink href="/auth/role" variant="secondary">가입 역할 선택</ButtonLink>
          <ButtonLink href="/" variant="ghost">공개 홈으로 돌아가기</ButtonLink>
        </div>
      </section>
      <SidePanel title="인증 후 이동">
        <CheckItem text="BUYER: 현재 도메인 구매자 홈" />
        <CheckItem text="SELLER: seller 도메인" />
        <CheckItem text="OPERATOR: admin 도메인" />
      </SidePanel>
    </div>
  );
}

function SystemScreen({ title, body, tone }: { title: string; body: string; tone: "warning" | "danger" }) {
  return (
    <section className={`rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] p-6 ${tone === "danger" ? "bg-[var(--color-brand-orange)] text-white" : "bg-[var(--color-brand-amber)]"}`}>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-3 max-w-2xl font-semibold">{body}</p>
      <div className="mt-6 flex gap-2">
        <ButtonLink href="/">홈</ButtonLink>
        <ButtonLink href="/auth" variant="secondary">로그인</ButtonLink>
      </div>
    </section>
  );
}

function StatusRail() {
  return (
    <aside className="rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">내 진행 상황</h2>
        <Badge>buyer-active</Badge>
      </div>
      <div className="mt-4 grid gap-3">
        <StatusItem icon={MessageCircle} label="상담" value="블루던 케이크 답변 도착" href="/inquiries/sample-inquiry" />
        <StatusItem icon={CheckCircle2} label="확인서" value="승인 대기" href="/inquiries/sample-inquiry" />
        <StatusItem icon={CreditCard} label="결제" value="78,000원 요청됨" href="/payments/sample-payment" />
      </div>
    </aside>
  );
}

function StoreCard({ store }: { store: StoreSummary }) {
  return (
    <Link className="overflow-hidden rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white" href={`/stores/${store.slug}`}>
      <Image alt={store.name} className="h-40 w-full object-cover" height={360} src={store.image} width={640} />
      <div className="p-4">
        <h3 className="text-lg font-bold">{store.name}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{store.shortIntro}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {store.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}

function StoreRow({ store }: { store: StoreSummary }) {
  return (
    <Link className="grid gap-4 rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white p-4 md:grid-cols-[180px_1fr_170px]" href={`/stores/${store.slug}`}>
      <Image alt={store.name} className="h-36 w-full rounded-[var(--radius-control)] object-cover" height={320} src={store.image} width={420} />
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-bold">{store.name}</h3>
          <Badge>{store.area}</Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{store.shortIntro}</p>
      </div>
      <div className="grid content-center gap-2 text-sm font-semibold">
        <span>{store.pickup}</span>
        <span>{store.response}</span>
      </div>
    </Link>
  );
}

function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link className="overflow-hidden rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white" href={`/stores/${product.storeSlug}/products/${product.id}`}>
      <Image alt={product.name} className="h-44 w-full object-cover" height={360} src={product.image} width={640} />
      <div className="p-4">
        <h3 className="font-bold">{product.name}</h3>
        <p className="mt-2 text-sm font-bold text-[var(--color-brand-orange)]">{product.price}</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{product.leadTime}</p>
      </div>
    </Link>
  );
}

function ConversationList({ compact = false }: { compact?: boolean }) {
  return (
    <aside className="rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white p-4">
      <h2 className="font-bold">상담함</h2>
      <div className="mt-3 grid gap-2">
        {[
          ["블루던 케이크", "확인서를 보내드릴게요.", "읽지 않음 1"],
          ["스카이 페이스트리 룸", "알러지 정보를 확인했습니다.", "종료"],
          ["앰버슈가 스튜디오", "행사 로고 파일을 보내주세요.", "진행 중"],
        ].slice(0, compact ? 2 : 3).map(([title, body, status]) => (
          <Link className="rounded-[var(--radius-control)] border-2 border-[var(--color-border)] p-3 hover:border-[var(--color-brand-orange)]" href="/inquiries/sample-inquiry" key={title}>
            <strong>{title}</strong>
            <span className="mt-1 block text-sm text-[var(--color-text-secondary)]">{body}</span>
            <span className="mt-2 inline-block text-xs font-bold text-[var(--color-brand-orange)]">{status}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}

function InquirySideRail() {
  return (
    <aside className="grid gap-4">
      <OrderFormPreview />
      <SidePanel title="주문확인서">
        {orderItems.map((item) => (
          <InfoLine key={item.label} label={item.label} value={item.value} />
        ))}
        <ButtonLink href="/payments/sample-payment">78,000원 결제하기</ButtonLink>
        <ButtonLink href="/orders/sample-order" variant="secondary">주문 상세 보기</ButtonLink>
      </SidePanel>
    </aside>
  );
}

function OrderFormPreview() {
  return (
    <SidePanel title="주문서 미리보기">
      <InfoLine label="필요일" value="2026-06-14" />
      <InfoLine label="픽업 시간" value="16:30" />
      <InfoLine label="인원" value="4-6명" />
      <InfoLine label="참고 이미지" value="2장 첨부 예정" />
      <CheckItem text="제출 전 상담 내용과 가격은 확정되지 않습니다." />
    </SidePanel>
  );
}

function ProductMiniCard() {
  return (
    <div className="grid grid-cols-[72px_1fr] gap-3 rounded-[var(--radius-control)] border-2 border-[var(--color-brand-space)] bg-[var(--color-surface-subtle)] p-3">
      <Image alt={products[0].name} className="h-16 w-16 rounded-[var(--radius-control)] object-cover" height={96} src={products[0].image} width={96} />
      <div>
        <strong>{products[0].name}</strong>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{products[0].price} · {products[0].leadTime}</p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: { from: string; text: string; time: string } }) {
  const mine = message.from === "buyer";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] p-3 ${mine ? "bg-[var(--color-brand-amber)]" : "bg-[var(--color-surface-muted)]"}`}>
        <p className="text-sm font-semibold leading-6">{message.text}</p>
        <span className="mt-2 block text-xs font-bold text-[var(--color-text-secondary)]">{message.time}</span>
      </div>
    </div>
  );
}

function ListScreen({ eyebrow, title, rows, detailHref }: { eyebrow: string; title: string; rows: string[][]; detailHref: string }) {
  return (
    <section>
      <SectionHeader eyebrow={eyebrow} title={title} />
      <Toolbar chips={["전체", "진행 중", "완료", "결과 확인 필요"]} />
      <div className="mt-4 overflow-hidden rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white">
        {rows.map((row) => (
          <Link className="grid gap-2 border-b-2 border-[var(--color-border-subtle)] p-4 last:border-b-0 md:grid-cols-[1.1fr_0.8fr_1fr_1fr]" href={detailHref} key={row.join("-")}>
            {row.map((cell) => (
              <span className="text-sm font-semibold" key={cell}>{cell}</span>
            ))}
          </Link>
        ))}
      </div>
    </section>
  );
}

function DetailScreen({ eyebrow, title, context, primaryHref, primaryLabel, secondaryHref, secondaryLabel }: { eyebrow: string; title: string; context: string; primaryHref: string; primaryLabel: string; secondaryHref: string; secondaryLabel: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white p-6">
        <SectionHeader eyebrow={eyebrow} title={title} description={context} />
        <div className="mt-5 grid gap-3">
          {orderItems.map((item) => (
            <InfoLine key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </section>
      <SidePanel title="다음 작업">
        <ButtonLink href={primaryHref}>{primaryLabel}</ButtonLink>
        <ButtonLink href={secondaryHref} variant="secondary">{secondaryLabel}</ButtonLink>
      </SidePanel>
    </div>
  );
}

function Toolbar({ chips }: { chips: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2 rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white p-3">
      {chips.map((chip) => (
        <button className="rounded-[var(--radius-control)] border-2 border-[var(--color-brand-space)] px-3 py-2 text-sm font-bold hover:bg-[var(--color-brand-amber)]" key={chip} type="button">
          {chip}
        </button>
      ))}
    </div>
  );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <header>
      <p className="text-sm font-bold text-[var(--color-brand-sea)]">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-bold leading-[var(--line-height-tight)]">{title}</h1>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p> : null}
    </header>
  );
}

function SidePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </aside>
  );
}

function StepCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-[var(--color-surface-muted)] p-4">
      <h3 className="font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{body}</p>
    </article>
  );
}

function StatusItem({ icon: Icon, label, value, href }: { icon: typeof MessageCircle; label: string; value: string; href: string }) {
  return (
    <Link className="flex items-center gap-3 rounded-[var(--radius-control)] border-2 border-[var(--color-border)] p-3 hover:border-[var(--color-brand-orange)]" href={href}>
      <Icon className="h-5 w-5 text-[var(--color-brand-orange)]" />
      <span>
        <span className="block text-xs font-bold text-[var(--color-text-secondary)]">{label}</span>
        <strong className="text-sm">{value}</strong>
      </span>
    </Link>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-sm font-semibold">
      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[var(--color-brand-sea)]" />
      <span>{text}</span>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b-2 border-[var(--color-border-subtle)] pb-2 text-sm last:border-b-0">
      <span className="font-bold text-[var(--color-text-secondary)]">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-[var(--radius-round)] bg-[var(--color-brand-amber)] px-3 py-1 text-xs font-bold text-[var(--color-brand-space)]">{children}</span>;
}

function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" }) {
  const className =
    variant === "primary"
      ? "bg-[var(--color-brand-space)] text-white"
      : variant === "secondary"
        ? "bg-[var(--color-brand-amber)] text-[var(--color-brand-space)]"
        : "border-2 border-[var(--color-brand-space)] bg-white text-[var(--color-brand-space)]";

  return (
    <Link className={`inline-flex min-h-[var(--size-control-height)] items-center justify-center rounded-[var(--radius-control)] px-4 py-2 text-sm font-bold ${className}`} href={href}>
      {children}
    </Link>
  );
}
