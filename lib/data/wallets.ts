import { notFound } from "next/navigation";
import {
  AlertSeverity,
  AlertStatus,
  BillingStatus,
  MembershipStatus,
  Prisma,
  ProviderCategory,
  ProviderStatus,
  SupportPriority,
  SupportStatus,
  type WalletRole
} from "@prisma/client";

import { hasCapability, type Capability } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import type {
  ActivityRecord,
  AlertRecord,
  BillingRecord as BillingRecordView,
  ProviderRecord,
  SupportCase,
  WalletMember
} from "@/lib/types";
import { getBillingConfigurationSummary } from "@/lib/services/billing-service";
import { getHandoffReadiness } from "@/lib/services/handoff-state";
import { getWalletTemplateBySlug } from "@/lib/data/wallet-templates";

function walletAccessWhere(walletId: string, userId: string): Prisma.WalletWhereInput {
  return {
    id: walletId,
    memberships: {
      some: {
        userId,
        status: MembershipStatus.ACTIVE
      }
    }
  };
}

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function humanizeEnum(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function mapHealthStatus(value: string | null | undefined): ProviderRecord["health"] {
  switch (value) {
    case "HEALTHY":
      return "healthy";
    case "ATTENTION_NEEDED":
      return "attention";
    case "ISSUE_DETECTED":
      return "issue";
    case "DISCONNECTED":
      return "disconnected";
    default:
      return "unknown";
  }
}

function mapProviderCategory(value: ProviderCategory): ProviderRecord["category"] {
  switch (value) {
    case "HOSTING":
      return "hosting";
    case "DATABASE":
      return "database";
    case "CMS":
      return "cms";
    case "DOMAIN":
      return "domain";
    case "EMAIL_FORMS":
      return "email_forms";
    case "ANALYTICS":
      return "analytics";
    case "PAYMENTS":
      return "payments";
    case "SCHEDULING":
      return "scheduling";
    case "AUTOMATION":
      return "automation";
    case "SUPPORT":
      return "support";
    case "STORAGE":
      return "storage";
    case "AUTH_IDENTITY":
      return "auth_identity";
    default:
      return "custom";
  }
}

function mapAlertSeverity(value: AlertSeverity): AlertRecord["severity"] {
  switch (value) {
    case "CRITICAL":
      return "critical";
    case "WARNING":
      return "warning";
    default:
      return "info";
  }
}

function mapMembershipStatus(value: MembershipStatus): WalletMember["status"] {
  return value === "ACTIVE" ? "active" : "pending";
}

function mapSupportPriority(value: SupportPriority): SupportCase["priority"] {
  switch (value) {
    case "HIGH":
      return "high";
    case "URGENT":
      return "high";
    case "LOW":
      return "low";
    default:
      return "normal";
  }
}

function mapSupportStatus(value: SupportStatus): SupportCase["status"] {
  switch (value) {
    case "IN_PROGRESS":
      return "in_progress";
    case "RESOLVED":
    case "CLOSED":
      return "resolved";
    default:
      return "open";
  }
}

function mapWalletRole(value: WalletRole): WalletMember["role"] {
  return value.toLowerCase() as WalletMember["role"];
}

function ensureCapability(role: WalletRole, capability: Capability) {
  if (!hasCapability(role, capability)) {
    throw new Error("You do not have permission to view this area.");
  }
}

function jsonRecord(value: Prisma.JsonValue | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, recordValue]) => [key, String(recordValue)])
  );
}

async function getWalletSettingMap(walletId: string, userId?: string) {
  const whereClauses: Prisma.SettingWhereInput[] = [
    { scope: "WALLET", walletId, userId: null }
  ];

  if (userId) {
    whereClauses.push({ scope: "USER", walletId, userId });
  }

  const settings = await prisma.setting.findMany({
    where: {
      OR: whereClauses
    }
  });

  return Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
}

