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
import { storeProviderSecret } from "@/lib/services/provider-credentials";
import { verifyProviderConnection } from "@/lib/services/provider-connection-service";
import { checkProviderHealth, checkWalletProviderHealth } from "@/lib/services/provider-health-service";
import {
  accountSettingsSchema,
  billingRecordDeleteSchema,
  billingRecordSchema,
  billingRecordUpdateSchema,
  editRouteSchema,
  inviteCreateSchema,
  providerConnectionSchema,
  referralSchema,
  supportRequestSchema,
  walletCreateSchema,
  walletSettingsUpdateSchema,
  websiteCreateSchema
} from "@/lib/validation/backend";

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "wallet";
}

export async function createWallet(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const session = await requireSession();

  const businessName = String(formData.get("businessName") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim() || businessName;
  const walletTemplate = String(formData.get("walletTemplate") ?? "service-business").trim() || "service-business";

  if (!businessName || businessName.length < 2) {
    return "Please enter the business name.";
  }

  // Auto-generate slug, make unique with timestamp if needed
  const baseSlug = toSlug(businessName);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  // Normalise website URL — prepend https:// if missing
  let websiteUrl = String(formData.get("websiteUrl") ?? "").trim() || undefined;
  if (websiteUrl && !websiteUrl.startsWith("http")) {
    websiteUrl = `https://${websiteUrl}`;
  }

  const result = walletCreateSchema.safeParse({
    name: name || businessName,
    slug,
    businessName,
    businessCategory: formData.get("businessCategory") || undefined,
    ownerContactName: formData.get("ownerContactName") || undefined,
    ownerEmail: formData.get("ownerEmail") || undefined,
    ownerPhone: formData.get("ownerPhone") || undefined,
    websiteName: formData.get("websiteName") || undefined,
    websiteUrl,
    websiteDescription: formData.get("websiteDescription") || undefined,
    timezone: formData.get("timezone") || undefined,
    notes: formData.get("notes") || undefined,
    planTier: formData.get("planTier") || undefined
  });

  if (!result.success) {
    const first = result.error.errors[0];
    return first ? `${first.path.join(".")}: ${first.message}` : "Please check the form and try again.";
  }

  const wallet = await prisma.wallet.create({
    data: {
      ...result.data,
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

  await prisma.setting.create({
    data: {
      scope: "WALLET",
      walletId: wallet.id,
      key: "walletTemplate",
      value: walletTemplate
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

export async function refreshWalletHealth(formData: FormData) {
  const session = await requireSession();
  const walletId = String(formData.get("walletId") ?? "");

  await requireWalletCapability(walletId, session.user.id, "provider.read");
  await checkWalletProviderHealth(walletId, session.user.id);

  redirect(`/app/wallets/${walletId}/providers?health=checked`);
}

export async function refreshProviderHealth(formData: FormData) {
  const session = await requireSession();
  const walletId = String(formData.get("walletId") ?? "");
  const providerId = String(formData.get("providerId") ?? "");

  await requireWalletCapability(walletId, session.user.id, "provider.read");
  await requireProviderInWallet(walletId, providerId);
  await checkProviderHealth(providerId);

  redirect(`/app/wallets/${walletId}/providers/${providerId}?health=checked`);
}

export async function dismissOwnerWalkthrough(formData: FormData) {
  const session = await requireSession();
  const walletId = String(formData.get("walletId") ?? "");

  await requireWalletCapability(walletId, session.user.id, "wallet.read");

  const existing = await prisma.setting.findFirst({
    where: {
      scope: "USER",
      userId: session.user.id,
      walletId,
      key: "ownerWalkthroughDismissed"
    }
  });

  if (existing) {
    await prisma.setting.update({
      where: { id: existing.id },
      data: { value: true }
    });
  } else {
    await prisma.setting.create({
      data: {
        scope: "USER",
        userId: session.user.id,
        walletId,
        key: "ownerWalkthroughDismissed",
        value: true
      }
    });
  }

  redirect(`/app/wallets/${walletId}`);
}

export async function createWebsite(formData: FormData) {
  const session = await requireSession();

  const walletId = String(formData.get("walletId") ?? "");
  const result = websiteCreateSchema.safeParse({
    walletId,
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
  if (!result.success) {
    const msg = result.error.errors[0]?.message ?? "Please check the form and try again.";
    redirect(`/app/wallets/${walletId}/websites/new?formError=${encodeURIComponent(msg)}`);
  }
  const parsed = result.data;

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

  const walletId = String(formData.get("walletId") ?? "");
  const connResult = providerConnectionSchema.safeParse({
    walletId,
    websiteId: formData.get("websiteId") || undefined,
    providerName: formData.get("providerName"),
    displayLabel: formData.get("displayLabel") || undefined,
    category: formData.get("category"),
    connectionMethod: formData.get("connectionMethod"),
    connectedAccountLabel: formData.get("connectedAccountLabel") || undefined,
    externalProjectId: formData.get("externalProjectId") || undefined,
    externalTeamId: formData.get("externalTeamId") || undefined,
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
  if (!connResult.success) {
    const msg = connResult.error.errors[0]?.message ?? "Please check the form and try again.";
    redirect(`/app/wallets/${walletId}/providers/new?formError=${encodeURIComponent(msg)}`);
  }
  const parsed = connResult.data;
  const apiToken = String(formData.get("apiToken") ?? "").trim();
  const secureCredential = String(formData.get("secureCredential") ?? "").trim();
  const providerTemplateSlug = String(formData.get("providerTemplateSlug") ?? "").trim() || undefined;

  await requireWalletCapability(parsed.walletId, session.user.id, "provider.write");

  if (parsed.websiteId) {
    await requireWebsiteInWallet(parsed.walletId, parsed.websiteId);
  }

  const newProviderUrl = `/app/wallets/${walletId}/providers/new?template=${encodeURIComponent(providerTemplateSlug ?? "custom")}${parsed.websiteId ? `&websiteId=${encodeURIComponent(parsed.websiteId)}` : ""}`;

  if (parsed.connectionMethod === "API_TOKEN" && !apiToken) {
    redirect(`${newProviderUrl}&formError=${encodeURIComponent("Add an API token so RAEYL can verify and connect this tool.")}`);
  }

  if (parsed.connectionMethod === "SECURE_LINK" && !secureCredential) {
    redirect(`${newProviderUrl}&formError=${encodeURIComponent("Add the secure credential or access code for this connection.")}`);
  }

  let verification;
  try {
    verification = await verifyProviderConnection({
      providerName: parsed.providerName,
      connectionMethod: parsed.connectionMethod,
      apiToken: apiToken || undefined,
      externalProjectId: parsed.externalProjectId,
      externalTeamId: parsed.externalTeamId
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not verify this provider connection.";
    redirect(`${newProviderUrl}&formError=${encodeURIComponent(message)}`);
  }

  const provider = await prisma.$transaction(async (tx) => {
    const createdProvider = await tx.providerConnection.create({
      data: {
        ...parsed,
        connectedAccountLabel: verification?.connectedAccountLabel ?? parsed.connectedAccountLabel,
        externalProjectId: verification?.externalProjectId ?? parsed.externalProjectId,
        externalTeamId: verification?.externalTeamId ?? parsed.externalTeamId,
        dashboardUrl: verification?.dashboardUrl ?? parsed.dashboardUrl,
        billingUrl: verification?.billingUrl ?? parsed.billingUrl,
        editUrl: verification?.editUrl ?? parsed.editUrl,
        tokenMetadata: verification?.tokenMetadata ?? undefined,
        metadata: {
          ...(parsed.metadata ?? {}),
          ...(verification?.metadata ?? {}),
          ...(providerTemplateSlug ? { providerTemplateSlug } : {})
        },
        notes: [parsed.notes, verification?.notes].filter(Boolean).join("\n\n") || undefined,
        monthlyCostEstimate:
          parsed.monthlyCostEstimate !== undefined
            ? new Prisma.Decimal(parsed.monthlyCostEstimate)
            : undefined,
        status: verification?.status ?? (parsed.connectionMethod === "MANUAL" ? "CONNECTED" : "PENDING_VERIFICATION"),
        syncState: verification?.syncState ?? (parsed.connectionMethod === "MANUAL" ? "DISABLED" : "PENDING"),
        healthStatus: verification?.healthStatus ?? (parsed.connectionMethod === "MANUAL" ? "UNKNOWN" : "ATTENTION_NEEDED"),
        lastSyncAt: verification?.lastSyncAt,
        lastHealthCheckAt: verification?.lastHealthCheckAt,
        createdById: session.user.id
      }
    });

    if (apiToken) {
      await storeProviderSecret(tx, {
        providerConnectionId: createdProvider.id,
        secretType: "API_KEY",
        rawValue: apiToken,
        createdById: session.user.id
      });
    }

    if (secureCredential) {
      await storeProviderSecret(tx, {
        providerConnectionId: createdProvider.id,
        secretType: "SECURE_LINK_CREDENTIAL",
        rawValue: secureCredential,
        createdById: session.user.id
      });
    }

    return createdProvider;
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

  const walletId = String(formData.get("walletId") ?? "");
  const inviteResult = inviteCreateSchema.safeParse({
    walletId,
    email: formData.get("email"),
    role: "WALLET_OWNER",
    inviteType: "OWNER_HANDOFF",
    expiresAt: formData.get("expiresAt") || new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    context: {
      welcomeNote: String(formData.get("welcomeNote") ?? "").trim()
    }
  });
  if (!inviteResult.success) {
    const msg = inviteResult.error.errors[0]?.message ?? "Please check the form and try again.";
    redirect(`/app/wallets/${walletId}/handoff?formError=${encodeURIComponent(msg)}`);
  }
  const parsed = inviteResult.data;

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
  const walletId = String(formData.get("walletId") ?? "");
  const refResult = referralSchema.safeParse({
    walletId,
    partnerAccountId: formData.get("partnerAccountId"),
    commissionRateBps: Number(formData.get("commissionRateBps")),
    attributionSource: formData.get("attributionSource") || undefined,
    commissionWindowEnds: formData.get("commissionWindowEnds") || undefined
  });
  if (!refResult.success) {
    redirect(`/app/wallets/${walletId}?formError=${encodeURIComponent(refResult.error.errors[0]?.message ?? "Invalid input.")}`);
  }
  const parsed = refResult.data;

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
  const walletId = String(formData.get("walletId") ?? "");
  const billingResult = billingRecordSchema.safeParse({
    walletId,
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
  if (!billingResult.success) {
    const msg = billingResult.error.errors[0]?.message ?? "Please check the form and try again.";
    redirect(`/app/wallets/${walletId}/billing?formError=${encodeURIComponent(msg)}`);
  }
  const parsed = billingResult.data;

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
  const walletId = String(formData.get("walletId") ?? "");
  const updateBillingResult = billingRecordUpdateSchema.safeParse({
    id: formData.get("id"),
    walletId,
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
  if (!updateBillingResult.success) {
    const msg = updateBillingResult.error.errors[0]?.message ?? "Please check the form and try again.";
    redirect(`/app/wallets/${walletId}/billing?formError=${encodeURIComponent(msg)}`);
  }
  const parsed = updateBillingResult.data;

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
  const walletId = String(formData.get("walletId") ?? "");
  const delBillingResult = billingRecordDeleteSchema.safeParse({
    id: formData.get("id"),
    walletId
  });
  if (!delBillingResult.success) {
    redirect(`/app/wallets/${walletId}/billing?formError=${encodeURIComponent(delBillingResult.error.errors[0]?.message ?? "Invalid input.")}`);
  }
  const parsed = delBillingResult.data;

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
  const walletId = String(formData.get("walletId") ?? "");
  const supportResult = supportRequestSchema.safeParse({
    walletId,
    providerConnectionId: formData.get("providerConnectionId") || undefined,
    subject: formData.get("subject"),
    category: formData.get("category"),
    priority: formData.get("priority") || "NORMAL",
    description: formData.get("description")
  });
  if (!supportResult.success) {
    const msg = supportResult.error.errors[0]?.message ?? "Please check the form and try again.";
    redirect(`/app/wallets/${walletId}/support?formError=${encodeURIComponent(msg)}`);
  }
  const parsed = supportResult.data;

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
  const accountResult = accountSettingsSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined
  });
  if (!accountResult.success) {
    const msg = accountResult.error.errors[0]?.message ?? "Please check the form and try again.";
    redirect(`/app/settings/account?formError=${encodeURIComponent(msg)}`);
  }
  const parsed = accountResult.data;

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
  const walletId = String(formData.get("walletId") ?? "");
  const walletSettingsResult = walletSettingsUpdateSchema.safeParse({
    walletId,
    businessName: formData.get("businessName"),
    websiteUrl: formData.get("websiteUrl") || undefined,
    notes: formData.get("notes") || undefined
  });
  if (!walletSettingsResult.success) {
    const msg = walletSettingsResult.error.errors[0]?.message ?? "Please check the form and try again.";
    redirect(`/app/wallets/${walletId}/settings?formError=${encodeURIComponent(msg)}`);
  }
  const parsed = walletSettingsResult.data;

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

export async function createEditRoute(formData: FormData) {
  const session = await requireSession();

  const walletId = String(formData.get("walletId") ?? "");
  const websiteId = String(formData.get("websiteId") ?? "");
  const routeResult = editRouteSchema.safeParse({
    walletId,
    websiteId,
    providerId: formData.get("providerId") || undefined,
    label: formData.get("label"),
    description: formData.get("description") || undefined,
    destinationUrl: formData.get("destinationUrl"),
    contentKey: formData.get("contentKey") || undefined,
    isPrimary: formData.get("isPrimary") === "true",
    visibleToRoles: formData.getAll("visibleToRoles").filter(Boolean) as WalletRole[],
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    isEnabled: true
  });
  if (!routeResult.success) {
    const msg = routeResult.error.errors[0]?.message ?? "Please check the form and try again.";
    redirect(`/app/wallets/${walletId}/websites/${websiteId}/routes/new?formError=${encodeURIComponent(msg)}`);
  }
  const parsed = routeResult.data;

  await requireWalletCapability(parsed.walletId, session.user.id, "website.write");
  await requireWebsiteInWallet(parsed.walletId, parsed.websiteId);

  if (parsed.isPrimary) {
    await prisma.editRoute.updateMany({
      where: { websiteId: parsed.websiteId },
      data: { isPrimary: false }
    });
  }

  const route = await prisma.editRoute.create({
    data: {
      walletId: parsed.walletId,
      websiteId: parsed.websiteId,
      providerId: parsed.providerId,
      label: parsed.label,
      description: parsed.description,
      destinationUrl: parsed.destinationUrl,
      contentKey: parsed.contentKey,
      isPrimary: parsed.isPrimary,
      visibleToRoles: parsed.visibleToRoles,
      sortOrder: parsed.sortOrder,
      isEnabled: true
    }
  });

  await prisma.wallet.update({
    where: { id: parsed.walletId },
    data: { setupStatus: "ROUTES_ADDED" }
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    walletId: parsed.walletId,
    entityType: "WEBSITE",
    entityId: route.id,
    action: "edit_route.created",
    summary: `Edit path "${parsed.label}" added.`
  });

  redirect(`/app/wallets/${parsed.walletId}/websites/${parsed.websiteId}`);
}

export async function deleteEditRoute(formData: FormData) {
  const session = await requireSession();
  const walletId = String(formData.get("walletId") ?? "");
  const websiteId = String(formData.get("websiteId") ?? "");
  const routeId = String(formData.get("routeId") ?? "");

  await requireWalletCapability(walletId, session.user.id, "website.write");

  const route = await prisma.editRoute.findFirst({
    where: { id: routeId, walletId }
  });

  if (!route) throw new Error("Edit path not found.");

  await prisma.editRoute.delete({ where: { id: routeId } });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    walletId,
    entityType: "WEBSITE",
    entityId: routeId,
    action: "edit_route.deleted",
    summary: `Edit path "${route.label}" removed.`
  });

  redirect(`/app/wallets/${walletId}/websites/${websiteId}`);
}

export async function deleteProviderConnection(formData: FormData) {
  const session = await requireSession();
  const walletId = String(formData.get("walletId") ?? "");
  const providerId = String(formData.get("providerId") ?? "");

  await requireWalletCapability(walletId, session.user.id, "provider.write");

  const provider = await prisma.providerConnection.findFirst({
    where: { id: providerId, walletId }
  });

  if (!provider) throw new Error("Provider not found.");

  await prisma.providerConnection.delete({ where: { id: providerId } });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    walletId,
    entityType: "PROVIDER",
    entityId: providerId,
    action: "provider.deleted",
    summary: `Provider "${provider.displayLabel ?? provider.providerName}" removed from wallet.`
  });

  redirect(`/app/wallets/${walletId}/providers`);
}

export async function inviteTeamMember(formData: FormData) {
  const session = await requireSession();

  const walletId = String(formData.get("walletId") ?? "");
  const teamInviteResult = inviteCreateSchema.safeParse({
    walletId,
    email: formData.get("email"),
    role: formData.get("role"),
    inviteType: "WALLET_MEMBER",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  });
  if (!teamInviteResult.success) {
    const msg = teamInviteResult.error.errors[0]?.message ?? "Please check the form and try again.";
    redirect(`/app/wallets/${walletId}/access/invite?formError=${encodeURIComponent(msg)}`);
  }
  const parsed = teamInviteResult.data;

  await requireWalletCapability(parsed.walletId, session.user.id, "access.manage");

  const existing = await prisma.invite.findFirst({
    where: {
      walletId: parsed.walletId,
      email: parsed.email,
      status: { in: ["DRAFT", "SENT", "VIEWED"] }
    }
  });

  if (existing) throw new Error("An active invite already exists for this email address.");

  const token = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const invite = await prisma.invite.create({
    data: {
      walletId: parsed.walletId,
      sentById: session.user.id,
      email: parsed.email,
      role: parsed.role as WalletRole,
      inviteType: "WALLET_MEMBER",
      expiresAt: parsed.expiresAt,
      tokenHash,
      status: "SENT",
      sentAt: new Date()
    }
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    walletId: parsed.walletId,
    entityType: "INVITE",
    entityId: invite.id,
    action: "invite.sent",
    summary: `Team invite sent to ${invite.email} as ${parsed.role}.`
  });

  const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });
  if (existingUser) {
    await createInAppNotification({
      userId: existingUser.id,
      walletId: parsed.walletId,
      type: "INVITE",
      subject: "You've been invited to a website wallet",
      body: "You have been invited to collaborate on a website wallet.",
      ctaUrl: `/accept-invite/${token}`
    });
  }

  redirect(`/app/wallets/${parsed.walletId}/access?invite=sent`);
}

export async function transferPrimaryOwnership(formData: FormData) {
  const session = await requireSession();
  const walletId = String(formData.get("walletId") ?? "");
  const toUserId = String(formData.get("toUserId") ?? "");

  if (!walletId || !toUserId) throw new Error("Missing required fields.");

  await requireWalletCapability(walletId, session.user.id, "access.manage");

  const targetMembership = await prisma.walletMembership.findFirst({
    where: { walletId, userId: toUserId, status: "ACTIVE" },
    include: { user: { select: { name: true, email: true } } }
  });

  if (!targetMembership) throw new Error("Target user is not an active member of this wallet.");

  await prisma.walletMembership.updateMany({
    where: { walletId, isPrimaryOwner: true },
    data: { isPrimaryOwner: false }
  });

  await prisma.walletMembership.update({
    where: { id: targetMembership.id },
    data: { isPrimaryOwner: true, role: "WALLET_OWNER" }
  });

  await prisma.wallet.update({
    where: { id: walletId },
    data: { primaryOwnerId: toUserId }
  });

  await createInAppNotification({
    userId: toUserId,
    walletId,
    type: "HANDOFF",
    subject: "You are now the primary owner",
    body: "Primary wallet ownership has been transferred to you.",
    ctaUrl: `/app/wallets/${walletId}`
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "USER",
    walletId,
    entityType: "MEMBERSHIP",
    entityId: targetMembership.id,
    action: "ownership.transferred",
    summary: `Primary ownership transferred to ${targetMembership.user.name ?? targetMembership.user.email}.`
  });

  redirect(`/app/wallets/${walletId}/access?transferred=1`);
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

  redirect(`/app/wallets/${walletId}/handoff/complete`);
}

export async function saveUserPreferences(formData: FormData) {
  const session = await requireSession();
  const userId = session.user.id;

  const prefs: Record<string, Prisma.InputJsonValue> = {
    defaultLandingPage: String(formData.get("defaultLandingPage") ?? "overview"),
    compactMode: formData.get("compactMode") === "true",
    dateFormat: String(formData.get("dateFormat") ?? "relative")
  };

  await Promise.all(
    Object.entries(prefs).map(async ([key, value]) => {
      const existing = await prisma.setting.findFirst({
        where: { scope: "USER", userId, walletId: null, key }
      });
      if (existing) {
        await prisma.setting.update({ where: { id: existing.id }, data: { value } });
      } else {
        await prisma.setting.create({
          data: { scope: "USER", userId, key, value }
        });
      }
    })
  );

  redirect("/app/settings/preferences?updated=1");
}
