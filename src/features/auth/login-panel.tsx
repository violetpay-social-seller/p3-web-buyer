"use client";

import { useState } from "react";
import { getAuthConfigStatus, startHostedUiLogin, type CognitoIdentityProvider } from "@/shared/auth/cognito";

export function LoginPanel() {
  const [error, setError] = useState("");
  const configStatus = getAuthConfigStatus();

  async function handleLogin(identityProvider: CognitoIdentityProvider) {
    setError("");

    try {
      await startHostedUiLogin("/", { identityProvider });
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Failed to start login";
      setError(message);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[520px] content-center gap-6 px-[var(--layout-gutter)] py-8">
        <section className="rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-[var(--color-brand-sky)] p-6">
          <p className="font-bold text-[var(--color-brand-space)]">wihada</p>
          <h1 className="mt-3 text-3xl font-bold leading-[var(--line-height-tight)]">로그인</h1>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-[var(--color-text-secondary)]">
            주문서 작성과 문의 진행을 위해 카카오 또는 Google 계정으로 로그인해주세요.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              className="min-h-[var(--size-control-height)] rounded-[var(--radius-control)] bg-[var(--color-brand-space)] px-5 text-sm font-bold text-white disabled:opacity-[var(--opacity-disabled)]"
              disabled={!configStatus.ready}
              onClick={() => handleLogin("Kakao")}
              type="button"
            >
              카카오로 로그인
            </button>
            <button
              className="min-h-[var(--size-control-height)] rounded-[var(--radius-control)] border-2 border-[var(--color-brand-space)] bg-white px-5 text-sm font-bold text-[var(--color-brand-space)] disabled:opacity-[var(--opacity-disabled)]"
              disabled={!configStatus.ready}
              onClick={() => handleLogin("Google")}
              type="button"
            >
              Google로 로그인
            </button>
          </div>

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
      </div>
    </main>
  );
}
