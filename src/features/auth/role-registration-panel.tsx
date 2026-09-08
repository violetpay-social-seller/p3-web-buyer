"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completeRegistration } from "@/features/auth/auth-api";
import { getStoredTokens, type StoredAuthTokens } from "@/shared/auth/token-store";

type RegistrationState = "idle" | "processing" | "error";

const MAX_PHONE_LENGTH = 100;

export function RoleRegistrationPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get("next"));
  const backHref = nextPath === "/" ? "/auth" : `/auth?next=${encodeURIComponent(nextPath)}`;
  const [tokens] = useState<StoredAuthTokens | null>(() => getStoredTokens());
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState<RegistrationState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRegister() {
    const trimmedPhoneNumber = phoneNumber.trim();

    if (!trimmedPhoneNumber) {
      setStatus("error");
      setErrorMessage("전화번호를 입력해주세요.");
      return;
    }

    if (!tokens?.idToken) {
      setStatus("error");
      setErrorMessage("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    setStatus("processing");
    setErrorMessage("");

    try {
      await completeRegistration("BUYER", trimmedPhoneNumber);
      router.replace(nextPath);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "회원가입을 완료하지 못했습니다.");
    }
  }

  return (
    <main className="min-h-dvh overflow-x-clip bg-white text-[var(--figma-color-text-primary)]">
      <section
        className="relative mx-auto flex min-h-dvh w-full max-w-[var(--figma-container-lg)] flex-col bg-white"
        data-auth-role-screen
        data-figma-frame="flowmap/도메인 회원가입/구매자 로그인"
        data-figma-node-id="977:11284"
      >
        <header className="grid h-[56px] shrink-0 grid-cols-[1fr_auto_1fr] items-center" data-figma-node-id="977:11287">
          <div className="flex min-w-0 items-center">
            <Link aria-label="뒤로가기" className="grid size-[44px] place-items-center" href={backHref}>
              <Image alt="" aria-hidden height={44} priority src="/figma-flowmap/chevron-left.svg" width={44} />
            </Link>
          </div>
          <h1 className="text-display-sm text-[var(--figma-color-text-primary)]" data-figma-node-id="I977:11287;563:29674">
            회원가입
          </h1>
          <div aria-hidden className="h-[48px] min-w-0" />
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-hidden px-[16px] pb-[16px] pt-[24px]" data-figma-node-id="977:11288">
          <label className="flex w-full flex-col gap-[8px]" data-figma-node-id="977:11292">
            <span className="flex items-center gap-[4px]">
              <span className="text-[15px] font-semibold leading-[20px] tracking-[-0.02em] text-[var(--figma-color-text-error)]" data-figma-node-id="996:11656">
                *
              </span>
              <span className="text-heading-md text-[var(--figma-color-text-primary)]" data-figma-node-id="996:11657">
                전화번호
              </span>
            </span>
            <span className="flex flex-col items-end gap-[4px]">
              <input
                aria-label="전화번호"
                autoComplete="tel"
                className="h-[44px] w-full rounded-[12px] border-0 bg-[var(--figma-color-surface-subtle)] px-[16px] py-[8px] text-body-md text-[var(--figma-color-text-primary)] outline-none placeholder:leading-[24px] placeholder:text-[var(--figma-color-text-unavailable)]"
                data-figma-node-id="I977:11294;1160:9845"
                disabled={status === "processing"}
                inputMode="tel"
                maxLength={MAX_PHONE_LENGTH}
                onChange={(event) => {
                  setPhoneNumber(event.target.value);
                  if (errorMessage) setErrorMessage("");
                  if (status === "error") setStatus("idle");
                }}
                placeholder="ex:"
                value={phoneNumber}
              />
              <span className="text-label-xs text-[var(--figma-color-text-unavailable)]" data-figma-node-id="I977:11294;1160:10040">
                {phoneNumber.length}/{MAX_PHONE_LENGTH}
              </span>
            </span>
          </label>

          {errorMessage ? <p className="text-label-sm text-[var(--figma-color-text-error)]">{errorMessage}</p> : null}
        </div>

        <footer className="flex shrink-0 flex-col items-center gap-[13px] px-[16px] pb-[calc(34px+env(safe-area-inset-bottom,0px))] pt-[16px]" data-figma-node-id="977:11301">
          <button
            className="flex h-[52px] w-full items-center justify-center rounded-[16px] bg-[var(--figma-color-action-primary)] px-[24px] text-heading-md text-white disabled:opacity-[var(--opacity-disabled)]"
            data-figma-node-id="I977:11301;421:14109"
            disabled={status === "processing"}
            onClick={handleRegister}
            type="button"
          >
            {status === "processing" ? "처리 중" : "신청하기"}
          </button>
        </footer>
      </section>
    </main>
  );
}

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}
