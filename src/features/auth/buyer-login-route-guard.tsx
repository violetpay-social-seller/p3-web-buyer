"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getValidAccessToken } from "@/shared/auth/cognito";
import { BuyerFullScreenLoading } from "@/shared/ui/buyer-full-screen-loading";

export function BuyerLoginRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isResolvingSession, setIsResolvingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function redirectAuthenticatedBuyer() {
      const accessToken = await getValidAccessToken().catch(() => null);

      if (cancelled) return;

      if (accessToken) {
        router.replace("/");
        return;
      }

      setIsResolvingSession(false);
    }

    void redirectAuthenticatedBuyer();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isResolvingSession) {
    return <BuyerFullScreenLoading label="로그인 상태를 확인하는 중입니다." />;
  }

  return children;
}
