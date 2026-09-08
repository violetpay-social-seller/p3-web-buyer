"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeAuthorizationCode } from "@/shared/auth/cognito";
import { BuyerFullScreenLoading } from "@/shared/ui/buyer-full-screen-loading";

export function CallbackPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        await exchangeAuthorizationCode(new URLSearchParams(searchParams.toString()));

        if (cancelled) {
          return;
        }

        router.replace("/auth/sync");
      } catch (error) {
        if (cancelled) {
          return;
        }

        const errorMessage = error instanceof Error ? error.message : "Cognito callback failed";
        setErrorMessage(errorMessage);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (!errorMessage) {
    return <BuyerFullScreenLoading label="로그인을 처리하는 중입니다." />;
  }

  return <AuthTransitError message={errorMessage} title="로그인 처리 실패" />;
}

function AuthTransitError({ title, message }: { title: string; message: string }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-white px-[16px] text-[var(--figma-color-text-primary)]">
      <section className="w-full max-w-[358px]">
        <h1 className="text-heading-lg">{title}</h1>
        <p className="mt-[8px] break-all text-body-sm text-[var(--figma-color-text-secondary)]">{message}</p>
      </section>
    </main>
  );
}
