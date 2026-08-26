import Image from "next/image";
import Link from "next/link";

const asset = (name: string) => `/figma-flowmap/${name}`;

export function ConfirmationDetailPage({ confirmationId, inquiryId }: { confirmationId: string; inquiryId: string }) {
  return (
    <main className="min-h-screen bg-[var(--figma-color-surface-subtle)] text-[var(--figma-color-text-primary)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[var(--figma-container-lg)] place-items-center lg:grid-cols-[1fr_390px_1fr] lg:gap-8 lg:px-8">
        <aside className="hidden w-full max-w-[320px] lg:block">
          <p className="text-label-md text-[var(--figma-color-text-secondary)]">confirmation</p>
          <h1 className="mt-2 text-display-sm">주문확인서 상세</h1>
          <p className="mt-4 text-body-sm text-[var(--figma-color-text-secondary)]">상세 진입 후 결제 CTA가 활성화되는 구매자 확인 단계입니다.</p>
        </aside>
        <div className="relative h-screen w-full max-w-[390px] overflow-hidden bg-[var(--figma-color-surface-subtle)] shadow-[var(--figma-shadow-dropdown)] lg:h-[844px] lg:rounded-[28px]">
          <ConfirmationPhone inquiryId={inquiryId} />
        </div>
        <aside className="hidden w-full max-w-[320px] lg:block">
          <nav className="grid gap-2">
            <Link className="rounded-[var(--figma-radius-sm)] bg-white px-4 py-3 text-label-md shadow-[var(--figma-shadow-card)]" href={`/inquiries/${encodeURIComponent(inquiryId)}?state=final-price`}>
              상담 채팅방
            </Link>
            <Link className="rounded-[var(--figma-radius-sm)] bg-white px-4 py-3 text-label-md shadow-[var(--figma-shadow-card)]" href={`/inquiries/${encodeURIComponent(inquiryId)}/confirmations/${encodeURIComponent(confirmationId)}`}>
              주문확인서
            </Link>
            <Link className="rounded-[var(--figma-radius-sm)] bg-white px-4 py-3 text-label-md shadow-[var(--figma-shadow-card)]" href="/payments/sample-payment?state=checkout">
              결제 시작
            </Link>
          </nav>
        </aside>
      </div>
    </main>
  );
}

function StatusBar() {
  return (
    <div className="flex h-[46.977px] items-center justify-between bg-white pb-[12.409px] pl-[23.932px] pr-[23.045px] pt-[15.955px]">
      <span className="w-[47.864px] text-center text-[13.36px] font-semibold leading-[17.284px] tracking-[-0.3616px]">9:41</span>
      <Image alt="" height={12} src={asset("statusbar.svg")} width={69} />
    </div>
  );
}

function ConfirmationPhone({ inquiryId }: { inquiryId: string }) {
  return (
    <div className="flex h-full flex-col bg-[var(--figma-color-surface-subtle)]">
      <StatusBar />
      <header className="flex h-14 shrink-0 items-center justify-between bg-white px-[var(--figma-space-md)]">
        <Link aria-label="뒤로" className="grid h-6 w-6 place-items-center" href={`/inquiries/${encodeURIComponent(inquiryId)}?state=final-price`}>
          <Image alt="" height={24} src={asset("chat-back.svg")} width={24} />
        </Link>
        <h1 className="text-display-sm">주문 확인서</h1>
        <Link aria-label="메뉴" className="grid h-6 w-6 place-items-center" href="/me">
          <Image alt="" height={24} src={asset("chat-menu.svg")} width={24} />
        </Link>
      </header>
      <div className="flex-1 overflow-y-auto px-[var(--figma-space-md)] py-[var(--figma-space-md)]">
        <section className="rounded-[var(--figma-radius-sm)] bg-white px-[var(--figma-space-md)] py-[var(--figma-space-lg)] shadow-[var(--figma-shadow-card)]">
          <div className="mb-[var(--figma-space-xl)] flex items-center justify-between">
            <h2 className="text-display-sm">8월 19일 수요일</h2>
            <p className="text-display-sm">오후 3:30</p>
          </div>
          <div className="grid gap-[var(--figma-space-xs)] text-body-sm">
            <InfoLine label="주문자" value="이동후" />
            <InfoLine label="연락처" value="010-0000-0000" />
          </div>
          <Divider />
          <ConfirmationRow label="디자인" price="+ 45000원 ~" value="2호 (18cm/높이 7cm)" />
          <ConfirmationRow label="모양" price="+ 3000원" value="사각" />
          <ConfirmationRow label="케이크 맛" price="+ 3000원" value="초코시트 + 생크림" />
          <ConfirmationRow label="포장 방식" price="+ 4000원" value="보냉백 포장" />
          <ConfirmationRow label="케이크 디자인" value="생화 + 12000원 (신가 반영)" />
          <ConfirmationRow label="기타 요청사항" value="잘 부탁드립니다:)" />
          <Divider />
          <div className="flex items-center justify-between py-[var(--figma-space-md)]">
            <h2 className="text-display-sm">최종 가격</h2>
            <p className="text-[28px] font-bold leading-[36px] tracking-[-0.02em]">64,000원</p>
          </div>
        </section>
      </div>
      <div className="shrink-0 bg-[var(--figma-color-surface-subtle)] px-[var(--figma-space-md)] pb-[var(--figma-space-lg)] pt-[var(--figma-space-md)]">
        <div className="flex gap-[var(--figma-space-sm)]">
          <Link className="flex h-11 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-default)] bg-white text-label-md" href={`/inquiries/${encodeURIComponent(inquiryId)}?state=revision-requested`}>
            수정 요청
          </Link>
          <Link className="flex h-11 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] text-label-md text-white" href="/payments/sample-payment?state=checkout">
            바로 결제
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="mr-[var(--figma-space-sm)] text-[var(--figma-color-text-tertiary)]">{label}</span>
      <span>{value}</span>
    </p>
  );
}

function ConfirmationRow({ label, price, value }: { label: string; price?: string; value: string }) {
  return (
    <div className="py-[var(--figma-space-sm)]">
      <p className="text-body-sm text-[var(--figma-color-text-tertiary)]">{label}</p>
      <div className="mt-2 flex items-start justify-between gap-[var(--figma-space-md)]">
        <p className="min-w-0 text-heading-md">{value}</p>
        {price ? <p className="shrink-0 text-label-md">{price}</p> : null}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="my-[var(--figma-space-lg)] h-px bg-[var(--figma-color-border-subtle)]" />;
}
