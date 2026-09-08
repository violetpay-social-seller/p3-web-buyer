import { env } from "@/shared/config/env";
import { clearStoredTokens, getStoredTokens, storeTokens, type StoredAuthTokens } from "@/shared/auth/token-store";

const PKCE_VERIFIER_KEY = "p3.buyer.auth.pkce.verifier";
const OAUTH_STATE_KEY = "p3.buyer.auth.oauth.state";
const RETURN_TO_KEY = "p3.buyer.auth.returnTo";

type CognitoTokenResponse = {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
};

export type CognitoIdentityProvider = "Google" | "Kakao";

type StartHostedUiLoginOptions = {
  identityProvider?: CognitoIdentityProvider;
};

export type AuthConfigStatus = {
  ready: boolean;
  missingKeys: string[];
  redirectUri: string;
};

export function getAuthConfigStatus(): AuthConfigStatus {
  const missingKeys = [
    ["NEXT_PUBLIC_COGNITO_DOMAIN", env.cognitoDomain],
    ["NEXT_PUBLIC_COGNITO_CLIENT_ID", env.cognitoClientId],
    ["NEXT_PUBLIC_API_BASE_URL", env.apiBaseUrl],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return {
    ready: missingKeys.length === 0,
    missingKeys,
    redirectUri: getRedirectUri(),
  };
}

export async function startHostedUiLogin(returnTo = "/", options: StartHostedUiLoginOptions = {}) {
  assertBrowser();

  const status = getAuthConfigStatus();

  if (!status.ready) {
    throw new Error(`Missing auth environment: ${status.missingKeys.join(", ")}`);
  }

  const verifier = createCodeVerifier();
  const challenge = await createCodeChallenge(verifier);
  const state = createRandomString(32);

  window.sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  window.sessionStorage.setItem(OAUTH_STATE_KEY, state);
  window.sessionStorage.setItem(RETURN_TO_KEY, returnTo);

  const authorizeUrl = new URL(`${normalizeCognitoDomain()}/oauth2/authorize`);
  authorizeUrl.searchParams.set("client_id", env.cognitoClientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid email profile");
  authorizeUrl.searchParams.set("redirect_uri", status.redirectUri);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("code_challenge", challenge);
  authorizeUrl.searchParams.set("state", state);
  if (options.identityProvider) {
    authorizeUrl.searchParams.set("identity_provider", options.identityProvider);
  }

  window.location.assign(authorizeUrl.toString());
}

export function startHostedUiLogout(logoutTo = "/auth") {
  assertBrowser();

  const status = getAuthConfigStatus();

  if (!status.ready) {
    throw new Error(`Missing auth environment: ${status.missingKeys.join(", ")}`);
  }

  clearStoredTokens();
  window.sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  window.sessionStorage.removeItem(OAUTH_STATE_KEY);
  window.sessionStorage.removeItem(RETURN_TO_KEY);

  const logoutUrl = new URL(`${normalizeCognitoDomain()}/logout`);
  logoutUrl.searchParams.set("client_id", env.cognitoClientId);
  logoutUrl.searchParams.set("logout_uri", resolveAppUrl(logoutTo));

  window.location.assign(logoutUrl.toString());
}

export async function exchangeAuthorizationCode(searchParams: URLSearchParams): Promise<StoredAuthTokens> {
  assertBrowser();

  const error = searchParams.get("error");

  if (error) {
    throw new Error(`${error}: ${searchParams.get("error_description") ?? "Cognito authorization failed"}`);
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = window.sessionStorage.getItem(OAUTH_STATE_KEY);
  const verifier = window.sessionStorage.getItem(PKCE_VERIFIER_KEY);

  if (!code) {
    throw new Error("Missing Cognito authorization code");
  }

  if (!state || !expectedState || state !== expectedState) {
    throw new Error("Invalid Cognito OAuth state");
  }

  if (!verifier) {
    throw new Error("Missing PKCE verifier");
  }

  const tokenUrl = new URL(`${normalizeCognitoDomain()}/oauth2/token`);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: env.cognitoClientId,
    code,
    redirect_uri: getRedirectUri(),
    code_verifier: verifier,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const tokenBody = (await response.json().catch(() => undefined)) as CognitoTokenResponse | undefined;

  if (!response.ok || !tokenBody?.access_token) {
    throw new Error(`Cognito token exchange failed: ${response.status}`);
  }

  const tokens: StoredAuthTokens = {
    accessToken: tokenBody.access_token,
    idToken: tokenBody.id_token,
    refreshToken: tokenBody.refresh_token,
    tokenType: tokenBody.token_type,
    expiresAt: Date.now() + tokenBody.expires_in * 1000,
  };

  storeTokens(tokens);
  window.sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  window.sessionStorage.removeItem(OAUTH_STATE_KEY);

  return tokens;
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getValidTokens();
  return tokens?.accessToken ?? null;
}

export async function getValidIdToken(): Promise<string | null> {
  const tokens = await getValidTokens();
  return tokens?.idToken ?? null;
}

async function getValidTokens(): Promise<StoredAuthTokens | null> {
  const tokens = getStoredTokens();

  if (!tokens) {
    return null;
  }

  if (tokens.expiresAt > Date.now() + 30_000) {
    return tokens;
  }

  if (!tokens.refreshToken) {
    clearStoredTokens();
    return null;
  }

  try {
    return await refreshStoredTokens(tokens.refreshToken);
  } catch {
    return null;
  }
}

async function refreshStoredTokens(refreshToken: string): Promise<StoredAuthTokens> {
  assertBrowser();

  const status = getAuthConfigStatus();

  if (!status.ready) {
    clearStoredTokens();
    throw new Error(`Missing auth environment: ${status.missingKeys.join(", ")}`);
  }

  const tokenUrl = new URL(`${normalizeCognitoDomain()}/oauth2/token`);
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: env.cognitoClientId,
    refresh_token: refreshToken,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const tokenBody = (await response.json().catch(() => undefined)) as CognitoTokenResponse | undefined;

  if (!response.ok || !tokenBody?.access_token) {
    clearStoredTokens();
    throw new Error("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
  }

  const tokens: StoredAuthTokens = {
    accessToken: tokenBody.access_token,
    idToken: tokenBody.id_token,
    refreshToken: tokenBody.refresh_token ?? refreshToken,
    tokenType: tokenBody.token_type,
    expiresAt: Date.now() + tokenBody.expires_in * 1000,
  };

  storeTokens(tokens);
  return tokens;
}

export function getReturnTo() {
  assertBrowser();

  return window.sessionStorage.getItem(RETURN_TO_KEY) ?? "/";
}

export function consumeReturnTo() {
  const returnTo = getReturnTo();
  window.sessionStorage.removeItem(RETURN_TO_KEY);
  return returnTo;
}

function getRedirectUri() {
  if (env.cognitoRedirectUri) {
    return env.cognitoRedirectUri;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback`;
  }

  return "";
}

function resolveAppUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}${pathOrUrl}`;
  }

  return `${env.appBaseUrl}${pathOrUrl}`;
}

function normalizeCognitoDomain() {
  const domain = env.cognitoDomain.replace(/\/$/, "");

  if (domain.startsWith("https://")) {
    return domain;
  }

  return `https://${domain}`;
}

function createCodeVerifier() {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(64)));
}

async function createCodeChallenge(verifier: string) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return base64UrlEncode(new Uint8Array(digest));
}

function createRandomString(byteLength: number) {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(byteLength)));
}

function base64UrlEncode(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function assertBrowser() {
  if (typeof window === "undefined") {
    throw new Error("Auth flow must run in the browser");
  }
}
