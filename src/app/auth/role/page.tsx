import { Suspense } from "react";
import { RoleRegistrationPanel } from "@/features/auth/role-registration-panel";

export default function AuthRolePage() {
  return (
    <Suspense fallback={null}>
      <RoleRegistrationPanel />
    </Suspense>
  );
}
