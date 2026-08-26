"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type OrderDraftStep = "pickup-date" | "pickup-time" | "pickup-selected" | "form";

type OrderDraftFlowPageProps = {
  initialStep?: string;
  slug: string;
};

const asset = (name: string) => `/figma-flowmap/${name}`;
const pickupDateLabel = "8월 19일 수요일";
const defaultTime = "오후 3:00";
const availableTimes = ["오후 1:30", "오후 2:00", "오후 2:30", "오후 3:00", "오후 3:30", "오후 4:00", "오후 4:30"];

const formGroups = [
  {
    key: "size",
    title: "디자인",
    required: true,
    options: [
      ["1호 (15cm/높이 7cm)", "+ 38000원 ~"],
      ["2호 (18cm/높이 7cm)", "+ 45000원 ~"],
      ["3호 (21cm/높이 7cm)", "+ 56000원 ~"],
      ["4호 (24cm/높이 7cm)", "+ 56000원 ~"],
      ["5호 ~ 7호, 2단, 3단", "문의필요"],
    ],
  },
  {
    key: "shape",
    title: "모양",
    required: true,
    options: [
      ["원형", "+ 0원"],
      ["사각", "+ 3000원"],
      ["하트", "+ 3000원"],
    ],
  },
  {
    key: "flavor",
    title: "케이크 맛",
    required: true,
    options: [
      ["바닐라시트 + 생크림", "+ 0원"],
      ["초코시트 + 생크림", "+ 3000원"],
      ["발로나 초코볼", "+ 2000원 ~"],
    ],
  },
  {
    key: "package",
    title: "포장 방식",
    required: true,
    options: [
      ["기본 상자", "+ 0원"],
      ["보냉백 포장", "+ 4000원"],
    ],
  },
] as const;

export function OrderDraftFlowPage({ initialStep, slug }: OrderDraftFlowPageProps) {
  const normalizedInitialStep = normalizeStep(initialStep);
  const [step, setStepState] = useState<OrderDraftStep>(normalizedInitialStep);
  const [selectedDate, setSelectedDate] = useState(normalizedInitialStep === "pickup-date" ? 0 : 19);
  const [selectedTime, setSelectedTime] = useState(normalizedInitialStep === "pickup-selected" || normalizedInitialStep === "form" ? defaultTime : "");
  const [showAbort, setShowAbort] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({
    size: "2호 (18cm/높이 7cm)",
    shape: "사각",
    flavor: "초코시트 + 생크림",
    package: "보냉백 포장",
  });

  const orderPath = useMemo(() => `/stores/${encodeURIComponent(slug)}/order-form-drafts/new`, [slug]);
  const formReady = formGroups.every((group) => !group.required || answers[group.key]);

  function setStep(nextStep: OrderDraftStep) {
    setStepState(nextStep);
    window.history.replaceState(null, "", `${orderPath}?step=${nextStep}`);
  }

  function handleTimeSelect(time: string) {
    setSelectedTime(time);
    setStep("pickup-selected");
  }

  return (
    <PhoneLayout
      railTitle={step === "form" ? "주문서 작성" : "주문서/픽업 선택"}
      railLinks={[
        ["날짜 선택", `${orderPath}?step=pickup-date`],
        ["시간 선택", `${orderPath}?step=pickup-time`],
        ["선택 완료", `${orderPath}?step=pickup-selected`],
        ["주문서 작성", `${orderPath}?step=form`],
        ["상담 채팅방", "/inquiries/sample-inquiry?state=final-price"],
      ]}
    >
      {step === "form" ? (
        <OrderFormScreen answers={answers} formReady={formReady} onAbort={() => setShowAbort(true)} onAnswer={setAnswers} onEditPickup={() => setStep("pickup-selected")} />
      ) : (
        <PickupSheetScreen
          onAbort={() => setShowAbort(true)}
          onDateSelect={setSelectedDate}
          onNext={() => {
            if (step === "pickup-date" && selectedDate) setStep("pickup-time");
            if (step === "pickup-selected" && selectedTime) setStep("form");
          }}
          onTimeSelect={handleTimeSelect}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          step={step}
        />
      )}
      {showAbort ? <AbortOrderDialog onContinue={() => setShowAbort(false)} /> : null}
    </PhoneLayout>
  );
}

function normalizeStep(value?: string): OrderDraftStep {
  if (value === "pickup-time" || value === "pickup-selected" || value === "form") return value;
  return "pickup-date";
}

