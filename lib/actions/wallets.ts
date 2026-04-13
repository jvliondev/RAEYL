"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { Prisma, WalletRole } from "@prisma/client";

import {
  requireProviderInWallet,
  requireSession,
  requireWalletCapability,
  requireWalletRole,
  requireWebsiteInWallet
} from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";
import { createInAppNotification } from "@/lib/services/notification-service";
import { createBillingPortalSession, createCheckoutSession } from "@/lib/services/billing-service";
import { createSupportRequest } from "@/lib/services/support-service";
import { getHandoffReadiness } from "@/lib/services/handoff-state";
import {
  accountSettingsSchema,
  billingRecordDeleteSchema,
  billingRecordSchema,
  billingRecordUpdateSchema,
  inviteCreateSchema,
  providerConnectionSchema,
  referralSchema,
  supportRequestSchema,
  walletCreateSchema,
  walletSettingsUpdateSchema,
  websiteCreateSchema
} from "@/lib/validation/backend";

export async function createWallet(formData: FormData) {
  const session = await requireSession();

  const parsed = walletCreateSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    businessName: formData.get("businessName"),
    businessCategory: formData.get("businessCategory"),
    ownerContactName: formData.get("ownerContactName"),
    ownerEmail: formData.get("ownerEmail") || undefined,
    ownerPhone: formData.get("ownerPhone") || undefined,
    websiteName: formData.get("websiteName") || undefined,
    websiteUrl: formData.get("websiteUrl") || undefined,
    websiteDescription: formData.get("websiteDescription") || undefined,
    timezone: formData.get("timezone") || undefined,
    notes: formData.get("notes") || undefined,
    planTier: formData.get("planTier") || undefined
  });

  const wallet = await prisma.wallet.create({
    data: {
      ...parsed,
      createdById: session.user.id,
      primaryDeveloperId: session.user.id,
      status: "IN_SETUP",
      setupStatus: "PROFILE_COMPLETE",
      memberships: {
        create: {
          userId: session.user.id,
          role: "DEVELOPER",
          status: "ACTIVE",
          isPrimaryDeveloper: true,
          joinedAt: new Date()
        }
      }
    }
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    walletId: wallet.id,
    entityType: "WALLET",
    entityId: wallet.id,
    action: "wallet.created",
    summary: `Wallet ${wallet.name} created.`
  });

  redirect(`/app/wallets/${wallet.id}/setup`);
}

export async function createWebsite(formData: FormData) {
  const session = await requireSession();

  const parsed = websiteCreateSchema.parse({
    walletId: formData.get("walletId"),
    name: formData.get("name"),
    primaryDomain: formData.get("primaryDomain") || undefined,
    productionUrl: formData.get("productionUrl") || undefined,
    stagingUrl: formData.get("stagingUrl") || undefined,
    siteCategory: formData.get("siteCategory") || undefined,
    framework: formData.get("framework") || undefined,
    deploymentNotes: formData.get("deploymentNotes") || undefined,
    ownerNotes: formData.get("ownerNotes") || undefined,
    developerNotes: formData.get("developerNotes") || undefined
  });

  await requireWalletCapability(parsed.walletId, session.user.id, "website.write");

  const website = await prisma.website.create({
    data: {
      ...parsed,
      status: "LIVE"
    }
  });

  await prisma.wallet.update({
    where: { id: parsed.walletId },
    data: {
      setupStatus: "WEBSITES_ADDED"
    }
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    walletId: parsed.walletId,
    entityType: "WEBSITE",
    entityId: website.id,
    action: "website.created",
    summary: `Website ${website.name} added to wallet.`
  });

  redirect(`/app/wallets/${parsed.walletId}/providers/new?websiteId=${website.id}`);
}

