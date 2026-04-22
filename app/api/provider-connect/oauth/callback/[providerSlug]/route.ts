import { NextRequest, NextResponse } from "next/server";

import { requireWalletCapability, requireProviderInWallet, requireSession, requireWebsiteInWallet } from "@/lib/auth/access";
import { recordAuditEvent } from "@/lib/audit";
import { createConnectedProviderRecord } from "@/lib/providers/orchestrator";
import {
  clearPendingProviderOAuthContext,
  exchangeProviderOAuthCode,
  getConfiguredAppOrigin,
  readPendingProviderOAuthContext
} from "@/lib/providers/oauth";
import { buildSetupTargetHref, getNextSetupConnectionTarget } from "@/lib/services/setup-rail";
import { syncProviderConnectionSignals } from "@/lib/services/provider-signal-service";

function withFormError(url: string, message: string) {
  const nextUrl = new URL(url, "http://localhost");
  nextUrl.searchParams.set("formError", message);
  return `${nextUrl.pathname}${nextUrl.search}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ providerSlug: string }> }
) {
  const { providerSlug } = await params;
  let errorReturnTo = "/app/wallets";

  try {
    const session = await requireSession();
    const pending = await readPendingProviderOAuthContext();
    errorReturnTo = pending.context.errorReturnTo;

    if (pending.context.providerSlug !== providerSlug) {
      throw new Error("OAuth callback provider mismatch. Start the connection again.");
    }

    if (pending.context.userId !== session.user.id) {
      throw new Error("This OAuth callback belongs to a different signed-in user.");
    }

    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const providerError = request.nextUrl.searchParams.get("error");
    const providerErrorDescription = request.nextUrl.searchParams.get("error_description");

    if (providerError) {
      throw new Error(providerErrorDescription || `OAuth authorization failed: ${providerError}`);
    }

    if (!code) {
      throw new Error("OAuth authorization did not return a code.");
    }

    if (!state || state !== pending.state) {
      throw new Error("OAuth state mismatch. Start the connection again.");
    }

    await requireWalletCapability(pending.context.walletId, session.user.id, "provider.write");

    if (pending.context.websiteId) {
      await requireWebsiteInWallet(pending.context.walletId, pending.context.websiteId);
    }

    if (pending.context.providerId) {
      await requireProviderInWallet(pending.context.walletId, pending.context.providerId);
    }

    const tokens = await exchangeProviderOAuthCode({
      providerSlug,
      origin: getConfiguredAppOrigin() ?? request.nextUrl.origin,
      code,
      codeVerifier: pending.codeVerifier
    });

    const created = await createConnectedProviderRecord({
      actorUserId: session.user.id,
      existingProviderId: pending.context.providerId,
      provider: {
        walletId: pending.context.walletId,
        websiteId: pending.context.websiteId,
        providerSlug: pending.context.providerSlug,
        providerName: pending.context.providerName,
        category: pending.context.category,
        connectionMethod: "OAUTH",
        oauthAccessToken: tokens.accessToken,
        oauthRefreshToken: tokens.refreshToken,
        oauthExpiresAt: tokens.expiresIn
          ? new Date(Date.now() + tokens.expiresIn * 1000)
          : undefined,
        oauthScopes: tokens.scope?.split(/\s+/).filter(Boolean),
        displayLabel: pending.context.displayLabel,
        ownerDescription: pending.context.ownerDescription,
        notes: pending.context.notes
      }
    });

    await syncProviderConnectionSignals(created.provider.id, session.user.id);

    await recordAuditEvent({
      actorUserId: session.user.id,
      actorType: "USER",
      walletId: pending.context.walletId,
      entityType: "PROVIDER",
      entityId: created.provider.id,
      action: pending.context.providerId ? "provider.oauth_reconnected" : "provider.oauth_connected",
      summary: pending.context.providerId
        ? `${created.provider.providerName} was reconnected with OAuth.`
        : `${created.provider.providerName} was connected with OAuth.`,
      metadata: {
        providerSlug,
        connectionState: created.orchestration.verification.connectionState,
        confidenceScore:
          created.orchestration.resourceResolution?.confidenceScore ??
          created.orchestration.verification.confidenceScore
      }
    });

    await clearPendingProviderOAuthContext();

    if (
      pending.context.setupChain &&
      pending.context.returnTo === `/app/wallets/${pending.context.walletId}/setup`
    ) {
      const nextTarget = await getNextSetupConnectionTarget(pending.context.walletId);

      if (nextTarget && nextTarget.status !== "connected") {
        if (nextTarget.href?.startsWith(`/app/wallets/${pending.context.walletId}`)) {
          return NextResponse.redirect(new URL(nextTarget.href, request.nextUrl.origin));
        }

        if (nextTarget.providerSlug) {
          return NextResponse.redirect(
            new URL(
              buildSetupTargetHref({
                walletId: pending.context.walletId,
                providerSlug: nextTarget.providerSlug,
                websiteId: pending.context.websiteId ?? null,
                returnTo: pending.context.returnTo,
                setupChain: true
              }),
              request.nextUrl.origin
            )
          );
        }
      }

      return NextResponse.redirect(
        new URL(
          `/app/wallets/${pending.context.walletId}/setup?setupConnected=${encodeURIComponent(
            pending.context.providerSlug
          )}&setupComplete=1`,
          request.nextUrl.origin
        )
      );
    }

    const redirectTarget =
      pending.context.returnTo ??
      `/app/wallets/${pending.context.walletId}/providers/${created.provider.id}`;
    const separator = redirectTarget.includes("?") ? "&" : "?";
    return NextResponse.redirect(
      new URL(
        `${redirectTarget}${separator}${pending.context.providerId ? "reconnected=1" : "connected=1"}`,
        request.nextUrl.origin
      )
    );
  } catch (error) {
    await clearPendingProviderOAuthContext().catch(() => undefined);
    const message =
      error instanceof Error ? error.message : "OAuth connection failed. Please try again.";
    return NextResponse.redirect(
      new URL(withFormError(errorReturnTo, message), request.nextUrl.origin)
    );
  }
}
