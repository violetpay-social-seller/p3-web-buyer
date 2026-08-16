export type StoredAuthTokens = {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  tokenType: string;
  expiresAt: number;
};

const TOKEN_STORAGE_KEY = "p3.buyer.auth.tokens";

export function getStoredTokens(): StoredAuthTokens | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredAuthTokens;
  } catch {
    clearStoredTokens();
    return null;
  }
}

export function getStoredAccessToken(): string | null {
  const tokens = getStoredTokens();

  if (!tokens) {
    return null;
  }

  if (tokens.expiresAt <= Date.now()) {
    clearStoredTokens();
    return null;
  }

  return tokens.accessToken;
}

export function getStoredIdToken(): string | null {
  const tokens = getStoredTokens();

  if (!tokens?.idToken) {
    return null;
  }

  if (tokens.expiresAt <= Date.now()) {
    clearStoredTokens();
    return null;
  }

  return tokens.idToken;
}

export function storeTokens(tokens: StoredAuthTokens) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
}

export function clearStoredTokens() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}