export async function createProviderConnection(formData: FormData) {
  const session = await requireSession();

  const parsed = providerConnectionSchema.parse({
    walletId: formData.get("walletId"),
    websiteId: formData.get("websiteId") || undefined,
    providerName: formData.get("providerName"),
    displayLabel: formData.get("displayLabel") || undefined,
    category: formData.get("category"),
    connectionMethod: formData.get("connectionMethod"),
    connectedAccountLabel: formData.get("connectedAccountLabel") || undefined,
    dashboardUrl: formData.get("dashboardUrl") || undefined,
    billingUrl: formData.get("billingUrl") || undefined,
    editUrl: formData.get("editUrl") || undefined,
    supportUrl: formData.get("supportUrl") || undefined,
    ownerDescription: formData.get("ownerDescription") || undefined,
    notes: formData.get("notes") || undefined,
    monthlyCostEstimate: formData.get("monthlyCostEstimate")
      ? Number(formData.get("monthlyCostEstimate"))
      : undefined,
    renewalDate: formData.get("renewalDate") || undefined
  });

  await requireWalletCapability(parsed.walletId, session.user.id, "provider.write");

  if (parsed.websiteId) {
    await requireWebsiteInWallet(parsed.walletId, parsed.websiteId);
  }

  const provider = await prisma.providerConnection.create({
    data: {
      ...parsed,
      monthlyCostEstimate:
        parsed.monthlyCostEstimate !== undefined
          ? new Prisma.Decimal(parsed.monthlyCostEstimate)
          : undefined,
      status: parsed.connectionMethod === "MANUAL" ? "CONNECTED" : "PENDING_VERIFICATION",
      syncState: parsed.connectionMethod === "MANUAL" ? "DISABLED" : "PENDING",
      healthStatus: parsed.connectionMethod === "MANUAL" ? "UNKNOWN" : "ATTENTION_NEEDED",
      createdById: session.user.id
    }
  });

  await prisma.wallet.update({
    where: { id: parsed.walletId },
    data: {
      setupStatus: "PROVIDERS_ADDED"
    }
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    walletId: parsed.walletId,
    entityType: "PROVIDER",
    entityId: provider.id,
    action: "provider.created",
    summary: `${provider.providerName} added as a connected provider.`
  });

  redirect(`/app/wallets/${parsed.walletId}/providers/${provider.id}`);
}

export async function createOwnerInvite(formData: FormData) {
  const session = await requireSession();

  const parsed = inviteCreateSchema.parse({
    walletId: formData.get("walletId"),
    email: formData.get("email"),
    role: "WALLET_OWNER",
    inviteType: "OWNER_HANDOFF",
    expiresAt: formData.get("expiresAt") || new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    context: {
      welcomeNote: String(formData.get("welcomeNote") ?? "").trim()
    }
  });

  await requireWalletCapability(parsed.walletId, session.user.id, "handoff.manage");

  const existingActiveInvite = await prisma.invite.findFirst({
    where: {
      walletId: parsed.walletId,
      email: parsed.email,
      role: "WALLET_OWNER",
      status: {
        in: ["DRAFT", "SENT", "VIEWED"]
      }
    }
  });

  if (existingActiveInvite) {
    throw new Error("An active ownership invite already exists for this email.");
  }

  const token = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const invite = await prisma.invite.create({
    data: {
      walletId: parsed.walletId,
      sentById: session.user.id,
      email: parsed.email,
      role: parsed.role as WalletRole,
      inviteType: parsed.inviteType,
      expiresAt: parsed.expiresAt,
      tokenHash,
      status: "SENT",
      sentAt: new Date(),
      context: parsed.context
    }
  });

  await prisma.handoffRecord.upsert({
    where: {
      id: `${parsed.walletId}-handoff`
    },
    update: {
      ownerInviteId: invite.id,
      status: "OWNER_INVITED"
    },
    create: {
      id: `${parsed.walletId}-handoff`,
      walletId: parsed.walletId,
      ownerInviteId: invite.id,
      status: "OWNER_INVITED",
      startedById: session.user.id,
      startedAt: new Date()
    }
  });

  await prisma.wallet.update({
    where: { id: parsed.walletId },
    data: {
      handoffStatus: "OWNER_INVITED",
      ownerAcceptanceStatus: "PENDING"
    }
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    walletId: parsed.walletId,
    entityType: "INVITE",
    entityId: invite.id,
    action: "invite.sent",
    summary: `Ownership invite sent to ${invite.email}.`
  });

  const existingOwner = await prisma.user.findUnique({
    where: { email: invite.email }
  });

  if (existingOwner) {
    await createInAppNotification({
      userId: existingOwner.id,
      walletId: parsed.walletId,
      type: "INVITE",
      subject: "You have been invited to a website wallet",
      body: "A website ownership invite is waiting for your review.",
      ctaUrl: `/accept-invite/${token}`
    });
  }

  await createInAppNotification({
    userId: session.user.id,
    walletId: parsed.walletId,
    type: "HANDOFF",
    subject: "Ownership invite sent",
    body: "The ownership invite is out. RAEYL will update the handoff state when it is accepted.",
    ctaUrl: `/app/wallets/${parsed.walletId}/handoff`
  });

  redirect(`/app/wallets/${parsed.walletId}/handoff?invite=sent`);
}

