"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const asset = (name: string) => `/figma-flowmap/${name}`;

export function NoticeAgreementControls({
  agreeHref,
  initialAgreed,
  nextHref,
  storePath,
  unagreeHref,
}: {
  agreeHref: string;
  initialAgreed: boolean;
  nextHref: string;
  storePath: string;
  unagreeHref: string;
}) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(initialAgreed);

  function toggleAgreement() {
    const nextAgreed = !agreed;
    setAgreed(nextAgreed);
    router.replace(nextAgreed ? agreeHref : unagreeHref, { scroll: false });
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[358px] rounded-[var(--figma-radius-sm)] bg-[var(--figma-color-surface-subtle)] py-[var(--figma-space-lg)]" data-ui="notice-agree-area">
        <button className="flex h-6 w-full items-center text-left" data-ui="notice-agree-row" onClick={toggleAgreement} type="button">
          {agreed ? (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden" data-ui="notice-checkbox">
              <Image alt="" height={20} src={asset("checkbox-active.svg")} width={20} />
            </span>
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden" data-ui="notice-checkbox">
              <Image alt="" height={48} src={asset("checkbox-false.svg")} width={48} />
            </span>
          )}
          <span className={`text-heading-md ${agreed ? "text-[var(--figma-color-text-primary)]" : "text-[var(--figma-color-text-tertiary)]"}`}>약관 전체동의</span>
        </button>
        <p className="mt-[var(--figma-space-sm)] px-[var(--figma-space-md)] text-label-xs text-[var(--figma-color-text-tertiary)]">* 전체 동의하에 케이크 주문이 가능합니다</p>
      </div>
      <div className="shrink-0 flex flex-col gap-[13px] bg-white px-[var(--figma-space-md)] pb-[34px] pt-[var(--figma-space-md)]">
        {agreed ? (
          <Link className="flex h-[52px] items-center justify-center rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] text-heading-md text-white" href={nextHref}>
            다음
          </Link>
        ) : (
          <button className="h-[52px] rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-disabled)] text-heading-md text-[var(--figma-color-text-disabled)]" disabled type="button">
            다음
          </button>
        )}
        <Link className="text-center text-label-sm text-[var(--figma-color-text-tertiary)]" href={storePath}>
          다음에 주문할게요
        </Link>
      </div>
    </>
  );
}