function mapProvider(provider: {
  id: string;
  providerName: string;
  category: ProviderCategory;
  displayLabel: string | null;
  connectedAccountLabel: string | null;
  status: ProviderStatus;
  healthStatus: string;
  connectionMethod: string;
  syncState: string;
  dashboardUrl: string | null;
  billingUrl: string | null;
  editUrl: string | null;
  supportUrl: string | null;
  ownerDescription: string | null;
  metadata: Prisma.JsonValue | null;
  monthlyCostEstimate: Prisma.Decimal | null;
  renewalDate: Date | null;
  lastSyncAt?: Date | null;
  lastHealthCheckAt?: Date | null;
}): ProviderRecord {
  return {
    id: provider.id,
    name: provider.providerName,
    category: mapProviderCategory(provider.category),
    label: provider.displayLabel ?? humanizeEnum(provider.category),
    accountLabel: provider.connectedAccountLabel ?? provider.providerName,
    status: humanizeEnum(provider.status),
    health: mapHealthStatus(provider.healthStatus),
    connectionMethod: humanizeEnum(provider.connectionMethod),
    syncState: humanizeEnum(provider.syncState),
    dashboardUrl: provider.dashboardUrl ?? "",
    billingUrl: provider.billingUrl ?? undefined,
    editUrl: provider.editUrl ?? undefined,
    supportUrl: provider.supportUrl ?? undefined,
    monthlyCost: toNumber(provider.monthlyCostEstimate),
    renewalDate: provider.renewalDate?.toISOString(),
    lastSyncAt: provider.lastSyncAt?.toISOString() ?? null,
    lastHealthCheckAt: provider.lastHealthCheckAt?.toISOString() ?? null,
    ownerDescription:
      provider.ownerDescription ?? "This connected tool is part of the website stack for this wallet.",
    metadata: jsonRecord(provider.metadata)
  };
}

function mapActivity(log: {
  id: string;
  action: string;
  summary: string;
  createdAt: Date;
  actorType: string;
  actorUser: { name: string | null; email: string } | null;
}): ActivityRecord {
  return {
    id: log.id,
    actor:
      log.actorUser?.name ??
      log.actorUser?.email ??
      (log.actorType === "SYSTEM" ? "RAEYL System" : humanizeEnum(log.actorType)),
    action: humanizeEnum(log.action.replace(/\./g, "_")),
    detail: log.summary,
    createdAt: log.createdAt.toISOString()
  };
}

