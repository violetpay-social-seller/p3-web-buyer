"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getCurrentAccessToken } from "@/shared/auth/token-store";

export function SidebarLoginAction() {
  const loggedIn = useSyncExternalStore(subscribeToAuthStorage, getAuthSnapshot, getServerSnapshot);

  if (loggedIn) {
    return null;
  }

  return (
    <div className="mt-auto px-[var(--figma-space-lg)]">
      <Link className="flex h-[52px] items-center justify-center rounded-[var(--figma-radius-md)] bg-[var(--figma-color-action-primary)] text-heading-md text-white" href="/auth">
        로그인
      </Link>
    </div>
  );
}

function subscribeToAuthStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getAuthSnapshot() {
  return Boolean(getCurrentAccessToken());
}

function getServerSnapshot() {
  return true;
}