export async function createReferralAttribution(formData: FormData) {
  const session = await requireSession();
  const parsed = referralSchema.parse({
    walletId: formData.get("walletId"),
    partnerAccountId: formData.get("partnerAccountId"),
    commissionRateBps: Number(formData.get("commissionRateBps")),
    attributionSource: formData.get("attributionSource") || undefined,
    commissionWindowEnds: formData.get("commissionWindowEnds") || undefined
  });

  await requireWalletRole(parsed.walletId, session.user.id, [
    "PLATFORM_ADMIN",
    "WALLET_OWNER",
    "DEVELOPER"
  ]);

  const partnerAccount = await prisma.partnerAccount.findUnique({
    where: { id: parsed.partnerAccountId }
  });

  if (!partnerAccount || partnerAccount.status !== "ACTIVE") {
    throw new Error("This partner account is not active.");
  }

  await prisma.referral.create({
    data: parsed
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    walletId: parsed.walletId,
    entityType: "REFERRAL",
    entityId: parsed.partnerAccountId,
    action: "referral.created",
    summary: "Referral attribution recorded."
  });
}

export async function createBillingRecord(formData: FormData) {
  const session = await requireSession();
  const parsed = billingRecordSchema.parse({
    walletId: formData.get("walletId"),
    providerConnectionId: formData.get("providerConnectionId") || undefined,
    sourceType: formData.get("sourceType"),
    label: formData.get("label"),
    description: formData.get("description") || undefined,
    amount: Number(formData.get("amount")),
    currency: formData.get("currency") || "USD",
    cadence: formData.get("cadence"),
    status: formData.get("status") || "ACTIVE",
    providerReference: formData.get("providerReference") || undefined,
    invoiceUrl: formData.get("invoiceUrl") || undefined,
    billingUrl: formData.get("billingUrl") || undefined,
    renewalDate: formData.get("renewalDate") || undefined,
    isOwnerManaged: formData.get("isOwnerManaged") !== "false"
  });

  await requireWalletCapability(parsed.walletId, session.user.id, "billing.write");

  if (parsed.providerConnectionId) {
    await requireProviderInWallet(parsed.walletId, parsed.providerConnectionId);
  }

  const record = await prisma.billingRecord.create({
    data: {
      ...parsed,
      amount: new Prisma.Decimal(parsed.amount),
      createdById: session.user.id
    }
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    walletId: parsed.walletId,
    entityType: "BILLING",
    entityId: record.id,
    action: "billing.record.created",
    summary: `Billing record created: ${parsed.label}.`
  });

  redirect(`/app/wallets/${parsed.walletId}/billing?record=created`);
}

export async function updateBillingRecord(formData: FormData) {
  const session = await requireSession();
  const parsed = billingRecordUpdateSchema.parse({
    id: formData.get("id"),
    walletId: formData.get("walletId"),
    providerConnectionId: formData.get("providerConnectionId") || undefined,
    sourceType: formData.get("sourceType"),
    label: formData.get("label"),
    description: formData.get("description") || undefined,
    amount: Number(formData.get("amount")),
    currency: formData.get("currency") || "USD",
    cadence: formData.get("cadence"),
    status: formData.get("status") || "ACTIVE",
    providerReference: formData.get("providerReference") || undefined,
    invoiceUrl: formData.get("invoiceUrl") || undefined,
    billingUrl: formData.get("billingUrl") || undefined,
    renewalDate: formData.get("renewalDate") || undefined,
    isOwnerManaged: formData.get("isOwnerManaged") !== "false"
  });

  await requireWalletCapability(parsed.walletId, session.user.id, "billing.write");

  const existing = await prisma.billingRecord.findFirst({
    where: {
      id: parsed.id,
      walletId: parsed.walletId
    }
  });

  if (!existing) {
    throw new Error("Billing record not found.");
  }

  if (!existing.isOwnerManaged || existing.sourceType === "RAEYL_SUBSCRIPTION") {
    throw new Error("This billing record cannot be edited here.");
  }

  if (parsed.providerConnectionId) {
    await requireProviderInWallet(parsed.walletId, parsed.providerConnectionId);
  }

  await prisma.billingRecord.update({
    where: { id: parsed.id },
    data: {
      providerConnectionId: parsed.providerConnectionId,
      sourceType: parsed.sourceType,
      label: parsed.label,
      description: parsed.description,
      amount: new Prisma.Decimal(parsed.amount),
      currency: parsed.currency,
      cadence: parsed.cadence,
      status: parsed.status,
      providerReference: parsed.providerReference,
      invoiceUrl: parsed.invoiceUrl,
      billingUrl: parsed.billingUrl,
      renewalDate: parsed.renewalDate,
      isOwnerManaged: parsed.isOwnerManaged
    }
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    walletId: parsed.walletId,
    entityType: "BILLING",
    entityId: parsed.id,
    action: "billing.record.updated",
    summary: `Billing record updated: ${parsed.label}.`
  });

  redirect(`/app/wallets/${parsed.walletId}/billing?record=updated`);
}