function PhoneLayout({ children, railLinks, railTitle }: { children: ReactNode; railLinks: Array<[string, string]>; railTitle: string }) {
  return (
    <main className="min-h-screen bg-[var(--figma-color-surface-subtle)] text-[var(--figma-color-text-primary)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[var(--figma-container-lg)] place-items-center lg:grid-cols-[1fr_390px_1fr] lg:gap-8 lg:px-8">
        <aside className="hidden w-full max-w-[320px] lg:block">
          <p className="text-label-md text-[var(--figma-color-text-secondary)]">order draft</p>
          <h1 className="mt-2 text-display-sm">{railTitle}</h1>
          <p className="mt-4 text-body-sm text-[var(--figma-color-text-secondary)]">갤러리 이미지 기반 주문 문의의 draft 단계입니다.</p>
        </aside>
        <div className="relative h-screen w-full max-w-[390px] overflow-hidden bg-[var(--figma-color-surface-background)] shadow-[var(--figma-shadow-dropdown)] lg:h-[844px] lg:rounded-[28px]">
          {children}
        </div>
        <aside className="hidden w-full max-w-[320px] lg:block">
          <nav className="grid gap-2">
            {railLinks.map(([label, href]) => (
              <Link className="rounded-[var(--figma-radius-sm)] bg-white px-4 py-3 text-label-md shadow-[var(--figma-shadow-card)]" href={href} key={href}>
                {label}
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </main>
  );
}

function StatusBar() {
  return (
    <div className="flex h-[46.977px] items-center justify-between pb-[12.409px] pl-[23.932px] pr-[23.045px] pt-[15.955px]">
      <span className="w-[47.864px] text-center text-[13.36px] font-semibold leading-[17.284px] tracking-[-0.3616px]">9:41</span>
      <Image alt="" height={12} src={asset("statusbar.svg")} width={69} />
    </div>
  );
}

function PickupSheetScreen({
  onAbort,
  onDateSelect,
  onNext,
  onTimeSelect,
  selectedDate,
  selectedTime,
  step,
}: {
  onAbort: () => void;
  onDateSelect: (date: number) => void;
  onNext: () => void;
  onTimeSelect: (time: string) => void;
  selectedDate: number;
  selectedTime: string;
  step: OrderDraftStep;
}) {
  const showTimes = step !== "pickup-date";
  const nextEnabled = (step === "pickup-date" && selectedDate > 0) || (step === "pickup-selected" && selectedTime);

  return (
    <div className="relative h-full bg-[var(--figma-color-surface-scrim)]">
      <div className="absolute inset-x-0 bottom-0 rounded-t-[24px] bg-white px-10 pb-[22px] pt-9">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-heading-lg">픽업 시간을 선택해주세요</h1>
          <button aria-label="주문 중단" className="grid h-8 w-8 place-items-center text-[28px] leading-none text-[var(--figma-color-icon-default)]" onClick={onAbort} type="button">
            ×
          </button>
        </div>
        <div className="mb-5 flex items-center justify-center gap-8">
          <span className="text-[30px] font-light text-[var(--figma-color-text-disabled)]">‹</span>
          <p className="text-heading-md">2026년 8월</p>
          <span className="text-[30px] font-light text-[var(--figma-color-text-tertiary)]">›</span>
        </div>
        <CalendarGrid onDateSelect={onDateSelect} selectedDate={selectedDate} />
        {showTimes ? (
          <div className="mt-4">
            <p className="mb-4 text-heading-md">{pickupDateLabel}</p>
            <div className="grid grid-cols-4 gap-x-2 gap-y-2">
              {["오후 12:00", "오후 12:30", "오후 1:00"].map((time) => (
                <button className="h-[38px] rounded-[12px] text-label-sm text-[var(--figma-color-text-disabled)]" disabled key={time} type="button">
                  {time}
                </button>
              ))}
              {availableTimes.map((time) => (
                <button
                  className={`h-[38px] rounded-[12px] border text-label-sm ${selectedTime === time ? "border-[var(--figma-color-action-primary)] bg-[var(--figma-color-action-primary)] text-white" : "border-[var(--figma-color-border-default)] bg-white text-[var(--figma-color-text-primary)]"}`}
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
        <div className="mt-8 flex gap-2">
          <Link className="flex h-11 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-default)] text-label-md" href="/inquiries/sample-inquiry">
            상담하기
          </Link>
          <button
            className={`h-11 flex-1 rounded-[var(--figma-radius-md)] text-label-md text-white ${nextEnabled ? "bg-[var(--figma-color-action-primary)]" : "bg-[var(--figma-color-action-disabled)]"}`}
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

function CalendarGrid({ onDateSelect, selectedDate }: { onDateSelect: (date: number) => void; selectedDate: number }) {
  const cells = [...Array.from({ length: 6 }, () => 0), ...Array.from({ length: 31 }, (_, index) => index + 1)];

  return (
    <div>
      <div className="grid grid-cols-7 pb-4 text-center text-label-sm">
        {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
          <span className={index === 0 ? "text-[var(--figma-color-status-error)]" : "text-[var(--figma-color-text-secondary)]"} key={day}>
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-4 text-center text-[16px] leading-[36px]">
        {cells.map((day, index) => {
          if (!day) {
            return <span className="mx-auto h-[52px] w-[52px]" key={`blank-${index}`} />;
          }

          const disabled = day < 18 || day === 24 || day === 31;
          const sunday = index % 7 === 0;
          const selectable = !disabled;
          const selected = selectedDate === day;

          return (
            <button
              className={`mx-auto h-[52px] w-[52px] rounded-[12px] ${selected ? "bg-[var(--figma-color-action-primary)] font-semibold text-white" : ""} ${disabled ? "text-[var(--figma-color-text-disabled)]" : sunday ? "text-[var(--figma-color-status-error)]" : "text-[var(--figma-color-text-primary)]"}`}
              disabled={!selectable}
              key={day}
              onClick={() => onDateSelect(day)}
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

function AbortOrderDialog({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-[rgb(18_22_28/88%)] px-14">
      <div className="w-full rounded-[24px] bg-white px-4 pb-4 pt-8 text-center shadow-[var(--figma-shadow-dropdown)]">
        <h2 className="text-heading-lg">주문을 중단하시겠어요?</h2>
        <p className="mt-1 text-label-sm text-[var(--figma-color-text-tertiary)]">지금까지 정보가 모두 사라져요</p>
        <div className="mt-6 flex gap-2">
          <Link className="flex h-11 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-default)] text-label-md text-[var(--figma-color-text-tertiary)]" href="/stores/faucet">
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
  onAbort,
  onAnswer,
  onEditPickup,
}: {
  answers: Record<string, string>;
  formReady: boolean;
  onAbort: () => void;
  onAnswer: (answers: Record<string, string>) => void;
  onEditPickup: () => void;
}) {
  const router = useRouter();

  return (
    <div className="relative flex h-full flex-col bg-[var(--figma-color-surface-subtle)]">
      <StatusBar />
      <header className="flex h-14 shrink-0 items-center justify-between bg-white">
        <button aria-label="뒤로" className="grid h-12 w-12 place-items-center text-[28px] text-[var(--figma-color-icon-default)]" onClick={onEditPickup} type="button">
          ‹
        </button>
        <h1 className="text-display-sm">주문서</h1>
        <span className="h-12 w-12" />
      </header>
      <div className="flex-1 overflow-y-auto px-[var(--figma-space-md)] py-[var(--figma-space-md)]">
        <Link className="mb-5 flex h-11 items-center justify-between rounded-[var(--figma-radius-sm)] bg-white px-[var(--figma-space-md)] text-label-md shadow-[var(--figma-shadow-card)]" href="/stores/faucet/order-form-drafts/new?step=pickup-selected">
          공지사항
          <span className="text-[24px] text-[var(--figma-color-icon-default)]">›</span>
        </Link>
        <section className="rounded-[var(--figma-radius-sm)] bg-white px-[var(--figma-space-md)] pb-[var(--figma-space-xl)] pt-[var(--figma-space-lg)] shadow-[var(--figma-shadow-card)]">
          <h2 className="mb-[var(--figma-space-md)] text-heading-md">픽업 일시</h2>
          <button className="mb-[var(--figma-space-xl)] flex h-[52px] w-full items-center justify-between rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] px-[var(--figma-space-md)] text-label-md text-[var(--figma-color-text-tertiary)]" onClick={onEditPickup} type="button">
            <span>{pickupDateLabel}</span>
            <span>{defaultTime}</span>
            <span className="text-[22px]">↗</span>
          </button>
          {formGroups.map((group) => (
            <fieldset className="mb-[var(--figma-space-xl)]" key={group.key}>
              <legend className="mb-[var(--figma-space-md)] text-heading-md">
                {group.required ? <span className="mr-1 text-[var(--figma-color-status-error)]">*</span> : null}
                {group.title}
              </legend>
              <div className="grid gap-[var(--figma-space-md)]">
                {group.options.map(([label, price]) => (
                  <label className="flex items-center justify-between gap-[var(--figma-space-md)] text-label-md" key={label}>
                    <span className="flex min-w-0 items-center gap-[var(--figma-space-sm)]">
                      <input checked={answers[group.key] === label} className="h-4 w-4 accent-[var(--figma-color-action-primary)]" name={group.key} onChange={() => onAnswer({ ...answers, [group.key]: label })} type="radio" />
                      <span className="min-w-0">{label}</span>
                    </span>
                    <span className="shrink-0">{price}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <fieldset className="mb-[var(--figma-space-xl)]">
            <legend className="mb-[var(--figma-space-md)] text-heading-md">케이크 디자인</legend>
            <OptionWithInput label="케이크 판 레터링 추가" price="+ 1000원" placeholder="레터링 내용 / 컬러 색을 적어주세요" />
            <OptionWithInput label="케이크 앞면 레터링 추가" price="+ 2000원" placeholder="레터링 내용 / 컬러 색을 적어주세요" />
            <OptionWithInput label="케이크 색상 변경" price="+ 3000원" placeholder="컬러 색을 적어주세요" />
            <UploadOption label="사진 첨부" />
          </fieldset>
          <fieldset>
            <legend className="mb-[var(--figma-space-md)] text-heading-md">기타 요청사항</legend>
            <input className="h-11 w-full rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] px-[var(--figma-space-md)] text-label-md outline-none placeholder:text-[var(--figma-color-text-tertiary)]" placeholder="레터링 내용 / 컬러 색을 적어주세요" />
            <p className="mt-2 text-label-xs text-[var(--figma-color-text-tertiary)]">* 요청사항에 미작성시 반영되지 않습니다</p>
            <UploadOption label="사진첨부" />
          </fieldset>
        </section>
      </div>
      <div className="shrink-0 border-t border-[var(--figma-color-border-subtle)] bg-white px-[var(--figma-space-md)] pb-[var(--figma-space-lg)] pt-[var(--figma-space-md)]">
        <button
          className={`h-11 w-full rounded-[var(--figma-radius-md)] text-label-md text-white ${formReady ? "bg-[var(--figma-color-action-primary)]" : "bg-[var(--figma-color-action-disabled)]"}`}
          disabled={!formReady}
          onClick={() => router.push("/inquiries/sample-inquiry?state=final-price&submitted=1")}
          type="button"
        >
          다음
        </button>
        <button className="mt-[var(--figma-space-md)] w-full text-label-sm text-[var(--figma-color-text-tertiary)]" onClick={onAbort} type="button">
          다음에 주문할게요
        </button>
      </div>
    </div>
  );
}

function OptionWithInput({ label, placeholder, price }: { label: string; placeholder: string; price: string }) {
  return (
    <div className="mb-[var(--figma-space-md)]">
      <label className="flex items-center justify-between gap-[var(--figma-space-md)] text-label-md">
        <span className="flex items-center gap-[var(--figma-space-sm)]">
          <input className="h-4 w-4 accent-[var(--figma-color-action-primary)]" type="checkbox" />
          {label}
        </span>
        <span>{price}</span>
      </label>
      <input className="mt-2 h-11 w-full rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] px-[var(--figma-space-md)] text-label-md outline-none placeholder:text-[var(--figma-color-text-tertiary)]" placeholder={placeholder} />
      <p className="mt-2 text-label-xs text-[var(--figma-color-text-tertiary)]">* 기본에 맞게 제작해서 보내주세요</p>
    </div>
  );
}

function UploadOption({ label }: { label: string }) {
  return (
    <div className="mt-[var(--figma-space-md)]">
      <label className="flex items-center justify-between gap-[var(--figma-space-md)] text-label-md">
        <span className="flex items-center gap-[var(--figma-space-sm)]">
          <input className="h-4 w-4 accent-[var(--figma-color-action-primary)]" type="checkbox" />
          {label}
        </span>
        <span>문의필요</span>
      </label>
      <button aria-label="사진 업로드" className="mt-3 grid h-20 w-20 place-items-center rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] text-[28px] text-[var(--figma-color-text-tertiary)]" type="button">
        ↥
      </button>
      <p className="mt-2 text-label-xs text-[var(--figma-color-text-tertiary)]">* 기본에 맞게 제작해서 보내주세요</p>
    </div>
  );
}
