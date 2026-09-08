import { Suspense } from "react";
import { CallbackPanel } from "@/features/auth/callback-panel";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackPanel />
    </Suspense>
  );
}
