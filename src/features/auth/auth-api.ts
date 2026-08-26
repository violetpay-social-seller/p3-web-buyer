import type { UserRole, UserStatus } from "@/entities/user/types";
import { apiFetch } from "@/shared/api/client";
import { apiEndpoints } from "@/shared/api/endpoints";
import { getStoredIdToken } from "@/shared/auth/token-store";

export type AuthNextRoute = "ROLE_SELECTION" | "BUYER_HOME" | "SELLER_HOME" | "ADMIN_HOME" | string;

export type AuthSyncResponse = {
  registered: boolean;
  registrationRequired: boolean;
  role: UserRole | null;
  status: UserStatus | null;
  nextRoute: AuthNextRoute;
};

export type AssetUploadResponse = {
  assetId: string;
  originalUrl?: string;
  variants?: {
    thumbnailUrl?: string;
    mediumUrl?: string;
    largeUrl?: string;
    alt: string;
  };
  status: "PROCESSING" | "READY" | "FAILED";
};

export function syncCurrentUser() {
  return apiFetch<AuthSyncResponse>(apiEndpoints.auth.syncMe, {
    method: "POST",
    headers: getIdTokenAuthHeaders(),
  });
}

export function completeRegistration(role: UserRole) {
  return apiFetch<AuthSyncResponse>(apiEndpoints.auth.registerMe, {
    method: "POST",
    headers: getIdTokenAuthHeaders(),
    body: JSON.stringify({ role: role.toLowerCase() }),
  });
}

export function uploadAsset(file: File) {
  const formData = new FormData();
  formData.set("file", file);

  return apiFetch<AssetUploadResponse>(apiEndpoints.assets.upload, {
    method: "POST",
    body: formData,
  });
}

function getIdTokenAuthHeaders() {
  const idToken = getStoredIdToken();

  if (!idToken) {
    throw new Error("Cognito ID Token이 없습니다. 다시 로그인해주세요.");
  }

  return {
    Authorization: `Bearer ${idToken}`,
  };
}
