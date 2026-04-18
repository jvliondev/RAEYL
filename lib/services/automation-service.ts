import { AlertCategory, AlertSeverity, AlertStatus, BillingStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";
import { checkProviderHealth } from "@/lib/services/provider-health-service";

function startOfSoonWindow(days: number) {
  const now = new Date();
  const next = new Date(now);
  next.setDate(now.getDate() + days);
  return next;
}

async function upsertWalletAlert(input: {
  walletId: string;
  providerConnectionId?: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  recommendation: string;
}) {
  const existing = await prisma.alert.findFirst({
    where: {
      walletId: input.walletId,
      providerConnectionId: input.providerConnectionId ?? null,
      category: input.category,
      status: AlertStatus.OPEN
    }
  });

  if (existing) {
    return prisma.alert.update({
      where: { id: existing.id },
      data: {
        severity: input.severity,
        title: input.title,
        message: input.message,
        recommendation: input.recommendation
      }
    });
  }

  return prisma.alert.create({
    data: {
      walletId: input.walletId,
      providerConnectionId: input.providerConnectionId,
      category: input.category,
      severity: input.severity,
      title: input.title,
      message: input.message,
      recommendation: input.recommendation,
      status: AlertStatus.OPEN
    }
  });
}

async function resolveOpenAlerts(where: Prisma.AlertWhereInput) {
  return prisma.alert.updateMany({
    where: {
      ...where,
      status: AlertStatus.OPEN
    },
    data: {
      status: AlertStatus.RESOLVED,
      resolvedAt: new Date()
    }
  });
}

export async function syncWalletOperationalAlerts(walletId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    include: {
      providers: {
        where: {
          status: {
            not: "ARCHIVED"
          }
        }
      },
      billingRecords: {
        where: {
          status: {
            in: [BillingStatus.ACTIVE, BillingStatus.TRIALING, BillingStatus.PAST_DUE]
          }
        }
      },
      websites: {
        include: {
          editRoutes: {
            where: {
              isEnabled: true,
              isPrimary: true
            }
          }
        }
      }
    }
  });

  if (!wallet) {
    throw new Error("Wallet not found.");
  }

  const soonWindow = startOfSoonWindow(30);
  const staleWindow = startOfSoonWindow(-14);
  const hasPrimaryEditRoute = wallet.websites.some((website) => website.editRoutes.length > 0);

  if (!hasPrimaryEditRoute) {
    await upsertWalletAlert({
      walletId,
      category: AlertCategory.MISSING_EDIT_ROUTE,
      severity: AlertSeverity.WARNING,
      title: "Editing path still missing",
      message: "This wallet does not have a primary editing path yet.",
      recommendation: "Add one main edit action so the owner knows exactly where to go for website updates."
    });
  } else {
    await resolveOpenAlerts({ walletId, category: AlertCategory.MISSING_EDIT_ROUTE });
  }

  for (const record of wallet.billingRecords) {
    if (record.renewalDate && record.renewalDate <= soonWindow) {
      await upsertWalletAlert({
        walletId,
        providerConnectionId: record.providerConnectionId ?? undefined,
        category: AlertCategory.RENEWAL_EXPIRING,
        severity: AlertSeverity.WARNING,
        title: `${record.label} renews soon`,
        message: `A tracked website cost renews on ${record.renewalDate.toLocaleDateString()}.`,
        recommendation: "Review the billing owner and payment method before the renewal date."
      });
    }
  }

  const expiringIds = wallet.billingRecords
    .filter((record) => record.renewalDate && record.renewalDate <= soonWindow)
    .map((record) => record.providerConnectionId)
    .filter(Boolean);

  if (!expiringIds.length) {
    await resolveOpenAlerts({ walletId, category: AlertCategory.RENEWAL_EXPIRING });
  }

  for (const provider of wallet.providers) {
    if (
      provider.healthStatus === "ISSUE_DETECTED" ||
      provider.healthStatus === "DISCONNECTED" ||
      provider.syncState === "FAILED"
    ) {
      await upsertWalletAlert({
        walletId,
        providerConnectionId: provider.id,
        category: AlertCategory.PROVIDER_DISCONNECTED,
        severity: provider.healthStatus === "DISCONNECTED" ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
        title: `${provider.displayLabel ?? provider.providerName} needs attention`,
        message: "A connected website service is no longer verifying cleanly.",
        recommendation: "Reconnect the tool or review its configuration so the owner sees an accurate status."
      });
    } else {
      await resolveOpenAlerts({
        walletId,
        providerConnectionId: provider.id,
        category: AlertCategory.PROVIDER_DISCONNECTED
      });
    }

    if (
      provider.connectionMethod !== "MANUAL" &&
      (!provider.lastHealthCheckAt || provider.lastHealthCheckAt < staleWindow)
    ) {
      await upsertWalletAlert({
        walletId,
        providerConnectionId: provider.id,
        category: AlertCategory.WALLET_INCOMPLETE,
        severity: AlertSeverity.INFO,
        title: `${provider.displayLabel ?? provider.providerName} has stale verification`,
        message: "This connection has not been checked recently.",
        recommendation: "Run provider checks so the wallet shows a fresher health signal."
      });
    }
  }
}

export async function runWalletAutomationSweep(walletId: string, actorUserId?: string) {
  const providers = await prisma.providerConnection.findMany({
    where: {
      walletId,
      status: {
        not: "ARCHIVED"
      }
    },
    select: { id: true }
  });

  const healthResults = await Promise.allSettled(providers.map((provider) => checkProviderHealth(provider.id)));
  await syncWalletOperationalAlerts(walletId);

  if (actorUserId) {
    await recordAuditEvent({
      actorUserId,
      actorType: "USER",
      walletId,
      entityType: "ALERT",
      entityId: walletId,
      action: "wallet.automation.ran",
      summary: `Automation ran across ${providers.length} provider checks.`
    });
  } else {
    await recordAuditEvent({
      actorType: "SYSTEM",
      walletId,
      entityType: "ALERT",
      entityId: walletId,
      action: "wallet.automation.ran",
      summary: `Automation ran across ${providers.length} provider checks.`
    });
  }

  return {
    providerChecks: healthResults.length,
    failures: healthResults.filter((result) => result.status === "rejected").length
  };
}

export async function runPlatformAutomationSweep(limit = 25) {
  const wallets = await prisma.wallet.findMany({
    where: {
      status: {
        in: ["IN_SETUP", "ACTIVE", "ATTENTION"]
      }
    },
    select: { id: true },
    take: limit,
    orderBy: { updatedAt: "desc" }
  });

  const results = [];
  for (const wallet of wallets) {
    results.push({
      walletId: wallet.id,
      ...(await runWalletAutomationSweep(wallet.id))
    });
  }

  await recordAuditEvent({
    actorType: "SYSTEM",
    entityType: "ALERT",
    entityId: "platform",
    action: "platform.automation.ran",
    summary: `Automation sweep completed for ${wallets.length} wallets.`
  });

  return results;
}
