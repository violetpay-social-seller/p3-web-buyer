"use client";

import { useState } from "react";
import Link from "next/link";
import { completeRegistration, type AuthSyncResponse } from "@/features/auth/auth-api";
import type { UserRole } from "@/entities/user/types";
import { getStoredTokens, type StoredAuthTokens } from "@/shared/auth/token-store";

type RegistrationState =
  | { status: "idle"; message: string; result?: undefined }
  | { status: "processing"; message: string; result?: undefined }
  | { status: "success"; message: string; result: AuthSyncResponse }
  | { status: "error"; message: string; result?: undefined };

export function RoleRegistrationPanel() {
  const [tokens] = useState<StoredAuthTokens | null>(() => getStoredTokens());
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [state, setState] = useState<RegistrationState>({
    status: "idle",
    message: "buyer 또는 seller 역할로 회원 등록을 진행할 수 있습니다.",
  });
  const idTokenPreview = tokens?.idToken ? `${tokens.idToken.slice(0, 18)}...${tokens.idToken.slice(-10)}` : "없음";

  async function handleRegister(role: UserRole) {
    setSelectedRole(role);
    setState({
      status: "processing",
      message: "POST /auth/me/registration 호출 중입니다.",
    });

    try {
      const result = await completeRegistration(role);
      const requestRole = role.toLowerCase();

      console.info("[auth-debug] POST /auth/me/registration success", result);
      setState({
        status: "success",
        message: `${requestRole} 역할 등록이 완료되었습니다.`,
        result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";

      console.error("[auth-debug] POST /auth/me/registration failed", error);
      setState({
        status: "error",
        message,
      });
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-[var(--layout-gutter)] py-8 text-[var(--color-text-primary)]">
      <section className="mx-auto grid max-w-3xl gap-5 rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white p-6">
        <p className="text-sm font-bold text-[var(--color-brand-sea)]">{state.status}</p>
        <h1 className="text-2xl font-bold">가입 역할 선택</h1>
        <p className="text-sm font-semibold leading-6 text-[var(--color-text-secondary)]">{state.message}</p>

        <div className="grid gap-3 rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] p-4 text-sm font-semibold">
          <InfoLine label="등록 API" value="POST /auth/me/registration" />
          <InfoLine label="요청 역할" value={selectedRole ? selectedRole.toLowerCase() : "선택 전"} />
          <InfoLine label="Authorization" value={tokens?.idToken ? "ID Token으로 Bearer 첨부" : "ID Token 없음"} />
          <InfoLine label="ID Token" value={idTokenPreview} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            className="min-h-[var(--size-control-height)] rounded-[var(--radius-control)] bg-[var(--color-brand-space)] px-5 text-sm font-bold text-white disabled:opacity-[var(--opacity-disabled)]"
            disabled={state.status === "processing" || !tokens?.idToken}
            onClick={() => handleRegister("BUYER")}
            type="button"
          >
            buyer로 등록
          </button>
          <button
            className="min-h-[var(--size-control-height)] rounded-[var(--radius-control)] bg-[var(--color-brand-amber)] px-5 text-sm font-bold text-[var(--color-brand-space)] disabled:opacity-[var(--opacity-disabled)]"
            disabled={state.status === "processing" || !tokens?.idToken}
            onClick={() => handleRegister("SELLER")}
            type="button"
          >
            seller로 등록
          </button>
        </div>

        {!tokens?.idToken ? (
          <p className="text-sm font-bold text-[var(--color-brand-orange)]">ID Token이 없습니다. 다시 로그인해주세요.</p>
        ) : null}

        {state.status === "success" ? (
          <pre className="overflow-x-auto rounded-[var(--radius-control)] bg-[var(--color-brand-space)] p-4 text-xs font-semibold text-white">
            {JSON.stringify(state.result, null, 2)}
          </pre>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Link className="rounded-[var(--radius-control)] border-2 border-[var(--color-brand-space)] px-4 py-2 text-sm font-bold text-[var(--color-brand-space)]" href="/auth/sync">
            회원 동기화 재확인
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
