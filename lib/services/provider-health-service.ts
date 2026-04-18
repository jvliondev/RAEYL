/**
 * Provider health check service.
 * Runs live checks against connected provider APIs and updates health status in the database.
 * Called from server actions or API routes — never from the edge/middleware.
 */

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getVercelProjectHealth, mapVercelStateToHealth } from "./vercel-service";
import { recordAuditEvent } from "@/lib/audit";
import { decryptSecret } from "@/lib/security/encryption";

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
      secrets: {
        where: { status: "ACTIVE", secretType: "API_KEY" },
        orderBy: { createdAt: "desc" },
        take: 1
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

  const slug = provider.providerName.toLowerCase().replace(/\s+/g, "-");
  const now = new Date().toISOString();

  // Vercel live check
  if (slug === "vercel" || slug.includes("vercel")) {
    const token = provider.secrets[0];
    const projectId = provider.externalProjectId;
    const teamId = provider.externalTeamId;

    if (!token || !projectId) {
      const result: HealthCheckResult = {
        providerId,
        providerName: provider.providerName,
        healthStatus: "ATTENTION_NEEDED",
        syncState: "PENDING",
        detail: "API token or project ID not configured. Add these in provider settings.",
        checkedAt: now
      };
      await persistHealthResult(provider.id, result);
      return result;
    }

    const rawToken = decryptSecret(token.encryptedValue);
    const health = await getVercelProjectHealth(rawToken, projectId, teamId);

    const result: HealthCheckResult = {
      providerId,
      providerName: provider.providerName,
      healthStatus: mapVercelStateToHealth(health.deploymentState),
      syncState: health.error ? "FAILED" : "SYNCED",
      detail: health.error
        ? `Check failed: ${health.error}`
        : `Last deployment: ${health.deploymentState} · ${health.lastDeployedAt ?? "unknown time"}`,
      checkedAt: now
    };
    await persistHealthResult(provider.id, result, {
      ...(provider.metadata && typeof provider.metadata === "object" && !Array.isArray(provider.metadata)
        ? (provider.metadata as Record<string, unknown>)
        : {}),
      deploymentState: health.deploymentState,
      domains: health.domains.join(", "),
      deploymentUrl: health.deploymentUrl ?? "",
      selectedProjectName: health.projectName ?? provider.externalProjectId ?? "not selected"
    });
    return result;
  }

  // Manual/unknown provider — just confirm it's connected
  if (provider.connectionMethod === "MANUAL") {
    const result: HealthCheckResult = {
      providerId,
      providerName: provider.providerName,
      healthStatus: "HEALTHY",
      syncState: "DISABLED",
      detail: "Manually managed — no live sync available.",
      checkedAt: now
    };
    await persistHealthResult(provider.id, result);
    return result;
  }

  // Default: can't check without a live integration
  const result: HealthCheckResult = {
    providerId,
    providerName: provider.providerName,
    healthStatus: "UNKNOWN",
    syncState: "PENDING",
    detail: "Live health check not yet available for this provider type.",
    checkedAt: now
  };
  await persistHealthResult(provider.id, result);
  return result;
}

async function persistHealthResult(
  providerId: string,
  result: HealthCheckResult,
  metadata?: Record<string, unknown>
) {
  await prisma.providerConnection.update({
    where: { id: providerId },
    data: {
      healthStatus: result.healthStatus,
      syncState: result.syncState,
      lastHealthCheckAt: new Date(),
      lastSyncAt: result.syncState === "SYNCED" ? new Date() : undefined,
      ...(metadata ? { metadata: metadata as Prisma.InputJsonValue } : {})
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