export async function deleteBillingRecord(formData: FormData) {
  const session = await requireSession();
  const parsed = billingRecordDeleteSchema.parse({
    id: formData.get("id"),
    walletId: formData.get("walletId")
  });

  await requireWalletCapability(parsed.walletId, session.user.id, "billing.write");

  const existing = await prisma.billingRecord.findFirst({
    where: {
      id: parsed.id,
      walletId: parsed.walletId
    }
  });

  if (!existing) {
    throw new Error("Billing record not found.");
  }

  if (!existing.isOwnerManaged || existing.sourceType === "RAEYL_SUBSCRIPTION") {
    throw new Error("This billing record cannot be removed here.");
  }

  await prisma.billingRecord.delete({
    where: { id: parsed.id }
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    walletId: parsed.walletId,
    entityType: "BILLING",
    entityId: parsed.id,
    action: "billing.record.deleted",
    summary: `Billing record removed: ${existing.label}.`
  });

  redirect(`/app/wallets/${parsed.walletId}/billing?record=deleted`);
}

export async function startSubscriptionCheckout(formData: FormData) {
  const session = await requireSession();
  const walletId = String(formData.get("walletId") ?? "");
  await requireWalletCapability(walletId, session.user.id, "billing.write");
  const result = await createCheckoutSession(walletId, session.user.id);
  redirect(result.url);
}

export async function openBillingPortal(formData: FormData) {
  const session = await requireSession();
  const walletId = String(formData.get("walletId") ?? "");
  await requireWalletCapability(walletId, session.user.id, "billing.write");
  const result = await createBillingPortalSession(walletId, session.user.id);
  redirect(result.url);
}

export async function submitSupportRequest(formData: FormData) {
  const session = await requireSession();
  const parsed = supportRequestSchema.parse({
    walletId: formData.get("walletId"),
    providerConnectionId: formData.get("providerConnectionId") || undefined,
    subject: formData.get("subject"),
    category: formData.get("category"),
    priority: formData.get("priority") || "NORMAL",
    description: formData.get("description")
  });

  await requireWalletCapability(parsed.walletId, session.user.id, "support.write");

  if (parsed.providerConnectionId) {
    await requireProviderInWallet(parsed.walletId, parsed.providerConnectionId);
  }

  await createSupportRequest({
    ...parsed,
    requesterId: session.user.id
  });

  redirect(`/app/wallets/${parsed.walletId}/support?submitted=1`);
}

export async function updateAccountSettings(formData: FormData) {
  const session = await requireSession();
  const parsed = accountSettingsSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone
    }
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    entityType: "USER",
    entityId: session.user.id,
    action: "user.settings.updated",
    summary: "Account settings updated."
  });

  redirect("/app/settings/account?updated=1");
}

export async function updateWalletSettings(formData: FormData) {
  const session = await requireSession();
  const parsed = walletSettingsUpdateSchema.parse({
    walletId: formData.get("walletId"),
    businessName: formData.get("businessName"),
    websiteUrl: formData.get("websiteUrl") || undefined,
    notes: formData.get("notes") || undefined
  });

  await requireWalletCapability(parsed.walletId, session.user.id, "settings.write");

  await prisma.wallet.update({
    where: { id: parsed.walletId },
    data: {
      businessName: parsed.businessName,
      websiteUrl: parsed.websiteUrl,
      notes: parsed.notes
    }
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    walletId: parsed.walletId,
    entityType: "SETTING",
    entityId: parsed.walletId,
    action: "wallet.settings.updated",
    summary: "Wallet settings updated."
  });

  redirect(`/app/wallets/${parsed.walletId}/settings?updated=1`);
}

