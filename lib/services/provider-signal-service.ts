import { AlertCategory, AlertSeverity, AlertStatus, type Prisma } from "@prisma/client/index";

import { prisma } from "@/lib/prisma";
import { createInAppNotification } from "@/lib/services/notification-service";

async function upsertProviderAlert(input: {
  walletId: string;
  providerConnectionId: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  recommendation: string;
}) {
  const existing = await prisma.alert.findFirst({
    where: {
      walletId: input.walletId,
      providerConnectionId: input.providerConnectionId,
      category: input.category,
      status: AlertStatus.OPEN
    }
  });

  if (existing) {
    const updated = await prisma.alert.update({
      where: { id: existing.id },
      data: {
        severity: input.severity,
        title: input.title,
        message: input.message,
        recommendation: input.recommendation
      }
    });

    return { alert: updated, created: false };
  }

  const created = await prisma.alert.create({
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

  return { alert: created, created: true };
}

async function resolveProviderAlerts(where: Prisma.AlertWhereInput) {
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

async function notifyUsers(input: {
  userIds: string[];
  walletId: string;
  subject: string;
  body: string;
  ctaUrl: string;
}) {
  const uniqueUserIds = [...new Set(input.userIds.filter(Boolean))];

  await Promise.all(
    uniqueUserIds.map((userId) =>
      createInAppNotification({
        userId,
        walletId: input.walletId,
        type: "ALERT",
        subject: input.subject,
        body: input.body,
        ctaUrl: input.ctaUrl
      })
    )
  );
}

export async function syncProviderConnectionSignals(providerConnectionId: string, actorUserId?: string) {
  const provider = await prisma.providerConnection.findUnique({
    where: { id: providerConnectionId },
    include: {
      wallet: {
        select: {
          id: true,
          businessName: true,
          primaryOwnerId: true,
          primaryDeveloperId: true
        }
      }
    }
  });

  if (!provider) {
    throw new Error("Provider not found.");
  }

  const providerLabel = provider.displayLabel ?? provider.providerName;
  const ctaUrl = `/app/wallets/${provider.walletId}/providers/${provider.id}`;
  const notifyUserIds = [actorUserId, provider.wallet.primaryOwnerId, provider.wallet.primaryDeveloperId].filter(
    (value): value is string => Boolean(value)
  );

  if (
    provider.reconnectRequired ||
    provider.connectionState === "RECONNECT_REQUIRED" ||
    provider.healthStatus === "DISCONNECTED" ||
    provider.syncState === "FAILED"
  ) {
    const result = await upsertProviderAlert({
      walletId: provider.walletId,
      providerConnectionId: provider.id,
      category: AlertCategory.PROVIDER_DISCONNECTED,
      severity:
        provider.healthStatus === "DISCONNECTED" || provider.connectionState === "RECONNECT_REQUIRED"
          ? AlertSeverity.CRITICAL
          : AlertSeverity.WARNING,
      title: `${providerLabel} needs reconnecting`,
      message: "RAEYL can no longer fully trust this live connection.",
      recommendation: "Reconnect the tool so the wallet can refresh health, billing, and resource matching."
    });

    if (result.created) {
      await notifyUsers({
        userIds: notifyUserIds,
        walletId: provider.walletId,
        subject: `${providerLabel} needs attention`,
        body: "A connected tool stopped verifying cleanly. RAEYL saved the repair path so you can fix it quickly.",
        ctaUrl
      });
    }
  } else {
    await resolveProviderAlerts({
      walletId: provider.walletId,
      providerConnectionId: provider.id,
      category: AlertCategory.PROVIDER_DISCONNECTED
    });
  }

  const needsSelection =
    provider.connectionState === "AWAITING_SELECTION" ||
    (!provider.externalProjectId && provider.connectionMethod !== "MANUAL") ||
    (!!provider.connectionConfidence && provider.connectionConfidence < 70);

  if (needsSelection) {
    const result = await upsertProviderAlert({
      walletId: provider.walletId,
      providerConnectionId: provider.id,
      category: AlertCategory.WALLET_INCOMPLETE,
      severity: AlertSeverity.WARNING,
      title: `${providerLabel} still needs one confirmation`,
      message: "RAEYL verified this account, but it still needs the exact resource or a higher-confidence match.",
      recommendation: "Open the repair flow and confirm the correct project or workspace."
    });

    if (result.created) {
      await notifyUsers({
        userIds: notifyUserIds,
        walletId: provider.walletId,
        subject: `${providerLabel} needs a quick confirmation`,
        body: "RAEYL found the account, but it needs one clean confirmation to keep this wallet precise.",
        ctaUrl
      });
    }
  } else {
    await resolveProviderAlerts({
      walletId: provider.walletId,
      providerConnectionId: provider.id,
      category: AlertCategory.WALLET_INCOMPLETE
    });
  }

  return {
    providerId: provider.id,
    walletId: provider.walletId
  };
}
