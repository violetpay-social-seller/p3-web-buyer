"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeAuthorizationCode } from "@/shared/auth/cognito";

type CallbackStatus = "processing" | "success" | "error";

export function CallbackPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>("processing");
  const [message, setMessage] = useState("Cognito authorization code를 토큰으로 교환하는 중입니다.");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const tokens = await exchangeAuthorizationCode(new URLSearchParams(searchParams.toString()));

        if (cancelled) {
          return;
        }

        setStatus("success");
        setMessage(`Access Token / ID Token 확보 완료: ${tokens.accessToken.slice(0, 18)}...`);
        console.info("[auth-debug] Cognito token exchange success", {
          accessToken: `${tokens.accessToken.slice(0, 18)}...${tokens.accessToken.slice(-10)}`,
          idToken: tokens.idToken ? `${tokens.idToken.slice(0, 18)}...${tokens.idToken.slice(-10)}` : "missing",
        });
        router.replace("/auth/sync");
      } catch (error) {
        if (cancelled) {
          return;
        }

        const errorMessage = error instanceof Error ? error.message : "Cognito callback failed";
        setStatus("error");
        setMessage(errorMessage);
        console.error("[auth-debug] Cognito callback failed", error);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return <AuthProgress title="로그인 callback 처리" message={message} status={status} />;
}

function AuthProgress({ title, message, status }: { title: string; message: string; status: CallbackStatus }) {
  return (
    <main className="min-h-screen bg-[var(--color-background)] px-[var(--layout-gutter)] py-8 text-[var(--color-text-primary)]">
      <section className="mx-auto max-w-2xl rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white p-6">
        <p className="text-sm font-bold text-[var(--color-brand-sea)]">{status}</p>
        <h1 className="mt-2 text-2xl font-bold">{title}</h1>
        <p className="mt-4 break-all text-sm font-semibold leading-6 text-[var(--color-text-secondary)]">{message}</p>
      </section>
    </main>
  );
}
