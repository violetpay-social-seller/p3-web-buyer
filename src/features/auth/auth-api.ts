import type { UserRole, UserStatus } from "@/entities/user/types";
import { apiFetch } from "@/shared/api/client";
import { apiEndpoints } from "@/shared/api/endpoints";
import { getValidIdToken } from "@/shared/auth/cognito";

type RegistrationRole = Extract<UserRole, "BUYER">;

export type AuthNextRoute = "ROLE_SELECTION" | "BUYER_HOME" | "SELLER_HOME" | "ADMIN_HOME" | string;

export type AuthSyncResponse = {
  registered: boolean;
  registrationRequired: boolean;
  role: UserRole | null;
  status: UserStatus | null;
  nextRoute: AuthNextRoute;
};

export async function syncCurrentUser() {
  return apiFetch<AuthSyncResponse>(apiEndpoints.auth.syncMe, {
    method: "POST",
    headers: await getIdTokenAuthHeaders(),
  });
}

export async function completeRegistration(role: RegistrationRole, phoneNumber: string) {
  return apiFetch<AuthSyncResponse>(apiEndpoints.auth.registerMe, {
    method: "POST",
    headers: await getIdTokenAuthHeaders(),
    body: JSON.stringify({ phoneNumber, role }),
  });
}

async function getIdTokenAuthHeaders() {
  const idToken = await getValidIdToken();

  if (!idToken) {
    throw new Error("Cognito ID Token이 없습니다. 다시 로그인해주세요.");
  }

  return {
    Authorization: `Bearer ${idToken}`,
  };
}
