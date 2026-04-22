/**
 * Provider health check service.
 * Runs live checks against connected provider APIs and updates health status in the database.
 * Called from server actions or API routes — never from the edge/middleware.
 */

import { Prisma, type ProviderConnection } from "@prisma/client/index";

import { prisma } from "@/lib/prisma";
import { getProviderAdapter } from "@/lib/providers/registry";
import { refreshProviderOAuthToken } from "@/lib/providers/oauth";
import { recordAuditEvent } from "@/lib/audit";
import { decryptSecret } from "@/lib/security/encryption";
import { storeProviderSecret } from "@/lib/services/provider-credentials";
import { syncProviderConnectionSignals } from "@/lib/services/provider-signal-service";

export type HealthCheckResult = {
  providerId: string;
  providerName: string;
  healthStatus: "HEALTHY" | "ATTENTION_NEEDED" | "ISSUE_DETECTED" | "DISCONNECTED" | "UNKNOWN";
  syncState: "SYNCED" | "FAILED" | "PENDING" | "DISABLED";
  detail: string;
  checkedAt: string;
};

/**
 * Check health for a single provider connection.
 * Reads the stored API token from ProviderSecret and runs a live check.
 */
export async function checkProviderHealth(providerId: string): Promise<HealthCheckResult> {
  const provider = await prisma.providerConnection.findUnique({
    where: { id: providerId },
    include: {
      wallet: {
        include: {
          websites: {
            orderBy: {
              createdAt: "asc"
            },
            take: 1
          },
          settings: {
            where: {
              scope: "WALLET",
              key: "setupProfile"
            },
            take: 1
          }
        }
      },
      secrets: {
        where: {
          status: "ACTIVE",
          secretType: {
            in: ["API_KEY", "ACCESS_TOKEN"]
          }
        },
        orderBy: { createdAt: "desc" },
        take: 4
      }
    }
  });

  if (!provider) {
    return {
      providerId,
      providerName: "Unknown",
      healthStatus: "UNKNOWN",
      syncState: "FAILED",
      detail: "Provider not found.",
      checkedAt: new Date().toISOString()
    };
  }

  const adapter = getProviderAdapter(provider.adapterKey ?? provider.providerName);
  let token =
    provider.connectionMethod === "OAUTH"
      ? provider.secrets.find((secret) => secret.secretType === "ACCESS_TOKEN") ?? provider.secrets[0]
      : provider.secrets.find((secret) => secret.secretType === "API_KEY") ?? provider.secrets[0];
  let rawToken = token ? decryptSecret(token.encryptedValue) : undefined;
  const now = new Date().toISOString();
  const refreshSecret =
    provider.connectionMethod === "OAUTH"
      ? provider.secrets.find((secret) => secret.secretType === "REFRESH_TOKEN")
      : undefined;

  if (provider.connectionMethod === "MANUAL" && !adapter.runHealthCheck) {
    const result: HealthCheckResult = {
      providerId,
      providerName: provider.providerName,
      healthStatus: "HEALTHY",
      syncState: "DISABLED",
      detail: "Manually managed — no live sync available.",
      checkedAt: now
    };
    await persistHealthResult(provider, result);
    return result;
  }

  if (!adapter.runHealthCheck) {
    const result: HealthCheckResult = {
      providerId,
      providerName: provider.providerName,
      healthStatus: "UNKNOWN",
      syncState: "PENDING",
      detail: "Live health check not yet available for this provider type.",
      checkedAt: new Date().toISOString()
    };
    await persistHealthResult(provider, result);
    return result;
  }

  const normalizedMetadata =
    provider.normalizedMetadata && typeof provider.normalizedMetadata === "object" && !Array.isArray(provider.normalizedMetadata)
      ? (provider.normalizedMetadata as Record<string, unknown>)
      : {};
  const providerSlug =
    typeof normalizedMetadata.providerSlug === "string"
      ? normalizedMetadata.providerSlug
      : provider.adapterKey ?? provider.providerName.toLowerCase();

  if (
    provider.connectionMethod === "OAUTH" &&
    refreshSecret &&
    (!token?.expiresAt || token.expiresAt <= new Date())
  ) {
    try {
      const refreshed = await refreshProviderOAuthToken({
        providerSlug,
        refreshToken: decryptSecret(refreshSecret.encryptedValue)
      });

      await prisma.$transaction(async (tx) => {
        await storeProviderSecret(tx, {
          providerConnectionId: provider.id,
          secretType: "ACCESS_TOKEN",
          rawValue: refreshed.accessToken,
          expiresAt: refreshed.expiresIn ? new Date(Date.now() + refreshed.expiresIn * 1000) : undefined,
          scopes: refreshed.scope?.split(/\s+/).filter(Boolean) ?? []
        });

        if (refreshed.refreshToken) {
          await storeProviderSecret(tx, {
            providerConnectionId: provider.id,
            secretType: "REFRESH_TOKEN",
            rawValue: refreshed.refreshToken
          });
        }
      });

      rawToken = refreshed.accessToken;
      token = {
        ...token,
        encryptedValue: "",
        expiresAt: refreshed.expiresIn ? new Date(Date.now() + refreshed.expiresIn * 1000) : null
      } as typeof token;
    } catch (error) {
      const result: HealthCheckResult = {
        providerId,
        providerName: provider.providerName,
        healthStatus: "DISCONNECTED",
        syncState: "FAILED",
        detail: error instanceof Error ? error.message : "OAuth token refresh failed.",
        checkedAt: now
      };
      await persistHealthResult(provider, result);
      return result;
    }
  }

  const primaryWebsite = provider.wallet.websites[0];
  const setupProfile =
    provider.wallet.settings[0]?.value &&
    typeof provider.wallet.settings[0].value === "object" &&
    !Array.isArray(provider.wallet.settings[0].value)
      ? (provider.wallet.settings[0].value as Record<string, unknown>)
      : null;

  const health = await adapter.runHealthCheck(
    {
      walletId: provider.walletId,
      businessName: provider.wallet.businessName,
      websiteName: provider.wallet.websiteName ?? primaryWebsite?.name ?? null,
      websiteUrl: provider.wallet.websiteUrl ?? primaryWebsite?.productionUrl ?? null,
      primaryDomain: primaryWebsite?.primaryDomain ?? null,
      websiteDescription: provider.wallet.websiteDescription ?? null,
      businessCategory: provider.wallet.businessCategory ?? null,
      setupProfile
    },
    {
      walletId: provider.walletId,
      websiteId: provider.websiteId ?? undefined,
      providerSlug,
      providerName: provider.providerName,
      category: provider.category,
      connectionMethod: provider.connectionMethod,
      apiToken: rawToken,
      externalProjectId: provider.externalProjectId ?? undefined,
      externalTeamId: provider.externalTeamId ?? undefined,
      dashboardUrl: provider.dashboardUrl ?? undefined,
      billingUrl: provider.billingUrl ?? undefined,
      editUrl: provider.editUrl ?? undefined,
      supportUrl: provider.supportUrl ?? undefined,
      ownerDescription: provider.ownerDescription ?? undefined,
      displayLabel: provider.displayLabel ?? undefined
    },
    {
      providerName: provider.providerName,
      providerSlug:
        providerSlug,
      category: provider.category,
      accountLabel:
        typeof normalizedMetadata.accountLabel === "string" ? normalizedMetadata.accountLabel : provider.connectedAccountLabel ?? undefined,
      connectedAccountLabel:
        typeof normalizedMetadata.connectedAccountLabel === "string"
          ? normalizedMetadata.connectedAccountLabel
          : provider.connectedAccountLabel ?? undefined,
      accountId: typeof normalizedMetadata.accountId === "string" ? normalizedMetadata.accountId : null,
      teamId: provider.externalTeamId,
      projectId: provider.externalProjectId,
      dashboardUrl: provider.dashboardUrl ?? undefined,
      billingUrl: provider.billingUrl ?? undefined,
      supportUrl: provider.supportUrl ?? undefined,
      editUrl: provider.editUrl ?? undefined,
      domainData:
        Array.isArray(normalizedMetadata.domainData) ? normalizedMetadata.domainData.filter((value): value is string => typeof value === "string") : [],
      metadataSnapshot: normalizedMetadata
    }
  );

  const result: HealthCheckResult = {
    providerId,
    providerName: provider.providerName,
    healthStatus: health.state,
    syncState: health.syncState === "NEVER_SYNCED" ? "PENDING" : health.syncState,
    detail: health.summary,
    checkedAt: health.checkedAt
  };
  await persistHealthResult(provider, result, {
    ...normalizedMetadata,
    lastHealthSummary: health.summary,
    warnings: health.warnings,
    ...(health.metadata ?? {})
  });
  await syncProviderConnectionSignals(provider.id);
  return result;
}

