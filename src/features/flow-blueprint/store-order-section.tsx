"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const asset = (name: string) => `/figma-flowmap/${name}`;
const bestImages = ["cake-01.png", "cake-04.png", "cake-05.png", "cake-08.png", "cake-05.png", "cake-08.png", "cake-05.png", "cake-08.png"].map(asset);

export function StoreOrderSection() {
  const [tab, setTab] = useState<"best" | "other">("best");
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  return (
    <section className="border-t-[8px] border-[var(--figma-color-surface-subtle)] px-[var(--figma-space-md)] pb-[var(--figma-space-lg)] pt-[56px]">
      <div className="mb-[var(--figma-space-lg)]">
        <h2 className="text-display-sm">주문하기</h2>
        <p className="mt-[var(--figma-space-xs)] text-body-sm text-[var(--figma-color-text-secondary)]">마음에 드는 디자인을 바로 주문하실 수 있어요</p>
      </div>
      <div className="mb-[var(--figma-space-lg)] flex gap-[var(--figma-space-sm)]">
        <button className={`h-9 min-w-[60px] rounded-[14px] px-[var(--figma-space-md)] text-label-md ${tab === "best" ? "bg-[var(--figma-color-action-primary)] text-white" : "bg-[var(--figma-color-surface-subtle)] text-[var(--figma-color-text-secondary)]"}`} onClick={() => setTab("best")} type="button">
          Best
        </button>
        <button className={`h-9 min-w-[66px] rounded-[14px] px-[var(--figma-space-md)] text-label-md ${tab === "other" ? "bg-[var(--figma-color-action-primary)] text-white" : "bg-[var(--figma-color-surface-subtle)] text-[var(--figma-color-text-secondary)]"}`} onClick={() => setTab("other")} type="button">
          Other
        </button>
      </div>
      {tab === "best" ? <BestOrderGrid /> : <OtherOrderUpload onOpenPermission={() => setPermissionOpen(true)} uploaded={uploaded} />}
      {tab === "other" ? (
        <div className="mt-[var(--figma-space-lg)]">
          {uploaded ? (
            <Link className="flex h-11 items-center justify-center rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] text-label-md text-white" href="/stores/faucet/order-form-drafts/new?step=pickup-date">
              다음
            </Link>
          ) : (
            <button className="h-11 w-full rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-disabled)] text-label-md text-white" disabled type="button">
              다음
            </button>
          )}
        </div>
      ) : null}
      {permissionOpen ? <PhotoPermissionDialog onBack={() => setPermissionOpen(false)} onSettings={() => { setPermissionOpen(false); setUploaded(true); }} /> : null}
    </section>
  );
}

function BestOrderGrid() {
  return (
    <>
      <div className="grid grid-cols-2 gap-1">
        {bestImages.map((src, index) => (
          <Link className="relative aspect-square overflow-hidden rounded-[var(--figma-radius-sm)]" href="/stores/faucet/products/cake-image" key={`${src}-${index}`}>
            <Image alt={`주문 가능한 케이크 ${index + 1}`} className="object-cover" fill sizes="177px" src={src} />
          </Link>
        ))}
      </div>
      <button className="mt-[var(--figma-space-sm)] flex h-[52px] w-full items-center justify-center gap-[var(--figma-space-md)] rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] text-heading-md text-[var(--figma-color-text-secondary)]" type="button">
        더보기
        <span className="text-[32px] font-light leading-none text-[var(--figma-color-text-tertiary)]">⌄</span>
      </button>
    </>
  );
}

function OtherOrderUpload({ onOpenPermission, uploaded }: { onOpenPermission: () => void; uploaded: boolean }) {
  return (
    <div>
      <button
        aria-label="사진 업로드"
        className={`relative grid w-full place-items-center overflow-hidden rounded-[var(--figma-radius-sm)] ${uploaded ? "aspect-[326/278] bg-white" : "h-[82px] bg-[var(--figma-color-surface-subtle)] text-[26px] text-[var(--figma-color-text-tertiary)]"}`}
        onClick={uploaded ? undefined : onOpenPermission}
        type="button"
      >
        {uploaded ? <Image alt="업로드한 참고 케이크" className="object-cover" fill sizes="326px" src={asset("cake-01.png")} /> : "↥"}
      </button>
      <p className="mt-[var(--figma-space-md)] text-label-xs leading-[18px] text-[var(--figma-color-text-secondary)]">
        wihada 플랫폼에서 확인이 어려운 케이크 디자인은 인스타에서 캡쳐해주시면 주문 도와드리고 있어요
      </p>
    </div>
  );
}

function PhotoPermissionDialog({ onBack, onSettings }: { onBack: () => void; onSettings: () => void }) {
  return (
    <div className="absolute inset-0 z-20 bg-[rgb(0_0_0/40%)] px-[var(--figma-space-md)] pt-[332px]">
      <div className="mx-auto w-full max-w-[326px] rounded-[24px] bg-white px-[var(--figma-space-md)] pb-[var(--figma-space-md)] pt-[32px] text-center shadow-[var(--figma-shadow-dropdown)]">
        <h3 className="text-heading-md">사진 접근 권한이 필요합니다</h3>
        <p className="mt-[var(--figma-space-xs)] text-label-sm text-[var(--figma-color-text-secondary)]">설정에서 사진 접근을 허용해주세요</p>
        <div className="mt-[var(--figma-space-lg)] flex gap-[var(--figma-space-sm)]">
          <button className="h-11 flex-1 rounded-[var(--figma-radius-md)] border border-[var(--figma-color-border-default)] bg-white text-label-md" onClick={onBack} type="button">
            돌아가기
          </button>
          <button className="h-11 flex-1 rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] text-label-md text-white" onClick={onSettings} type="button">
            설정으로 가기
          </button>
        </div>
      </div>
    </div>
  );
}
