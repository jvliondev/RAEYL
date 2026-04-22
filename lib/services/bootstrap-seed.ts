import crypto from "node:crypto";

import bcrypt from "bcryptjs";
import { Prisma, type PrismaClient } from "@prisma/client/index";

type BootstrapSummary = {
  users: number;
  wallets: number;
  websites: number;
  providers: number;
  billingRecords: number;
  notifications: number;
  supportRequests: number;
};

function hashToken(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function ensureBillingRecord(
  prisma: PrismaClient,
  walletId: string,
  label: string,
  data: Omit<Prisma.BillingRecordUncheckedCreateInput, "walletId" | "label">
) {
  const existing = await prisma.billingRecord.findFirst({
    where: {
      walletId,
      label
    },
    select: { id: true }
  });

  if (existing) {
    return prisma.billingRecord.update({
      where: { id: existing.id },
      data
    });
  }

  return prisma.billingRecord.create({
    data: {
      walletId,
      label,
      ...data
    }
  });
}

async function ensureAlert(
  prisma: PrismaClient,
  walletId: string,
  title: string,
  data: Omit<Prisma.AlertUncheckedCreateInput, "walletId" | "title">
) {
  const existing = await prisma.alert.findFirst({
    where: {
      walletId,
      title,
      status: "OPEN"
    },
    select: { id: true }
  });

  if (existing) {
    return prisma.alert.update({
      where: { id: existing.id },
      data
    });
  }

  return prisma.alert.create({
    data: {
      walletId,
      title,
      ...data
    }
  });
}

async function ensureNotification(
  prisma: PrismaClient,
  userId: string,
  subject: string,
  data: Omit<Prisma.NotificationUncheckedCreateInput, "userId" | "subject">
) {
  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      subject
    },
    select: { id: true }
  });

  if (existing) {
    return prisma.notification.update({
      where: { id: existing.id },
      data
    });
  }

  return prisma.notification.create({
    data: {
      userId,
      subject,
      ...data
    }
  });
}

async function ensureSupportRequest(
  prisma: PrismaClient,
  walletId: string,
  subject: string,
  data: Omit<Prisma.SupportRequestUncheckedCreateInput, "walletId" | "subject">
) {
  const existing = await prisma.supportRequest.findFirst({
    where: {
      walletId,
      subject
    },
    select: { id: true }
  });

  if (existing) {
    return prisma.supportRequest.update({
      where: { id: existing.id },
      data
    });
  }

  return prisma.supportRequest.create({
    data: {
      walletId,
      subject,
      ...data
    }
  });
}