export async function acceptInvite(token: string) {
  const session = await requireSession();
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const invite = await prisma.invite.findUnique({
    where: { tokenHash }
  });

  if (!invite || invite.expiresAt < new Date() || invite.status === "REVOKED") {
    throw new Error("This invite is no longer valid.");
  }

  if (invite.status === "ACCEPTED" || invite.status === "DECLINED" || invite.status === "EXPIRED") {
    throw new Error("This invite is no longer valid.");
  }

  if (!invite.walletId) {
    throw new Error("This invite is not attached to a wallet.");
  }

  if (invite.email.toLowerCase() !== (session.user.email ?? "").toLowerCase()) {
    throw new Error("This invite belongs to a different email address.");
  }

  const membership = await prisma.walletMembership.upsert({
    where: {
      walletId_userId: {
        walletId: invite.walletId,
        userId: session.user.id
      }
    },
    create: {
      walletId: invite.walletId,
      userId: session.user.id,
      role: invite.role ?? "VIEWER",
      status: "ACTIVE",
      joinedAt: new Date(),
      inviteId: invite.id,
      isPrimaryOwner: invite.role === "WALLET_OWNER"
    },
    update: {
      role: invite.role ?? "VIEWER",
      status: "ACTIVE",
      joinedAt: new Date(),
      inviteId: invite.id,
      isPrimaryOwner: invite.role === "WALLET_OWNER"
    }
  });

  await prisma.invite.update({
    where: { id: invite.id },
    data: {
      status: "ACCEPTED",
      acceptedById: session.user.id,
      acceptedAt: new Date()
    }
  });

  if (invite.role === "WALLET_OWNER" && invite.walletId) {
    await prisma.wallet.update({
      where: { id: invite.walletId },
      data: {
        primaryOwnerId: session.user.id,
        handoffStatus: "OWNER_ACCEPTED",
        ownerAcceptanceStatus: "ACCEPTED"
      }
    });

    await prisma.handoffRecord.upsert({
      where: {
        id: `${invite.walletId}-handoff`
      },
      update: {
        ownerInviteId: invite.id,
        status: "OWNER_ACCEPTED",
        ownerAcceptedAt: new Date()
      },
      create: {
        id: `${invite.walletId}-handoff`,
        walletId: invite.walletId,
        ownerInviteId: invite.id,
        status: "OWNER_ACCEPTED",
        ownerAcceptedAt: new Date()
      }
    });
  }

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    walletId: invite.walletId ?? undefined,
    entityType: "INVITE",
    entityId: invite.id,
    action: "invite.accepted",
    summary: `Invite accepted for ${invite.email}.`
  });

  if (invite.sentById) {
    await createInAppNotification({
      userId: invite.sentById,
      walletId: invite.walletId ?? undefined,
      type: "HANDOFF",
      subject: "Ownership accepted",
      body: "The owner has accepted the website wallet.",
      ctaUrl: `/app/wallets/${invite.walletId}/handoff`
    });
  }

  redirect(`/app/wallets/${invite.walletId}`);
}

export async function completeHandoff(formData: FormData) {
  const session = await requireSession();
  const walletId = String(formData.get("walletId") ?? "");
  await requireWalletCapability(walletId, session.user.id, "handoff.manage");
  const readiness = await getHandoffReadiness(walletId);

  if (!readiness.canComplete) {
    throw new Error("The wallet is not ready to complete handoff yet.");
  }

  await prisma.wallet.update({
    where: { id: walletId },
    data: {
      handoffStatus: "COMPLETED",
      status: "ACTIVE"
    }
  });

  await prisma.handoffRecord.upsert({
    where: {
      id: `${walletId}-handoff`
    },
    update: {
      status: "COMPLETED",
      completedById: session.user.id,
      completedAt: new Date()
    },
    create: {
      id: `${walletId}-handoff`,
      walletId,
      status: "COMPLETED",
      completedById: session.user.id,
      completedAt: new Date()
    }
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    walletId,
    entityType: "HANDOFF",
    entityId: walletId,
    action: "handoff.completed",
    summary: "Wallet handoff marked complete."
  });

  const ownerMembership = await prisma.walletMembership.findFirst({
    where: {
      walletId,
      isPrimaryOwner: true,
      status: "ACTIVE"
    }
  });

  if (ownerMembership) {
    await createInAppNotification({
      userId: ownerMembership.userId,
      walletId,
      type: "HANDOFF",
      subject: "Your website wallet is ready",
      body: "The handoff is complete and your website wallet is ready to use.",
      ctaUrl: `/app/wallets/${walletId}`
    });
  }

  redirect(`/app/wallets/${walletId}?handoff=complete`);
}
