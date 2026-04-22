import crypto from "crypto";
import { cookies } from "next/headers";

import type { ProviderCategory } from "@prisma/client/index";

import { decryptSecret, encryptSecret } from "@/lib/security/encryption";
import { getProviderAdapter } from "@/lib/providers/registry";

const OAUTH_COOKIE_PREFIX = "raeyl_provider_oauth";
const COOKIE_MAX_AGE_SECONDS = 60 * 10;

export type PendingProviderOAuthContext = {
  userId: string;
  walletId: string;
  websiteId?: string;
  providerSlug: string;
  providerName: string;
  category: ProviderCategory;
  providerId?: string;
  displayLabel?: string;
  ownerDescription?: string;
  notes?: string;
  returnTo?: string | null;
  setupChain?: boolean;
  errorReturnTo: string;
};

type OAuthCookiePayload = {
  state: string;
  nonce?: string;
  codeVerifier: string;
  context: PendingProviderOAuthContext;
};

export type OAuthTokenExchangeResult = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
  idToken?: string;
};

function getCookieName(suffix: string) {
  return `${OAUTH_COOKIE_PREFIX}_${suffix}`;
}

function generateSecureRandomString(length: number) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const randomBytes = crypto.randomBytes(length);
  return Array.from(randomBytes, (byte) => charset[byte % charset.length]).join("");
}

function createCodeVerifier() {
  return crypto.randomBytes(43).toString("base64url");
}

function createCodeChallenge(codeVerifier: string) {
  return crypto.createHash("sha256").update(codeVerifier).digest("base64url");
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS
  };
}

export function getProviderOAuthAvailability(providerSlug?: string | null) {
  const adapter = getProviderAdapter(providerSlug);
  const config = adapter.getOAuthConfig?.();

  if (!config) {
    return {
      enabled: false,
      reason: "oauth-not-supported"
    } as const;
  }

  const clientId = process.env[config.clientIdEnvKey];
  if (!clientId) {
    return {
      enabled: false,
      reason: "missing-client-id"
    } as const;
  }

  if (config.clientSecretEnvKey && !process.env[config.clientSecretEnvKey]) {
    return {
      enabled: false,
      reason: "missing-client-secret"
    } as const;
  }

  return {
    enabled: true,
    reason: null
  } as const;
}

export function getProviderOAuthReadiness(providerSlug?: string | null, origin?: string | null) {
  const adapter = getProviderAdapter(providerSlug);
  const config = adapter.getOAuthConfig?.();

  if (!config) {
    return {
      supported: false,
      enabled: false,
      reason: "oauth-not-supported",
      providerSlug: adapter.getProviderDefinition().slug,
      callbackUrl: null,
      missingKeys: [] as string[]
    };
  }

  const missingKeys = [config.clientIdEnvKey, config.clientSecretEnvKey]
    .filter((key): key is string => Boolean(key))
    .filter((key) => !process.env[key]);

  return {
    supported: true,
    enabled: missingKeys.length === 0,
    reason: missingKeys.length ? "missing-env" : null,
    providerSlug: adapter.getProviderDefinition().slug,
    callbackUrl: origin ? getOAuthCallbackUrl(origin, adapter.getProviderDefinition().slug) : null,
    missingKeys
  };
}

export function getOAuthCallbackUrl(origin: string, providerSlug: string) {
  return `${origin}/api/provider-connect/oauth/callback/${providerSlug}`;
}

export function getConfiguredAppOrigin() {
  return process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? process.env.APP_URL ?? null;
}

