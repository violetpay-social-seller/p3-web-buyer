"use client";

import { useState } from "react";
import { getAuthConfigStatus, startHostedUiLogin } from "@/shared/auth/cognito";
import { AuthStatusCard } from "@/features/auth/auth-status-card";

export function LoginPanel() {
  const [error, setError] = useState("");
  const configStatus = getAuthConfigStatus();

  async function handleLogin() {
    setError("");

    try {
      await startHostedUiLogin("/");
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Failed to start login";
      setError(message);
      console.error("[auth-debug] Cognito login start failed", caughtError);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[var(--layout-page-max)] content-center gap-6 px-[var(--layout-gutter)] py-8 lg:grid-cols-[1fr_420px]">
        <section className="rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-[var(--color-brand-sky)] p-6">
          <p className="font-bold text-[var(--color-brand-space)]">Cognito Hosted UI</p>
          <h1 className="mt-3 text-3xl font-bold leading-[var(--line-height-tight)]">백엔드 API 테스트용 구매자 로그인</h1>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-[var(--color-text-secondary)]">
            로그인 후 callback에서 Access Token을 저장하고, `/auth/me/sync`를 호출합니다. 이후 `apiFetch` 요청에는 Bearer Token이 자동으로 붙습니다.
          </p>

          <button
            className="mt-6 min-h-[var(--size-control-height)] rounded-[var(--radius-control)] bg-[var(--color-brand-space)] px-5 text-sm font-bold text-white disabled:opacity-[var(--opacity-disabled)]"
            disabled={!configStatus.ready}
            onClick={handleLogin}
            type="button"
          >
            Cognito로 로그인
          </button>

          {!configStatus.ready ? (
            <div className="mt-5 rounded-[var(--radius-control)] border-2 border-[var(--color-brand-space)] bg-white p-4">
              <p className="font-bold">필수 환경변수가 비어 있습니다.</p>
              <ul className="mt-2 grid gap-1 text-sm font-semibold text-[var(--color-text-secondary)]">
                {configStatus.missingKeys.map((key) => (
                  <li key={key}>{key}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {error ? <p className="mt-4 text-sm font-bold text-[var(--color-brand-orange)]">{error}</p> : null}
        </section>

        <AuthStatusCard />
      </div>
    </main>
  );
}
