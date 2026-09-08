"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { syncCurrentUser } from "@/features/auth/auth-api";
import { consumeReturnTo } from "@/shared/auth/cognito";
import { BuyerFullScreenLoading } from "@/shared/ui/buyer-full-screen-loading";

export function SyncPanel() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const user = await syncCurrentUser();

        if (cancelled) {
          return;
        }

        const nextPath = consumeReturnTo();

        if (user.role && user.role !== "BUYER") {
          setErrorMessage("구매자 계정으로 로그인해주세요.");
          return;
        }

        if (user.registrationRequired || user.nextRoute === "ROLE_SELECTION") {
          router.replace(buildRegistrationPath(nextPath));
          return;
        }

        router.replace(nextPath === "/auth/sync" ? "/" : nextPath);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : "회원 정보를 확인하지 못했습니다.";
        setErrorMessage(message);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!errorMessage) {
    return <BuyerFullScreenLoading label="회원 정보를 확인하는 중입니다." />;
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-white px-[16px] text-[var(--figma-color-text-primary)]">
      <section className="w-full max-w-[358px]">
        <h1 className="text-heading-lg">회원 확인 실패</h1>
        <p className="mt-[8px] break-all text-body-sm text-[var(--figma-color-text-secondary)]">{errorMessage}</p>
      </section>
    </main>
  );
}

function buildRegistrationPath(nextPath: string) {
  const safeNextPath = getSafeNextPath(nextPath);
  const params = new URLSearchParams();

  if (safeNextPath !== "/") {
    params.set("next", safeNextPath);
  }

  if (safeNextPath.startsWith("/order-form-drafts/") && safeNextPath.endsWith("/consume")) {
    params.set("mode", "buyer-draft");
  }

  const query = params.toString();
  return query ? `/auth/role?${query}` : "/auth/role";
}

function getSafeNextPath(value: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value === "/auth/sync") {
    return "/";
  }

  return value;
}