export async function buildProviderOAuthAuthorizationUrl(input: {
  origin: string;
  context: PendingProviderOAuthContext;
}) {
  const adapter = getProviderAdapter(input.context.providerSlug);
  const config = adapter.getOAuthConfig?.();

  if (!config) {
    throw new Error("OAuth is not available for this provider yet.");
  }

  const clientId = process.env[config.clientIdEnvKey];
  if (!clientId) {
    throw new Error(`Missing OAuth configuration: ${config.clientIdEnvKey}`);
  }

  if (config.clientSecretEnvKey && !process.env[config.clientSecretEnvKey]) {
    throw new Error(`Missing OAuth configuration: ${config.clientSecretEnvKey}`);
  }

  const state = generateSecureRandomString(43);
  const nonce = config.includeNonce ? generateSecureRandomString(43) : undefined;
  const codeVerifier = createCodeVerifier();
  const codeChallenge = createCodeChallenge(codeVerifier);
  const cookieStore = await cookies();
  const payload: OAuthCookiePayload = {
    state,
    nonce,
    codeVerifier,
    context: input.context
  };

  cookieStore.set(getCookieName("payload"), encryptSecret(JSON.stringify(payload)), getCookieOptions());

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getOAuthCallbackUrl(input.origin, input.context.providerSlug),
    response_type: "code",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    scope: config.scopes.join(" ")
  });

  if (nonce) {
    params.set("nonce", nonce);
  }

  for (const [key, value] of Object.entries(config.extraAuthorizationParams ?? {})) {
    params.set(key, value);
  }

  return `${config.authorizationUrl}?${params.toString()}`;
}

export async function readPendingProviderOAuthContext() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(getCookieName("payload"))?.value;

  if (!raw) {
    throw new Error("This OAuth session has expired. Start the connection again.");
  }

  const payload = JSON.parse(decryptSecret(raw)) as OAuthCookiePayload;

  if (!payload?.state || !payload?.codeVerifier || !payload?.context?.providerSlug) {
    throw new Error("This OAuth session is invalid. Start the connection again.");
  }

  return payload;
}

export async function clearPendingProviderOAuthContext() {
  const cookieStore = await cookies();
  cookieStore.delete(getCookieName("payload"));
}

export async function exchangeProviderOAuthCode(input: {
  providerSlug: string;
  origin: string;
  code: string;
  codeVerifier: string;
}) {
  const adapter = getProviderAdapter(input.providerSlug);
  const config = adapter.getOAuthConfig?.();

  if (!config) {
    throw new Error("OAuth is not available for this provider.");
  }

  const clientId = process.env[config.clientIdEnvKey];
  if (!clientId) {
    throw new Error(`Missing OAuth configuration: ${config.clientIdEnvKey}`);
  }

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code: input.code,
    code_verifier: input.codeVerifier,
    redirect_uri: getOAuthCallbackUrl(input.origin, input.providerSlug)
  });

  const clientSecret =
    config.clientSecretEnvKey ? process.env[config.clientSecretEnvKey] : undefined;

  if (clientSecret) {
    params.set("client_secret", clientSecret);
  }

  for (const [key, value] of Object.entries(config.extraTokenParams ?? {})) {
    params.set(key, value);
  }

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: params.toString(),
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OAuth token exchange failed (${response.status}): ${body || "Unknown response."}`);
  }

  const json = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
  };

  if (!json.access_token) {
    throw new Error("OAuth token exchange succeeded but no access token was returned.");
  }

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
    tokenType: json.token_type,
    scope: json.scope,
    idToken: json.id_token
  } satisfies OAuthTokenExchangeResult;
}

export async function refreshProviderOAuthToken(input: {
  providerSlug: string;
  refreshToken: string;
}) {
  const adapter = getProviderAdapter(input.providerSlug);
  const config = adapter.getOAuthConfig?.();

  if (!config) {
    throw new Error("OAuth is not available for this provider.");
  }

  const clientId = process.env[config.clientIdEnvKey];
  if (!clientId) {
    throw new Error(`Missing OAuth configuration: ${config.clientIdEnvKey}`);
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: input.refreshToken
  });

  const clientSecret =
    config.clientSecretEnvKey ? process.env[config.clientSecretEnvKey] : undefined;

  if (clientSecret) {
    params.set("client_secret", clientSecret);
  }

  for (const [key, value] of Object.entries(config.extraTokenParams ?? {})) {
    params.set(key, value);
  }

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: params.toString(),
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OAuth token refresh failed (${response.status}): ${body || "Unknown response."}`);
  }

  const json = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
  };

  if (!json.access_token) {
    throw new Error("OAuth token refresh succeeded but no access token was returned.");
  }

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
    tokenType: json.token_type,
    scope: json.scope,
    idToken: json.id_token
  } satisfies OAuthTokenExchangeResult;
}
