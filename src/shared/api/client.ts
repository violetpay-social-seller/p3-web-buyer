import { env } from "@/shared/config/env";
import { getStoredAccessToken } from "@/shared/auth/token-store";

type ApiErrorPayload = {
  code: string;
  message: string;
  fieldErrors?: { field: string; message: string }[];
};

type ApiResponse<T> =
  | { success: true; data: T; requestId?: string }
  | { success: false; error: ApiErrorPayload; requestId?: string };

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: ApiErrorPayload,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const accessToken = getStoredAccessToken();
  const headers = new Headers(init.headers);
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  const body = (await response.json().catch(() => undefined)) as ApiResponse<T> | undefined;

  if (!response.ok || body?.success === false) {
    throw new ApiError(
      body?.success === false ? body.error.message : response.statusText,
      response.status,
      body?.success === false ? body.error : undefined,
      body?.requestId,
    );
  }

  if (!body || body.success !== true) {
    throw new ApiError("Invalid API response", response.status);
  }

  return body.data;
}
