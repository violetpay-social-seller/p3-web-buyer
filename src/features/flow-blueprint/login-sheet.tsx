"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { startHostedUiLogin, type CognitoIdentityProvider } from "@/shared/auth/cognito";

const asset = (name: string) => `/figma-flowmap/${name}`;

function IconAsset({ name, size = 48 }: { name: string; size?: number }) {
  return <Image alt="" height={size} src={asset(name)} width={size} />;
}

export function FlowLoginSheet({ returnTo = "/" }: { returnTo?: string }) {
  const [error, setError] = useState("");

  async function handleLogin(identityProvider: CognitoIdentityProvider) {
    setError("");

    try {
      await startHostedUiLogin(returnTo, { identityProvider });
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "로그인을 시작할 수 없습니다.";
      setError(message);
    }
  }

  return (
    <div className="flex h-full items-end bg-[var(--figma-color-surface-scrim)]">
      <section className="flex w-full flex-col items-center justify-end gap-[var(--figma-space-section-mobile)] rounded-t-[var(--figma-radius-lg)] bg-white px-[var(--figma-space-md)] pb-[var(--figma-space-lg)] pt-[var(--figma-space-xl)] shadow-[var(--figma-shadow-dropdown)]">
        <div className="flex w-full flex-col items-start gap-[var(--figma-space-sm)]">
          <div className="flex w-full items-start justify-between">
            <h1 className="text-display-lg">
              간편하게 로그인 후
              <br />
              이어서 주문이 가능해요!
            </h1>
            <Link aria-label="닫기" className="grid h-10 w-10 shrink-0 place-items-start justify-end overflow-visible" href="/">
              <IconAsset name="cancel.svg" />
            </Link>
          </div>
          <p className="text-label-md text-[var(--figma-color-text-secondary)]">3초면 주문가능!</p>
        </div>
        <div className="w-full">
          <button className="relative flex h-[52px] w-full items-center justify-center rounded-[var(--figma-radius-sm)] bg-[#ffe600] text-[16px] font-medium tracking-[-0.01em] text-black" onClick={() => handleLogin("Kakao")} type="button">
            <span className="absolute left-[18px] grid h-5 w-[22px] place-items-center">
              <IconAsset name="kakao-symbol.svg" size={22} />
            </span>
            카카오 로그인
          </button>
          <button className="relative mt-[var(--figma-space-sm)] flex h-[52px] w-full items-center justify-center rounded-[var(--figma-radius-sm)] border border-[#ccccd1] bg-white text-[16px] font-medium tracking-[-0.01em] text-black" onClick={() => handleLogin("Google")} type="button">
            <span className="absolute left-[15px] grid h-[30px] w-[30px] place-items-center">
              <IconAsset name="google-symbol.svg" size={30} />
            </span>
            Google 로그인
          </button>
          {error ? <p className="mt-[var(--figma-space-sm)] text-center text-label-sm text-[var(--figma-color-status-error)]">{error}</p> : null}
          <p className="mt-[var(--figma-space-md)] text-center text-label-sm text-[var(--figma-color-text-tertiary)]">이용약관과 개인정보 처리방침 확인</p>
        </div>
      </section>
    </div>
  );
}
