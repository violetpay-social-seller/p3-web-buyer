"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type AuthSyncResponse, syncCurrentUser } from "@/features/auth/auth-api";
import { consumeReturnTo } from "@/shared/auth/cognito";
import { getStoredTokens, type StoredAuthTokens } from "@/shared/auth/token-store";

type SyncState =
  | { status: "processing"; message: string; user?: undefined }
  | { status: "success"; message: string; user: AuthSyncResponse }
  | { status: "error"; message: string; user?: undefined };

export function SyncPanel() {
  const router = useRouter();
  const [state, setState] = useState<SyncState>({
    status: "processing",
    message: "/auth/me/sync 호출 중입니다.",
  });
  const [returnTo, setReturnTo] = useState("/");
  const [tokens] = useState<StoredAuthTokens | null>(() => getStoredTokens());
  const idTokenPreview = tokens?.idToken ? `${tokens.idToken.slice(0, 18)}...${tokens.idToken.slice(-10)}` : "없음";

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const user = await syncCurrentUser();

        if (cancelled) {
          return;
        }

        console.info("[auth-debug] POST /auth/me/sync success", user);
        setReturnTo(consumeReturnTo());

        if (user.registrationRequired || user.nextRoute === "ROLE_SELECTION") {
          setState({
            status: "success",
            message: "가입 역할 선택이 필요합니다. /auth/role로 이동합니다.",
            user,
          });
          router.replace("/auth/role");
          return;
        }

        setState({
          status: "success",
          message: "/auth/me/sync 200 응답을 받았습니다.",
          user,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : "/auth/me/sync failed";
        console.error("[auth-debug] POST /auth/me/sync failed", error);
        setState({ status: "error", message });
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-[var(--layout-gutter)] py-8 text-[var(--color-text-primary)]">
      <section className="mx-auto grid max-w-4xl gap-5 rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white p-6">
        <p className="text-sm font-bold text-[var(--color-brand-sea)]">{state.status}</p>
        <h1 className="text-2xl font-bold">회원 동기화</h1>
        <p className="break-all text-sm font-semibold leading-6 text-[var(--color-text-secondary)]">{state.message}</p>

        <div className="grid gap-3 rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] p-4 text-sm font-semibold">
          <InfoLine label="Access Token" value={tokens?.accessToken ? `${tokens.accessToken.slice(0, 18)}...${tokens.accessToken.slice(-10)}` : "없음"} />
          <InfoLine label="ID Token" value={idTokenPreview} />
          <InfoLine label="회원 동기화 Authorization" value={tokens?.idToken ? "ID Token으로 Bearer 첨부" : "ID Token 없음"} />
        </div>

        {state.status === "success" ? (
          <pre className="overflow-x-auto rounded-[var(--radius-control)] bg-[var(--color-brand-space)] p-4 text-xs font-semibold text-white">
            {JSON.stringify(state.user, null, 2)}
          </pre>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Link className="rounded-[var(--radius-control)] bg-[var(--color-brand-space)] px-4 py-2 text-sm font-bold text-white" href={state.status === "success" ? returnTo : "/"}>
            홈으로 이동
          </Link>
          <Link className="rounded-[var(--radius-control)] border-2 border-[var(--color-brand-space)] px-4 py-2 text-sm font-bold text-[var(--color-brand-space)]" href="/auth/role">
            역할 등록
          </Link>
          <Link className="rounded-[var(--radius-control)] bg-[var(--color-brand-amber)] px-4 py-2 text-sm font-bold text-[var(--color-brand-space)]" href="/auth">
            토큰/Asset 테스트
          </Link>
        </div>
      </section>
    </main>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <span className="break-all">{value}</span>
    </div>
  );
}