async function persistHealthResult(
  provider: Pick<ProviderConnection, "id" | "connectionState">,
  result: HealthCheckResult,
  metadata?: Record<string, unknown>
) {
  await prisma.providerConnection.update({
    where: { id: provider.id },
    data: {
      connectionState:
        result.healthStatus === "DISCONNECTED"
          ? "DISCONNECTED"
          : result.healthStatus === "ISSUE_DETECTED"
            ? "DEGRADED"
            : provider.connectionState,
      healthStatus: result.healthStatus,
      syncState: result.syncState,
      reconnectRequired: result.healthStatus === "DISCONNECTED",
      failureSummary: result.syncState === "FAILED" ? result.detail : null,
      lastHealthCheckAt: new Date(),
      lastSyncAt: result.syncState === "SYNCED" ? new Date() : undefined,
      ...(metadata ? { normalizedMetadata: metadata as Prisma.InputJsonValue } : {}),
      ...(metadata
        ? {
            healthSnapshot: {
              state: result.healthStatus,
              summary: result.detail,
              checkedAt: result.checkedAt
            } as Prisma.InputJsonValue
          }
        : {})
    }
  });
}

/**
 * Run health checks for all providers in a wallet.
 */
export async function checkWalletProviderHealth(walletId: string, actorUserId?: string) {
  const providers = await prisma.providerConnection.findMany({
    where: { walletId, status: { not: "ARCHIVED" } },
    select: { id: true }
  });

  const results = await Promise.allSettled(
    providers.map((p) => checkProviderHealth(p.id))
  );

  const failed = results.filter((r) => r.status === "rejected").length;

  if (actorUserId) {
    await recordAuditEvent({
      actorUserId,
      actorType: "USER",
      walletId,
      entityType: "PROVIDER",
      entityId: walletId,
      action: "provider.health_checked",
      summary: `Health check ran for ${providers.length} providers. ${failed} failed.`
    });
  }

  return results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { providerId: providers[i].id, error: (r.reason as Error).message }
  );
}