export async function runBootstrapSeed(prisma: PrismaClient): Promise<BootstrapSummary> {
  const developerEmail = "alex@northline.studio";
  const ownerEmail = "maya@evergreendental.com";
  const adminEmail = "admin@raeyl.app";

  const [developerPasswordHash, ownerPasswordHash, adminPasswordHash] = await Promise.all([
    bcrypt.hash("NorthlineDemo123", 12),
    bcrypt.hash("EvergreenOwner123", 12),
    bcrypt.hash("RaeylAdmin123", 12)
  ]);

  const developer = await prisma.user.upsert({
    where: { email: developerEmail },
    update: {
      name: "Alex Morgan",
      passwordHash: developerPasswordHash,
      type: "PARTNER",
      status: "ACTIVE"
    },
    create: {
      email: developerEmail,
      name: "Alex Morgan",
      passwordHash: developerPasswordHash,
      type: "PARTNER",
      status: "ACTIVE"
    }
  });

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {
      name: "Maya Bennett",
      passwordHash: ownerPasswordHash,
      status: "ACTIVE"
    },
    create: {
      email: ownerEmail,
      name: "Maya Bennett",
      passwordHash: ownerPasswordHash,
      status: "ACTIVE"
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "RAEYL Admin",
      passwordHash: adminPasswordHash,
      type: "ADMIN",
      status: "ACTIVE"
    },
    create: {
      email: adminEmail,
      name: "RAEYL Admin",
      passwordHash: adminPasswordHash,
      type: "ADMIN",
      status: "ACTIVE"
    }
  });

  const partnerAccount = await prisma.partnerAccount.upsert({
    where: { userId: developer.id },
    update: {
      displayName: "Northline Studio",
      status: "ACTIVE",
      commissionRateBps: 1500
    },
    create: {
      userId: developer.id,
      displayName: "Northline Studio",
      status: "ACTIVE",
      commissionRateBps: 1500
    }
  });

  const wallet = await prisma.wallet.upsert({
    where: { slug: "evergreen-dental" },
    update: {
      name: "Evergreen Dental Wallet",
      businessName: "Evergreen Dental Studio",
      websiteUrl: "https://evergreendental.com",
      ownerContactName: "Maya Bennett",
      ownerEmail,
      ownerPhone: "(312) 555-0149",
      websiteName: "Evergreen Dental",
      websiteDescription: "Modern cosmetic and family dentistry website with online booking and content-managed marketing pages.",
      timezone: "America/Chicago",
      planTier: "Growth",
      status: "ACTIVE",
      handoffStatus: "COMPLETED",
      ownerAcceptanceStatus: "ACCEPTED",
      setupStatus: "READY",
      createdById: developer.id,
      primaryDeveloperId: developer.id,
      primaryOwnerId: owner.id
    },
    create: {
      slug: "evergreen-dental",
      name: "Evergreen Dental Wallet",
      businessName: "Evergreen Dental Studio",
      websiteUrl: "https://evergreendental.com",
      ownerContactName: "Maya Bennett",
      ownerEmail,
      ownerPhone: "(312) 555-0149",
      websiteName: "Evergreen Dental",
      websiteDescription: "Modern cosmetic and family dentistry website with online booking and content-managed marketing pages.",
      timezone: "America/Chicago",
      planTier: "Growth",
      status: "ACTIVE",
      handoffStatus: "COMPLETED",
      ownerAcceptanceStatus: "ACCEPTED",
      setupStatus: "READY",
      createdById: developer.id,
      primaryDeveloperId: developer.id,
      primaryOwnerId: owner.id
    }
  });

  await prisma.walletMembership.upsert({
    where: {
      walletId_userId: {
        walletId: wallet.id,
        userId: developer.id
      }
    },
    update: {
      role: "DEVELOPER",
      status: "ACTIVE",
      isPrimaryDeveloper: true,
      isPrimaryOwner: false,
      joinedAt: new Date()
    },
    create: {
      walletId: wallet.id,
      userId: developer.id,
      role: "DEVELOPER",
      status: "ACTIVE",
      isPrimaryDeveloper: true,
      joinedAt: new Date()
    }
  });

  await prisma.walletMembership.upsert({
    where: {
      walletId_userId: {
        walletId: wallet.id,
        userId: owner.id
      }
    },
    update: {
      role: "WALLET_OWNER",
      status: "ACTIVE",
      isPrimaryOwner: true,
      isPrimaryDeveloper: false,
      joinedAt: new Date()
    },
    create: {
      walletId: wallet.id,
      userId: owner.id,
      role: "WALLET_OWNER",
      status: "ACTIVE",
      isPrimaryOwner: true,
      joinedAt: new Date()
    }
  });

  const website = await prisma.website.upsert({
    where: {
      walletId_name: {
        walletId: wallet.id,
        name: "Evergreen Dental"
      }
    },
    update: {
      primaryDomain: "evergreendental.com",
      productionUrl: "https://evergreendental.com",
      stagingUrl: "https://staging.evergreendental.com",
      siteCategory: "Healthcare",
      framework: "Next.js + Supabase + Builder.io",
      deploymentNotes: "Production deploys through Vercel. Data layer and auth live in Supabase.",
      launchDate: new Date("2025-11-14T16:00:00.000Z"),
      status: "LIVE"
    },
    create: {
      walletId: wallet.id,
      name: "Evergreen Dental",
      primaryDomain: "evergreendental.com",
      productionUrl: "https://evergreendental.com",
      stagingUrl: "https://staging.evergreendental.com",
      siteCategory: "Healthcare",
      framework: "Next.js + Supabase + Builder.io",
      deploymentNotes: "Production deploys through Vercel. Data layer and auth live in Supabase.",
      launchDate: new Date("2025-11-14T16:00:00.000Z"),
      status: "LIVE"
    }
  });

  const [builderTemplate, vercelTemplate, stripeTemplate] = await Promise.all([
    prisma.providerTemplate.upsert({
      where: { slug: "builder-io" },
      update: {},
      create: {
        slug: "builder-io",
        displayName: "Builder.io",
        category: "CMS",
        connectionMethods: ["MANUAL", "OAUTH", "API_TOKEN"],
        defaultDescription: "Website content editing",
        defaultOwnerLabel: "Website content editing"
      }
    }),
    prisma.providerTemplate.upsert({
      where: { slug: "vercel" },
      update: {},
      create: {
        slug: "vercel",
        displayName: "Vercel",
        category: "HOSTING",
        connectionMethods: ["API_TOKEN", "MANUAL", "OAUTH"],
        defaultDescription: "Website hosting and deployments",
        defaultOwnerLabel: "Website hosting"
      }
    }),
    prisma.providerTemplate.upsert({
      where: { slug: "stripe" },
      update: {},
      create: {
        slug: "stripe",
        displayName: "Stripe",
        category: "PAYMENTS",
        connectionMethods: ["MANUAL", "API_TOKEN", "OAUTH"],
        defaultDescription: "Online payments and invoices",
        defaultOwnerLabel: "Payments"
      }
    })
  ]);

  const existingProviders = await prisma.providerConnection.findMany({
    where: { walletId: wallet.id },
    select: { id: true, providerName: true }
  });

  const findProvider = (name: string) => existingProviders.find((provider) => provider.providerName === name);

  const builderProvider =
    findProvider("Builder.io") &&
    (await prisma.providerConnection.update({
      where: { id: findProvider("Builder.io")!.id },
      data: {
        websiteId: website.id,
        providerTemplateId: builderTemplate.id,
        displayLabel: "Website content editing",
        category: "CMS",
        status: "CONNECTED",
        healthStatus: "HEALTHY",
        syncState: "DISABLED",
        connectedAccountLabel: "Evergreen Content Space",
        dashboardUrl: "https://builder.io/content",
        editUrl: "https://builder.io/content",
        ownerDescription: "This is where page copy, service sections, and blog content are updated.",
        connectionMethod: "MANUAL",
        monthlyCostEstimate: new Prisma.Decimal(95)
      }
    })) ||
    (await prisma.providerConnection.create({
      data: {
        walletId: wallet.id,
        websiteId: website.id,
        providerTemplateId: builderTemplate.id,
        providerName: "Builder.io",
        displayLabel: "Website content editing",
        category: "CMS",
        status: "CONNECTED",
        healthStatus: "HEALTHY",
        syncState: "DISABLED",
        connectedAccountLabel: "Evergreen Content Space",
        dashboardUrl: "https://builder.io/content",
        editUrl: "https://builder.io/content",
        ownerDescription: "This is where page copy, service sections, and blog content are updated.",
        connectionMethod: "MANUAL",
        monthlyCostEstimate: new Prisma.Decimal(95)
      }
    }));

  const vercelProvider =
    findProvider("Vercel") &&
    (await prisma.providerConnection.update({
      where: { id: findProvider("Vercel")!.id },
      data: {
        websiteId: website.id,
        providerTemplateId: vercelTemplate.id,
        displayLabel: "Website hosting",
        category: "HOSTING",
        status: "CONNECTED",
        healthStatus: "ATTENTION_NEEDED",
        syncState: "PENDING",
        connectedAccountLabel: "evergreen-dental-production",
        dashboardUrl: "https://vercel.com/dashboard",
        billingUrl: "https://vercel.com/dashboard/billing",
        supportUrl: "https://vercel.com/help",
        ownerDescription: "This keeps the live website online and handles new deployments from the developer.",
        connectionMethod: "API_TOKEN",
        monthlyCostEstimate: new Prisma.Decimal(24)
      }
    })) ||
    (await prisma.providerConnection.create({
      data: {
        walletId: wallet.id,
        websiteId: website.id,
        providerTemplateId: vercelTemplate.id,
        providerName: "Vercel",
        displayLabel: "Website hosting",
        category: "HOSTING",
        status: "CONNECTED",
        healthStatus: "ATTENTION_NEEDED",
        syncState: "PENDING",
        connectedAccountLabel: "evergreen-dental-production",
        dashboardUrl: "https://vercel.com/dashboard",
        billingUrl: "https://vercel.com/dashboard/billing",
        supportUrl: "https://vercel.com/help",
        ownerDescription: "This keeps the live website online and handles new deployments from the developer.",
        connectionMethod: "API_TOKEN",
        monthlyCostEstimate: new Prisma.Decimal(24)
      }
    }));

  const stripeProvider =
    findProvider("Stripe") &&
    (await prisma.providerConnection.update({
      where: { id: findProvider("Stripe")!.id },
      data: {
        websiteId: website.id,
        providerTemplateId: stripeTemplate.id,
        displayLabel: "Payments",
        category: "PAYMENTS",
        status: "CONNECTED",
        healthStatus: "HEALTHY",
        syncState: "DISABLED",
        connectedAccountLabel: "Evergreen Dental payments",
        dashboardUrl: "https://dashboard.stripe.com",
        billingUrl: "https://dashboard.stripe.com/settings/billing",
        ownerDescription: "Handles online payment collection and stores invoice history for the business.",
        connectionMethod: "MANUAL",
        monthlyCostEstimate: new Prisma.Decimal(0)
      }
    })) ||
    (await prisma.providerConnection.create({
      data: {
        walletId: wallet.id,
        websiteId: website.id,
        providerTemplateId: stripeTemplate.id,
        providerName: "Stripe",
        displayLabel: "Payments",
        category: "PAYMENTS",
        status: "CONNECTED",
        healthStatus: "HEALTHY",
        syncState: "DISABLED",
        connectedAccountLabel: "Evergreen Dental payments",
        dashboardUrl: "https://dashboard.stripe.com",
        billingUrl: "https://dashboard.stripe.com/settings/billing",
        ownerDescription: "Handles online payment collection and stores invoice history for the business.",
        connectionMethod: "MANUAL",
        monthlyCostEstimate: new Prisma.Decimal(0)
      }
    }));

  const existingPrimaryRoute = await prisma.editRoute.findFirst({
    where: {
      walletId: wallet.id,
      websiteId: website.id,
      label: "Edit homepage"
    },
    select: { id: true }
  });

  if (existingPrimaryRoute) {
    await prisma.editRoute.update({
      where: { id: existingPrimaryRoute.id },
      data: {
        providerId: builderProvider.id,
        description: "Update the hero, service highlights, and homepage sections.",
        destinationUrl: "https://builder.io/content/homepage",
        isPrimary: true,
        visibleToRoles: ["WALLET_OWNER", "DEVELOPER", "EDITOR"],
        sortOrder: 0,
        isEnabled: true
      }
    });
  } else {
    await prisma.editRoute.create({
      data: {
        walletId: wallet.id,
        websiteId: website.id,
        providerId: builderProvider.id,
        label: "Edit homepage",
        description: "Update the hero, service highlights, and homepage sections.",
        destinationUrl: "https://builder.io/content/homepage",
        isPrimary: true,
        visibleToRoles: ["WALLET_OWNER", "DEVELOPER", "EDITOR"],
        sortOrder: 0,
        isEnabled: true
      }
    });
  }

  const ownerInvite = await prisma.invite.upsert({
    where: { tokenHash: hashToken("evergreen-owner-invite") },
    update: {
      walletId: wallet.id,
      sentById: developer.id,
      acceptedById: owner.id,
      email: ownerEmail,
      role: "WALLET_OWNER",
      inviteType: "OWNER_HANDOFF",
      status: "ACCEPTED",
      expiresAt: new Date("2026-12-31T00:00:00.000Z"),
      sentAt: new Date("2026-01-05T16:00:00.000Z"),
      viewedAt: new Date("2026-01-05T16:10:00.000Z"),
      acceptedAt: new Date("2026-01-05T16:15:00.000Z")
    },
    create: {
      walletId: wallet.id,
      sentById: developer.id,
      acceptedById: owner.id,
      email: ownerEmail,
      role: "WALLET_OWNER",
      inviteType: "OWNER_HANDOFF",
      status: "ACCEPTED",
      tokenHash: hashToken("evergreen-owner-invite"),
      expiresAt: new Date("2026-12-31T00:00:00.000Z"),
      sentAt: new Date("2026-01-05T16:00:00.000Z"),
      viewedAt: new Date("2026-01-05T16:10:00.000Z"),
      acceptedAt: new Date("2026-01-05T16:15:00.000Z")
    }
  });

  const existingHandoff = await prisma.handoffRecord.findFirst({
    where: { walletId: wallet.id },
    select: { id: true }
  });

  if (existingHandoff) {
    await prisma.handoffRecord.update({
      where: { id: existingHandoff.id },
      data: {
        ownerInviteId: ownerInvite.id,
        completedById: developer.id,
        status: "COMPLETED",
        checklist: {
          website: true,
          providers: true,
          editRoutes: true,
          ownerInvite: true
        },
        summary: "Wallet configured, owner invited, and handoff accepted.",
        startedAt: new Date("2026-01-04T15:00:00.000Z"),
        ownerAcceptedAt: new Date("2026-01-05T16:15:00.000Z"),
        completedAt: new Date("2026-01-05T16:30:00.000Z")
      }
    });
  } else {
    await prisma.handoffRecord.create({
      data: {
        walletId: wallet.id,
        ownerInviteId: ownerInvite.id,
        completedById: developer.id,
        status: "COMPLETED",
        checklist: {
          website: true,
          providers: true,
          editRoutes: true,
          ownerInvite: true
        },
        summary: "Wallet configured, owner invited, and handoff accepted.",
        startedAt: new Date("2026-01-04T15:00:00.000Z"),
        ownerAcceptedAt: new Date("2026-01-05T16:15:00.000Z"),
        completedAt: new Date("2026-01-05T16:30:00.000Z")
      }
    });
  }

  await prisma.walletSubscription.upsert({
    where: {
      stripeSubscriptionId: "sub_demo_evergreen_growth"
    },
    update: {
      walletId: wallet.id,
      provider: "MANUAL",
      planKey: "growth",
      status: "ACTIVE",
      currentPeriodStart: new Date("2026-04-01T00:00:00.000Z"),
      currentPeriodEnd: new Date("2026-05-01T00:00:00.000Z"),
      startedAt: new Date("2026-01-05T16:30:00.000Z")
    },
    create: {
      walletId: wallet.id,
      provider: "MANUAL",
      planKey: "growth",
      status: "ACTIVE",
      stripeSubscriptionId: "sub_demo_evergreen_growth",
      currentPeriodStart: new Date("2026-04-01T00:00:00.000Z"),
      currentPeriodEnd: new Date("2026-05-01T00:00:00.000Z"),
      startedAt: new Date("2026-01-05T16:30:00.000Z")
    }
  });

  await Promise.all([
    ensureBillingRecord(prisma, wallet.id, "RAEYL Growth", {
      sourceType: "RAEYL_SUBSCRIPTION",
      description: "RAEYL wallet subscription for ownership, access, and website control.",
      amount: new Prisma.Decimal(79),
      currency: "USD",
      cadence: "MONTHLY",
      status: "ACTIVE",
      providerReference: "growth-plan",
      invoiceUrl: "https://billing.stripe.com/demo",
      billingUrl: "https://billing.stripe.com/demo",
      renewalDate: new Date("2026-05-01T00:00:00.000Z"),
      isOwnerManaged: true
    }),
    ensureBillingRecord(prisma, wallet.id, "Builder.io", {
      providerConnectionId: builderProvider.id,
      sourceType: "PROVIDER_COST",
      description: "Content management subscription for website pages and updates.",
      amount: new Prisma.Decimal(95),
      currency: "USD",
      cadence: "MONTHLY",
      status: "ACTIVE",
      billingUrl: "https://builder.io/account/billing",
      renewalDate: new Date("2026-05-09T00:00:00.000Z"),
      isOwnerManaged: true
    }),
    ensureBillingRecord(prisma, wallet.id, "Vercel Pro", {
      providerConnectionId: vercelProvider.id,
      sourceType: "PROVIDER_COST",
      description: "Hosting and deployment subscription for the live website.",
      amount: new Prisma.Decimal(24),
      currency: "USD",
      cadence: "MONTHLY",
      status: "ACTIVE",
      billingUrl: "https://vercel.com/dashboard/billing",
      renewalDate: new Date("2026-04-28T00:00:00.000Z"),
      isOwnerManaged: false
    })
  ]);

  await Promise.all([
    ensureAlert(prisma, wallet.id, "Hosting connection needs review", {
      providerConnectionId: vercelProvider.id,
      severity: "WARNING",
      category: "HOSTING_ISSUE",
      message: "The hosting connection is saved, but the API token still needs live verification.",
      recommendation: "Reconnect Vercel with an API token or OAuth so health checks can run automatically."
    }),
    ensureAlert(prisma, wallet.id, "Billing renewal coming up", {
      providerConnectionId: builderProvider.id,
      severity: "INFO",
      category: "RENEWAL_EXPIRING",
      message: "The Builder.io renewal is coming up soon.",
      recommendation: "Review the billing link to confirm the payment method and renewal owner."
    })
  ]);

  const supportRequest = await ensureSupportRequest(prisma, wallet.id, "Add a doctor bio section", {
    providerConnectionId: builderProvider.id,
    requesterId: owner.id,
    category: "content-update",
    priority: "NORMAL",
    status: "OPEN",
    description: "Please add a new section for Dr. Shah with a photo, short bio, and CTA to book an appointment."
  });

  const existingSupportMessage = await prisma.supportMessage.findFirst({
    where: {
      supportRequestId: supportRequest.id,
      body: "We can handle that this week. Please send the headshot and final bio copy."
    },
    select: { id: true }
  });

  if (!existingSupportMessage) {
    await prisma.supportMessage.create({
      data: {
        supportRequestId: supportRequest.id,
        authorId: developer.id,
        body: "We can handle that this week. Please send the headshot and final bio copy.",
        isInternal: false
      }
    });
  }

  await Promise.all([
    ensureNotification(prisma, owner.id, "Your website wallet is ready", {
      walletId: wallet.id,
      type: "HANDOFF",
      channel: "IN_APP",
      status: "DELIVERED",
      body: "Everything is connected and ready to review. Your main editing path is set up.",
      ctaUrl: `/app/wallets/${wallet.id}`,
      deliveredAt: new Date()
    }),
    ensureNotification(prisma, owner.id, "Hosting connection needs a quick review", {
      walletId: wallet.id,
      type: "ALERT",
      channel: "IN_APP",
      status: "DELIVERED",
      body: "The hosting tool is listed, but it still needs live verification for automatic checks.",
      ctaUrl: `/app/wallets/${wallet.id}/providers/${vercelProvider.id}`,
      deliveredAt: new Date()
    }),
    ensureNotification(prisma, developer.id, "Support request received", {
      walletId: wallet.id,
      type: "SUPPORT",
      channel: "IN_APP",
      status: "DELIVERED",
      body: "Maya requested a new doctor bio section for the homepage.",
      ctaUrl: `/app/wallets/${wallet.id}/support`,
      deliveredAt: new Date()
    })
  ]);

  await Promise.all([
    prisma.notificationPreference.upsert({
      where: {
        userId_type_channel: {
          userId: owner.id,
          type: "ALERT",
          channel: "IN_APP"
        }
      },
      update: { isEnabled: true },
      create: {
        userId: owner.id,
        type: "ALERT",
        channel: "IN_APP",
        isEnabled: true
      }
    }),
    prisma.notificationPreference.upsert({
      where: {
        userId_type_channel: {
          userId: owner.id,
          type: "BILLING",
          channel: "EMAIL"
        }
      },
      update: { isEnabled: true },
      create: {
        userId: owner.id,
        type: "BILLING",
        channel: "EMAIL",
        isEnabled: true
      }
    })
  ]);

  await prisma.referral.upsert({
    where: {
      walletId_partnerAccountId: {
        walletId: wallet.id,
        partnerAccountId: partnerAccount.id
      }
    },
    update: {
      status: "ACTIVE",
      attributionSource: "developer_wallet_creation",
      commissionRateBps: 1500,
      activatedAt: new Date("2026-01-05T16:30:00.000Z"),
      commissionWindowEnds: new Date("2027-01-05T16:30:00.000Z")
    },
    create: {
      walletId: wallet.id,
      partnerAccountId: partnerAccount.id,
      referredByUserId: developer.id,
      status: "ACTIVE",
      attributionSource: "developer_wallet_creation",
      commissionRateBps: 1500,
      activatedAt: new Date("2026-01-05T16:30:00.000Z"),
      commissionWindowEnds: new Date("2027-01-05T16:30:00.000Z")
    }
  });

  const auditEvents = [
    {
      action: "wallet.created",
      summary: "Wallet created for Evergreen Dental Studio.",
      actorUserId: developer.id,
      actorType: "USER",
      entityType: "WALLET",
      entityId: wallet.id
    },
    {
      action: "invite.accepted",
      summary: "Owner accepted the handoff invitation.",
      actorUserId: owner.id,
      actorType: "USER",
      entityType: "INVITE",
      entityId: ownerInvite.id
    },
    {
      action: "handoff.completed",
      summary: "Developer completed the Evergreen Dental handoff.",
      actorUserId: developer.id,
      actorType: "USER",
      entityType: "HANDOFF",
      entityId: wallet.id
    }
  ] as const;

  for (const event of auditEvents) {
    const existing = await prisma.auditLog.findFirst({
      where: {
        walletId: wallet.id,
        action: event.action,
        entityId: event.entityId
      },
      select: { id: true }
    });

    if (!existing) {
      await prisma.auditLog.create({
        data: {
          walletId: wallet.id,
          ...event
        }
      });
    }
  }

  const [userCount, walletCount, websiteCount, providerCount, billingCount, notificationCount, supportCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.wallet.count(),
      prisma.website.count({ where: { walletId: wallet.id } }),
      prisma.providerConnection.count({ where: { walletId: wallet.id } }),
      prisma.billingRecord.count({ where: { walletId: wallet.id } }),
      prisma.notification.count({ where: { walletId: wallet.id } }),
      prisma.supportRequest.count({ where: { walletId: wallet.id } })
    ]);

  return {
    users: userCount,
    wallets: walletCount,
    websites: websiteCount,
    providers: providerCount,
    billingRecords: billingCount,
    notifications: notificationCount,
    supportRequests: supportCount
  };
}
