import { Suspense } from "react";
import { CallbackPanel } from "@/features/auth/callback-panel";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <CallbackPanel />
    </Suspense>
  );
}

function CallbackFallback() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] px-[var(--layout-gutter)] py-8 text-[var(--color-text-primary)]">
      <section className="mx-auto max-w-2xl rounded-[var(--radius-panel)] border-2 border-[var(--color-brand-space)] bg-white p-6">
        <p className="text-sm font-bold text-[var(--color-brand-sea)]">processing</p>
        <h1 className="mt-2 text-2xl font-bold">로그인 callback 준비 중</h1>
      </section>
    </main>
  );
}
