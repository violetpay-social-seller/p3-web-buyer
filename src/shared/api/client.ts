import { env } from "@/shared/config/env";

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
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
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