export async function listWalletsForUser(userId: string) {
  const memberships = await prisma.walletMembership.findMany({
    where: {
      userId,
      status: MembershipStatus.ACTIVE
    },
    include: {
      wallet: {
        select: {
          id: true,
          businessName: true,
          websiteUrl: true,
          planTier: true,
          handoffStatus: true,
          _count: {
            select: {
              providers: true,
              websites: true,
              alerts: {
                where: {
                  status: AlertStatus.OPEN
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  return memberships.map((membership) => ({
    id: membership.wallet.id,
    businessName: membership.wallet.businessName,
    websiteUrl: membership.wallet.websiteUrl,
    planTier: membership.wallet.planTier ?? "Starter",
    handoffStatus: humanizeEnum(membership.wallet.handoffStatus),
    role: humanizeEnum(membership.role),
    membershipStatus: humanizeEnum(membership.status),
    providerCount: membership.wallet._count.providers,
    websiteCount: membership.wallet._count.websites,
    alertCount: membership.wallet._count.alerts
  }));
}

export async function getFirstWalletIdForUser(userId: string) {
  const membership = await prisma.walletMembership.findFirst({
    where: {
      userId,
      status: MembershipStatus.ACTIVE
    },
    select: {
      walletId: true
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  return membership?.walletId ?? null;
}

export async function getWalletDashboardData(walletId: string, userId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: walletAccessWhere(walletId, userId),
    include: {
      memberships: {
        where: {
          userId,
          status: MembershipStatus.ACTIVE
        },
        select: {
          role: true
        }
      },
      websites: {
        orderBy: {
          createdAt: "asc"
        },
        include: {
          editRoutes: {
            where: {
              isEnabled: true
            },
            orderBy: [
              { isPrimary: "desc" },
              { sortOrder: "asc" }
            ]
          }
        }
      },
      providers: {
        orderBy: {
          updatedAt: "desc"
        }
      },
      alerts: {
        where: {
          status: AlertStatus.OPEN
        },
        orderBy: [
          { severity: "desc" },
          { createdAt: "desc" }
        ]
      },
      billingRecords: {
        where: {
          status: {
            in: [BillingStatus.ACTIVE, BillingStatus.TRIALING, BillingStatus.PAST_DUE]
          }
        },
        orderBy: [
          { renewalDate: "asc" },
          { createdAt: "desc" }
        ]
      },
      auditLogs: {
        orderBy: {
          createdAt: "desc"
        },
        take: 8,
        include: {
          actorUser: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    }
  });

  if (!wallet) {
    notFound();
  }

  const role = wallet.memberships[0]?.role;
  if (!role) {
    notFound();
  }

  ensureCapability(role, "wallet.read");

  const settingMap = await getWalletSettingMap(wallet.id, userId);
  const templateSlug = typeof settingMap.walletTemplate === "string" ? settingMap.walletTemplate : null;
  const walletTemplate = getWalletTemplateBySlug(templateSlug);
  const ownerWalkthroughDismissed = settingMap.ownerWalkthroughDismissed === true;

  const providers = wallet.providers.map(mapProvider);
  const websites = wallet.websites.map((website) => ({
    id: website.id,
    name: website.name,
    primaryDomain: website.primaryDomain ?? "Not connected yet",
    productionUrl: website.productionUrl ?? "",
    stagingUrl: website.stagingUrl ?? undefined,
    category: website.siteCategory ?? "Website",
    framework: website.framework ?? "Not documented yet",
    launchDate: website.launchDate?.toISOString() ?? wallet.createdAt.toISOString(),
    status: humanizeEnum(website.status),
    editRoutes: website.editRoutes.map((route) => ({
      id: route.id,
      label: route.label,
      description: route.description ?? "Open the connected editing destination.",
      destinationUrl: route.destinationUrl,
      providerName: providers.find((provider) => provider.id === route.providerId)?.name ?? "Connected tool",
      isPrimary: route.isPrimary
    }))
  }));

  const billing = wallet.billingRecords.map((record) => ({
    id: record.id,
    label: record.label,
    amount: toNumber(record.amount),
    cadence: record.cadence === "ANNUAL" ? "annual" : "monthly",
    nextRenewal: (record.renewalDate ?? record.updatedAt).toISOString(),
    type: record.sourceType === "RAEYL_SUBSCRIPTION" ? "raeyl" : "provider",
    providerId: record.providerConnectionId ?? undefined,
    description: record.description ?? "Website cost tracked in this wallet."
  })) satisfies BillingRecordView[];

  const alerts = wallet.alerts.map((alert) => ({
    id: alert.id,
    severity: mapAlertSeverity(alert.severity),
    title: alert.title,
    message: alert.message,
    recommendation: alert.recommendation ?? "Review this item and confirm the next step.",
    providerId: alert.providerConnectionId ?? undefined,
    status: alert.status.toLowerCase() as AlertRecord["status"],
    createdAt: alert.createdAt.toISOString()
  })) satisfies AlertRecord[];

  const activity = wallet.auditLogs.map(mapActivity);

  const websiteStatus =
    alerts.find((alert) => alert.severity === "critical")
      ? "Issue detected"
      : alerts.length
        ? "Attention needed"
        : "Healthy";

  return {
    wallet: {
      id: wallet.id,
      businessName: wallet.businessName,
      websiteUrl: wallet.websiteUrl ?? websites[0]?.productionUrl ?? "Website address not added yet",
      planTier: wallet.planTier ?? "Starter",
      handoffStatus: humanizeEnum(wallet.handoffStatus),
      setupStatus: humanizeEnum(wallet.setupStatus),
      monthlyCost: billing.reduce((total, record) => total + record.amount, 0),
      urgentAlerts: alerts.filter((alert) => ["critical", "warning"].includes(alert.severity)).length,
      ownerWalkthroughDismissed,
      template: walletTemplate,
      providers,
      websites,
      alerts,
      billing,
      activity
    },
    membershipRole: role
  };
}

export async function getWalletProvidersData(walletId: string, userId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: walletAccessWhere(walletId, userId),
    include: {
      memberships: {
        where: {
          userId,
          status: MembershipStatus.ACTIVE
        },
        select: {
          role: true
        }
      },
      providers: {
        orderBy: {
          updatedAt: "desc"
        }
      }
    }
  });

  if (!wallet) {
    notFound();
  }

  const role = wallet.memberships[0]?.role;
  if (!role) {
    notFound();
  }

  ensureCapability(role, "provider.read");

  const settingMap = await getWalletSettingMap(wallet.id, userId);
  const templateSlug = typeof settingMap.walletTemplate === "string" ? settingMap.walletTemplate : null;

  return {
    walletContext: {
      id: wallet.id,
      businessName: wallet.businessName,
      planTier: wallet.planTier ?? "Starter",
      role: role.toLowerCase()
    },
    providers: wallet.providers.map(mapProvider),
    templateSlug
  };
}

export async function getWalletProviderDetailData(walletId: string, providerId: string, userId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: walletAccessWhere(walletId, userId),
    include: {
      memberships: {
        where: {
          userId,
          status: MembershipStatus.ACTIVE
        },
        select: {
          role: true
        }
      },
        providers: {
          where: {
            id: providerId
          },
          include: {
            secrets: {
              orderBy: {
                createdAt: "desc"
              },
              take: 5
            },
            billingRecords: {
              orderBy: {
                createdAt: "desc"
            },
            take: 5
          }
        }
      }
    }
  });

  if (!wallet) {
    notFound();
  }

  const role = wallet.memberships[0]?.role;
  if (!role) {
    notFound();
  }

  ensureCapability(role, "provider.read");

  const providerRecord = wallet.providers[0];
  if (!providerRecord) {
    notFound();
  }

  const provider = mapProvider(providerRecord);
  const templateSlug =
    (typeof providerRecord.metadata === "object" &&
    providerRecord.metadata &&
    !Array.isArray(providerRecord.metadata) &&
    "providerTemplateSlug" in providerRecord.metadata &&
    typeof providerRecord.metadata.providerTemplateSlug === "string")
      ? providerRecord.metadata.providerTemplateSlug
      : null;

  return {
    walletContext: {
      id: wallet.id,
      businessName: wallet.businessName,
      planTier: wallet.planTier ?? "Starter",
      role: role.toLowerCase()
    },
      provider: {
        ...provider,
        templateSlug,
        websiteId: providerRecord.websiteId ?? null,
        credentials: providerRecord.secrets.map((secret) => ({
          id: secret.id,
          type: humanizeEnum(secret.secretType),
          status: humanizeEnum(secret.status),
          maskedPreview: secret.maskedPreview ?? "Stored securely",
          expiresAt: secret.expiresAt?.toISOString() ?? null
        }))
      },
    recentBilling: providerRecord.billingRecords.map((record) => ({
      id: record.id,
      label: record.label,
      amount: toNumber(record.amount),
      status: humanizeEnum(record.status),
      renewalDate: record.renewalDate?.toISOString() ?? null
    }))
  };
}

export async function getWalletBillingData(walletId: string, userId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: walletAccessWhere(walletId, userId),
    include: {
      memberships: {
        where: {
          userId,
          status: MembershipStatus.ACTIVE
        },
        select: {
          role: true
        }
      },
      billingRecords: {
        orderBy: [
          { renewalDate: "asc" },
          { createdAt: "desc" }
        ]
      },
      providers: {
        orderBy: {
          displayLabel: "asc"
        }
      },
      subscriptions: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }
    }
  });

  if (!wallet) {
    notFound();
  }

  const role = wallet.memberships[0]?.role;
  if (!role) {
    notFound();
  }

  ensureCapability(role, "billing.read");

  const monthlyEquivalent = (record: (typeof wallet.billingRecords)[number]) => {
    const amount = toNumber(record.amount);

    switch (record.cadence) {
      case "ANNUAL":
        return amount / 12;
      case "QUARTERLY":
        return amount / 3;
      case "ONE_TIME":
        return 0;
      default:
        return amount;
    }
  };

  const records = wallet.billingRecords.map((record) => ({
    id: record.id,
    label: record.label,
    description: record.description ?? "Website cost tracked in this wallet.",
    amount: toNumber(record.amount),
    nextRenewal: record.renewalDate?.toISOString() ?? record.updatedAt.toISOString(),
    status: humanizeEnum(record.status),
    cadence: humanizeEnum(record.cadence),
    sourceType: record.sourceType,
    isOwnerManaged: record.isOwnerManaged,
    monthlyEquivalent: monthlyEquivalent(record),
    billingUrl: record.billingUrl,
    invoiceUrl: record.invoiceUrl,
    renewalDate: record.renewalDate?.toISOString() ?? null,
    providerConnectionId: record.providerConnectionId,
    currency: record.currency,
    providerReference: record.providerReference ?? undefined
  }));

  const subscriptionRecord = wallet.subscriptions[0];
  const subscriptionInvoices = records.filter((record) => record.sourceType === "RAEYL_SUBSCRIPTION");

  return {
    walletContext: {
      id: wallet.id,
      businessName: wallet.businessName,
      planTier: wallet.planTier ?? "Starter",
      role: role.toLowerCase()
    },
    totalMonthlyEstimate: wallet.billingRecords.reduce((total, record) => total + monthlyEquivalent(record), 0),
    records,
    providers: wallet.providers.map((provider) => ({
      id: provider.id,
      label: provider.displayLabel ?? provider.providerName
    })),
    subscription: subscriptionRecord
      ? {
          id: subscriptionRecord.id,
          planKey: subscriptionRecord.planKey,
          status: humanizeEnum(subscriptionRecord.status),
          currentPeriodEnd: subscriptionRecord.currentPeriodEnd?.toISOString() ?? null,
          currentPeriodStart: subscriptionRecord.currentPeriodStart?.toISOString() ?? null,
          cancelAtPeriodEnd: subscriptionRecord.cancelAtPeriodEnd
        }
      : null,
    invoiceHistory: subscriptionInvoices,
    billingConfig: getBillingConfigurationSummary(wallet.planTier)
  };
}

export async function getNotificationsData(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      channel: "IN_APP",
      OR: [
        {
          walletId: null
        },
        {
          wallet: {
            memberships: {
              some: {
                userId,
                status: MembershipStatus.ACTIVE
              }
            }
          }
        }
      ]
    },
    include: {
      wallet: {
        select: {
          id: true,
          businessName: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 40
  });

  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  return {
    unreadCount,
    notifications: notifications.map((notification) => ({
      id: notification.id,
      subject: notification.subject ?? humanizeEnum(notification.type),
      body: notification.body,
      createdAt: notification.createdAt.toISOString(),
      status: humanizeEnum(notification.status),
      isRead: Boolean(notification.readAt),
      ctaUrl: notification.ctaUrl,
      wallet: notification.wallet
    }))
  };
}

export async function getNotificationPreferencesData(userId: string) {
  const preferences = await prisma.notificationPreference.findMany({
    where: {
      userId
    },
    orderBy: [
      { type: "asc" },
      { channel: "asc" }
    ]
  });

  const defaults = [
    { type: "INVITE", label: "Ownership and invite updates" },
    { type: "HANDOFF", label: "Handoff milestones" },
    { type: "BILLING", label: "Billing notices" },
    { type: "SUPPORT", label: "Support updates" },
    { type: "ALERT", label: "Website alerts" },
    { type: "SYSTEM", label: "System notices" }
  ] as const;

  return defaults.map((item) => {
    const inApp = preferences.find(
      (preference) => preference.type === item.type && preference.channel === "IN_APP"
    );
    const email = preferences.find(
      (preference) => preference.type === item.type && preference.channel === "EMAIL"
    );

    return {
      type: item.type,
      label: item.label,
      inApp: inApp?.isEnabled ?? true,
      email: email?.isEnabled ?? false
    };
  });
}

export async function getWalletSupportData(walletId: string, userId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: walletAccessWhere(walletId, userId),
    include: {
      memberships: {
        where: {
          userId,
          status: MembershipStatus.ACTIVE
        },
        select: {
          role: true
        }
      },
      providers: {
        orderBy: {
          displayLabel: "asc"
        }
      },
        supportRequests: {
          orderBy: {
            createdAt: "desc"
          },
          include: {
          providerConnection: {
            select: {
              displayLabel: true,
              providerName: true
            }
          },
            requester: {
              select: {
                name: true,
                email: true
              }
            },
            messages: {
              orderBy: {
                createdAt: "desc"
              },
              take: 3,
              include: {
                author: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
    }
  });

  if (!wallet) {
    notFound();
  }

  const role = wallet.memberships[0]?.role;
  if (!role) {
    notFound();
  }

  ensureCapability(role, "support.read");

  return {
    walletContext: {
      id: wallet.id,
      businessName: wallet.businessName,
      planTier: wallet.planTier ?? "Starter",
      role: role.toLowerCase()
    },
    providers: wallet.providers.map((provider) => ({
      id: provider.id,
      label: provider.displayLabel ?? provider.providerName
    })),
      supportCases: wallet.supportRequests.map((item) => ({
        id: item.id,
        subject: item.subject,
        category: item.category,
        priority: mapSupportPriority(item.priority),
        status: mapSupportStatus(item.status),
        relatedProvider:
          item.providerConnection?.displayLabel ?? item.providerConnection?.providerName ?? undefined,
        createdAt: item.createdAt.toISOString(),
        requester: item.requester?.name ?? item.requester?.email ?? "RAEYL user",
        recentMessages: item.messages.map((message) => ({
          id: message.id,
          body: message.body,
          createdAt: message.createdAt.toISOString(),
          author: message.author?.name ?? message.author?.email ?? "RAEYL user",
          isInternal: message.isInternal
        }))
      }))
    };
  }

export async function getWalletHandoffData(walletId: string, userId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: walletAccessWhere(walletId, userId),
    include: {
      memberships: {
        where: {
          userId,
          status: MembershipStatus.ACTIVE
        },
        select: {
          role: true
        }
      },
      invites: {
        where: {
          inviteType: "OWNER_HANDOFF"
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5
      },
      handoffRecords: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      },
      auditLogs: {
        where: {
          action: {
            in: [
              "wallet.created",
              "invite.sent",
              "invite.accepted",
              "handoff.completed",
              "provider.created",
              "website.created"
            ]
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 12,
        include: {
          actorUser: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    }
  });

  if (!wallet) {
    notFound();
  }

  const role = wallet.memberships[0]?.role;
  if (!role) {
    notFound();
  }

  ensureCapability(role, "handoff.manage");

  const readiness = await getHandoffReadiness(walletId);
  const latestInvite = wallet.invites[0] ?? null;
  const latestRecord = wallet.handoffRecords[0] ?? null;

  // Fetch first website ID for checklist links
  const firstWebsite = await prisma.website.findFirst({
    where: { walletId },
    orderBy: { createdAt: "asc" },
    select: { id: true }
  });

  return {
    walletContext: {
      id: wallet.id,
      businessName: wallet.businessName,
      planTier: wallet.planTier ?? "Starter",
      role: role.toLowerCase()
    },
    ownerEmail: wallet.ownerEmail,
    handoffStatus: humanizeEnum(wallet.handoffStatus),
    ownerAcceptanceStatus: humanizeEnum(wallet.ownerAcceptanceStatus),
    firstWebsiteId: firstWebsite?.id ?? null,
    readiness,
    latestInvite: latestInvite
      ? {
          email: latestInvite.email,
          status: humanizeEnum(latestInvite.status),
          expiresAt: latestInvite.expiresAt.toISOString(),
          acceptedAt: latestInvite.acceptedAt?.toISOString() ?? null
        }
      : null,
    latestRecord: latestRecord
      ? {
          status: humanizeEnum(latestRecord.status),
          completedAt: latestRecord.completedAt?.toISOString() ?? null
        }
      : null,
    timeline: wallet.auditLogs.map(mapActivity)
  };
}

export async function getWalletAccessData(walletId: string, userId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: walletAccessWhere(walletId, userId),
    include: {
      memberships: {
        orderBy: {
          createdAt: "asc"
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      invites: {
        where: {
          status: {
            in: ["SENT", "VIEWED"]
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  if (!wallet) {
    notFound();
  }

  const currentMembership = wallet.memberships.find(
    (membership) => membership.userId === userId && membership.status === MembershipStatus.ACTIVE
  );

  if (!currentMembership) {
    notFound();
  }

  ensureCapability(currentMembership.role, "access.manage");

  return {
    walletContext: {
      id: wallet.id,
      businessName: wallet.businessName,
      planTier: wallet.planTier ?? "Starter",
      role: currentMembership.role.toLowerCase()
    },
    members: wallet.memberships.map((member) => ({
      id: member.id,
      userId: member.userId,
      name: member.user.name ?? member.user.email,
      email: member.user.email,
      role: mapWalletRole(member.role),
      status: mapMembershipStatus(member.status),
      isPrimaryOwner: member.isPrimaryOwner,
      isPrimaryDeveloper: member.isPrimaryDeveloper
    })),
    pendingInvites: wallet.invites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      role: humanizeEnum(invite.role),
      status: humanizeEnum(invite.status),
      expiresAt: invite.expiresAt.toISOString()
    }))
  };
}

export async function getWalletActivityData(walletId: string, userId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: walletAccessWhere(walletId, userId),
    include: {
      memberships: {
        where: {
          userId,
          status: MembershipStatus.ACTIVE
        },
        select: {
          role: true
        }
      },
      auditLogs: {
        orderBy: {
          createdAt: "desc"
        },
        take: 50,
        include: {
          actorUser: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    }
  });

  if (!wallet) {
    notFound();
  }

  const role = wallet.memberships[0]?.role;
  if (!role) {
    notFound();
  }

  ensureCapability(role, "wallet.read");

  return {
    walletContext: {
      id: wallet.id,
      businessName: wallet.businessName,
      planTier: wallet.planTier ?? "Starter",
      role: role.toLowerCase()
    },
    activity: wallet.auditLogs.map(mapActivity)
  };
}

export async function getWalletSetupData(walletId: string, userId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: walletAccessWhere(walletId, userId),
    include: {
      memberships: {
        where: {
          userId,
          status: MembershipStatus.ACTIVE
        },
        select: {
          role: true
        }
      },
      websites: {
        orderBy: {
          createdAt: "asc"
        },
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!wallet) {
    notFound();
  }

  const role = wallet.memberships[0]?.role;
  if (!role) {
    notFound();
  }

  ensureCapability(role, "wallet.read");

  const settingMap = await getWalletSettingMap(wallet.id, userId);
  const templateSlug = typeof settingMap.walletTemplate === "string" ? settingMap.walletTemplate : null;
  const walletTemplate = getWalletTemplateBySlug(templateSlug);

  return {
    walletContext: {
      id: wallet.id,
      businessName: wallet.businessName,
      planTier: wallet.planTier ?? "Starter",
      role: role.toLowerCase()
    },
    websites: wallet.websites,
    walletTemplate
  };
}

export async function getWalletAlertsData(walletId: string, userId: string) {
  const data = await getWalletDashboardData(walletId, userId);
  return {
    walletContext: {
      id: data.wallet.id,
      businessName: data.wallet.businessName,
      planTier: data.wallet.planTier
    },
    alerts: data.wallet.alerts
  };
}

export async function getWalletSettingsData(walletId: string, userId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: walletAccessWhere(walletId, userId),
    include: {
      memberships: {
        where: {
          userId,
          status: MembershipStatus.ACTIVE
        },
        select: {
          role: true
        }
      }
    }
  });

  if (!wallet) {
    notFound();
  }

  const role = wallet.memberships[0]?.role;
  if (!role) {
    notFound();
  }

  ensureCapability(role, "settings.read");

  return {
    walletContext: {
      id: wallet.id,
      businessName: wallet.businessName,
      planTier: wallet.planTier ?? "Starter",
      role: role.toLowerCase()
    },
    wallet
  };
}

export async function getWalletFormData(walletId: string, userId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: walletAccessWhere(walletId, userId),
    include: {
      memberships: {
        where: {
          userId,
          status: MembershipStatus.ACTIVE
        },
        select: {
          role: true
        }
      },
      websites: {
        orderBy: {
          createdAt: "asc"
        },
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!wallet) {
    notFound();
  }

  const role = wallet.memberships[0]?.role;
  if (!role) {
    notFound();
  }

  ensureCapability(role, "wallet.write");

  return {
    walletContext: {
      id: wallet.id,
      businessName: wallet.businessName,
      planTier: wallet.planTier ?? "Starter",
      role: role.toLowerCase()
    },
    websites: wallet.websites
  };
}

export async function getWalletWebsiteDetailData(walletId: string, websiteId: string, userId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: walletAccessWhere(walletId, userId),
    include: {
      memberships: {
        where: {
          userId,
          status: MembershipStatus.ACTIVE
        },
        select: {
          role: true
        }
      },
      websites: {
        where: {
          id: websiteId
        },
        include: {
          editRoutes: {
            where: {
              isEnabled: true
            },
            orderBy: [
              { isPrimary: "desc" },
              { sortOrder: "asc" }
            ]
          }
        }
      },
      providers: {
        where: {
          websiteId
        },
        orderBy: {
          updatedAt: "desc"
        }
      }
    }
  });

  if (!wallet) {
    notFound();
  }

  const role = wallet.memberships[0]?.role;
  if (!role) {
    notFound();
  }

  ensureCapability(role, "wallet.read");

  const website = wallet.websites[0];
  if (!website) {
    notFound();
  }

  return {
    walletContext: {
      id: wallet.id,
      businessName: wallet.businessName,
      planTier: wallet.planTier ?? "Starter",
      websiteId: website.id,
      role: role.toLowerCase()
    },
    website: {
      id: website.id,
      name: website.name,
      primaryDomain: website.primaryDomain ?? "Not connected yet",
      productionUrl: website.productionUrl,
      stagingUrl: website.stagingUrl,
      framework: website.framework ?? "Not documented yet",
      status: humanizeEnum(website.status),
      editRoutes: website.editRoutes.map((route) => ({
        id: route.id,
        label: route.label,
        description: route.description ?? "Open the connected editing destination.",
        destinationUrl: route.destinationUrl,
        isPrimary: route.isPrimary
      }))
    },
    providers: wallet.providers.map(mapProvider)
  };
}

export async function getAdminSupportData() {
  const requests = await prisma.supportRequest.findMany({
    include: {
      wallet: {
        select: {
          businessName: true
        }
      },
      providerConnection: {
        select: {
          displayLabel: true,
          providerName: true
        }
      },
      requester: {
        select: {
          name: true,
          email: true
        }
      },
      messages: {
        orderBy: {
          createdAt: "desc"
        },
        take: 3,
        include: {
          author: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "desc" }
    ],
    take: 40
  });

    return requests.map((request) => ({
      id: request.id,
      subject: request.subject,
      category: request.category,
      priority: humanizeEnum(request.priority),
      status: humanizeEnum(request.status),
      walletName: request.wallet.businessName,
      provider:
        request.providerConnection?.displayLabel ?? request.providerConnection?.providerName ?? null,
      createdAt: request.createdAt.toISOString(),
      requester: request.requester?.name ?? request.requester?.email ?? "RAEYL user",
      messages: request.messages.length,
      recentMessages: request.messages.map((message) => ({
        id: message.id,
        body: message.body,
        author: message.author?.name ?? message.author?.email ?? "RAEYL user",
        createdAt: message.createdAt.toISOString(),
        isInternal: message.isInternal
      }))
    }));
  }

export async function getAdminAlertsData() {
  const alerts = await prisma.alert.findMany({
    where: {
      status: AlertStatus.OPEN
    },
    include: {
      wallet: {
        select: {
          businessName: true
        }
      },
      providerConnection: {
        select: {
          displayLabel: true,
          providerName: true
        }
      }
    },
    orderBy: [
      { severity: "desc" },
      { createdAt: "desc" }
    ],
    take: 50
  });

  return alerts.map((alert) => ({
    id: alert.id,
    title: alert.title,
    severity: humanizeEnum(alert.severity),
    walletName: alert.wallet.businessName,
    provider:
      alert.providerConnection?.displayLabel ?? alert.providerConnection?.providerName ?? null,
    recommendation: alert.recommendation,
    createdAt: alert.createdAt.toISOString()
  }));
}

export async function getAdminAuditData() {
  const logs = await prisma.auditLog.findMany({
    include: {
      wallet: {
        select: {
          businessName: true
        }
      },
      actorUser: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 60
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    summary: log.summary,
    walletName: log.wallet?.businessName ?? "Platform-wide",
    actor: log.actorUser?.name ?? log.actorUser?.email ?? humanizeEnum(log.actorType),
    createdAt: log.createdAt.toISOString()
  }));
}

export type UserPreferences = {
  defaultLandingPage: "overview" | "wallets" | "notifications";
  compactMode: boolean;
  dateFormat: "relative" | "absolute";
};

const PREFERENCE_DEFAULTS: UserPreferences = {
  defaultLandingPage: "overview",
  compactMode: false,
  dateFormat: "relative"
};

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const settings = await prisma.setting.findMany({
    where: {
      scope: "USER",
      userId,
      key: { in: ["defaultLandingPage", "compactMode", "dateFormat"] }
    }
  });

  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return {
    defaultLandingPage: (map.defaultLandingPage as UserPreferences["defaultLandingPage"]) ?? PREFERENCE_DEFAULTS.defaultLandingPage,
    compactMode: (map.compactMode as boolean) ?? PREFERENCE_DEFAULTS.compactMode,
    dateFormat: (map.dateFormat as UserPreferences["dateFormat"]) ?? PREFERENCE_DEFAULTS.dateFormat
  };
}
