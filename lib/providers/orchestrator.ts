import { Prisma, ProviderStatus, SyncState, type ProviderConnection as ProviderConnectionModel } from "@prisma/client/index";

import { prisma } from "@/lib/prisma";
import { storeProviderSecret } from "@/lib/services/provider-credentials";
import type {
  ConnectionLifecycleState,
  ProviderConnectResult,
  ProviderConnectionInput,
  ProviderHealthCheckResult,
  WalletProviderContext
} from "@/lib/providers/contracts";
import { getProviderAdapter } from "@/lib/providers/registry";

function toProviderStatus(state: ConnectionLifecycleState): ProviderStatus {
  switch (state) {
    case "CONNECTED":
      return ProviderStatus.CONNECTED;
    case "DEGRADED":
      return ProviderStatus.CONNECTED;
    case "RECONNECT_REQUIRED":
      return ProviderStatus.REQUIRES_RECONNECT;
    case "DISCONNECTED":
      return ProviderStatus.DISCONNECTED;
    case "FAILED":
      return ProviderStatus.PENDING_VERIFICATION;
    default:
      return ProviderStatus.PENDING_VERIFICATION;
  }
}

function toSyncState(value: ProviderHealthCheckResult["syncState"] | SyncState) {
  return value as SyncState;
}

async function getWalletProviderContext(walletId: string): Promise<WalletProviderContext> {
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    include: {
      websites: {
        orderBy: { createdAt: "asc" },
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
  });

  if (!wallet) {
    throw new Error("Wallet not found.");
  }

  const primaryWebsite = wallet.websites[0];

  return {
    walletId: wallet.id,
    businessName: wallet.businessName,
    websiteName: wallet.websiteName ?? primaryWebsite?.name ?? null,
    websiteUrl: wallet.websiteUrl ?? primaryWebsite?.productionUrl ?? null,
    primaryDomain: primaryWebsite?.primaryDomain ?? null,
    websiteDescription: wallet.websiteDescription ?? null,
    businessCategory: wallet.businessCategory ?? null,
    setupProfile:
      (wallet.settings[0]?.value && typeof wallet.settings[0].value === "object" && !Array.isArray(wallet.settings[0].value)
        ? (wallet.settings[0].value as Record<string, unknown>)
        : null)
  };
}

export function getProviderMagicConnectProfile(providerSlug?: string | null) {
  const adapter = getProviderAdapter(providerSlug);
  const strategy = adapter.getAuthStrategy();
  const capabilities = adapter.getCapabilities();

  if (!capabilities.includes("apiToken")) {
    return null;
  }

  const tokenField = strategy.fields.find((field) => field.key === "apiToken");

  return {
    providerSlug: adapter.getProviderDefinition().slug,
    mode: capabilities.includes("resourceDiscovery") ? "token_discovery" : "basic_token",
    tokenLabel: tokenField?.label ?? "API token",
    tokenPlaceholder: tokenField?.placeholder ?? "Paste API token",
    tokenHint: tokenField?.hint ?? strategy.securityNote,
    title: strategy.title,
    description: strategy.description,
    teamLabel: "Workspace",
    teamPlaceholder: "Let RAEYL decide",
    resourceLabel: "Resource",
    resourcePlaceholder: "Choose the correct resource"
  } as const;
}

export async function discoverProviderResources(input: {
  walletId: string;
  providerSlug: string;
  apiToken: string;
  externalTeamId?: string;
  externalProjectId?: string;
}) {
  const adapter = getProviderAdapter(input.providerSlug);
  if (!adapter.discoverResources) {
    throw new Error("Live discovery is not available for this provider yet.");
  }

  const context = await getWalletProviderContext(input.walletId);
  const definition = adapter.getProviderDefinition();
  const verification = await adapter.verifyConnection(context, {
    walletId: input.walletId,
    providerSlug: definition.slug,
    providerName: definition.displayName,
    category: definition.category,
    connectionMethod: adapter.getAuthStrategy().connectionMethod,
    apiToken: input.apiToken,
    externalTeamId: input.externalTeamId,
    externalProjectId: input.externalProjectId
  });

  const resourceResolution = await adapter.discoverResources(context, {
    walletId: input.walletId,
    providerSlug: definition.slug,
    providerName: definition.displayName,
    category: definition.category,
    connectionMethod: adapter.getAuthStrategy().connectionMethod,
    apiToken: input.apiToken,
    externalTeamId: input.externalTeamId,
    externalProjectId: input.externalProjectId
  });

  return {
    accountLabel: verification.accountLabel ?? definition.displayName,
    dashboardUrl: verification.dashboardUrl,
    billingUrl: verification.billingUrl,
    teams: resourceResolution.teams.map((team) => ({
      id: team.id,
      label: team.label,
      slug: typeof team.metadata?.slug === "string" ? team.metadata.slug : null
    })),
    resources: resourceResolution.resources.map((resource) => ({
      id: resource.id,
      value: resource.value,
      label: resource.label,
      groupId: resource.parentId ?? null,
      subtitle:
        typeof resource.metadata?.region === "string"
          ? resource.metadata.region
          : typeof resource.metadata?.framework === "string"
            ? resource.metadata.framework
            : null
    })),
    selectedTeamId: resourceResolution.selectedTeamId,
    selectedResourceValue: resourceResolution.selectedResourceValue,
    resourceLabel:
      resourceResolution.resources.find((resource) => resource.type === "project") ? "Project" : "Resource",
    teamLabel:
      resourceResolution.teams.find((team) => team.type === "team") ? "Workspace" : "Group",
    confidenceScore: resourceResolution.confidenceScore,
    autoSelected: resourceResolution.autoSelected,
    clarificationNeeded: resourceResolution.clarificationNeeded,
    explanation: resourceResolution.explanation
  };
}

export async function runProviderConnectionOrchestration(input: {
  actorUserId: string;
  provider: ProviderConnectionInput;
}): Promise<ProviderConnectResult> {
  const context = await getWalletProviderContext(input.provider.walletId);
  const adapter = getProviderAdapter(input.provider.providerSlug ?? input.provider.providerName);
  const definition = adapter.getProviderDefinition();
  const authStrategy = adapter.getAuthStrategy();

  const verification = await adapter.verifyConnection(context, {
    ...input.provider,
    apiToken: input.provider.apiToken ?? input.provider.oauthAccessToken,
    providerSlug: definition.slug,
    providerName: input.provider.providerName || definition.displayName,
    connectionMethod: input.provider.connectionMethod || authStrategy.connectionMethod,
    category: input.provider.category || definition.category
  });

  const resourceResolution = adapter.discoverResources
      ? await adapter.discoverResources(context, {
        ...input.provider,
        apiToken: input.provider.apiToken ?? input.provider.oauthAccessToken,
        providerSlug: definition.slug,
        providerName: input.provider.providerName || definition.displayName,
        connectionMethod: input.provider.connectionMethod || authStrategy.connectionMethod,
        category: input.provider.category || definition.category
      })
    : undefined;

  const normalizedMetadata = await adapter.normalizeConnectionMetadata(
    context,
    input.provider,
    verification,
    resourceResolution
  );
  const billing = adapter.syncBilling ? await adapter.syncBilling(context, input.provider, normalizedMetadata) : [];
  const health = adapter.runHealthCheck
    ? await adapter.runHealthCheck(context, input.provider, normalizedMetadata)
    : {
        state: verification.healthState,
        summary: verification.failureSummary ?? "Connection verified.",
        syncState: verification.syncState,
        warnings: [],
        checkedAt: new Date().toISOString()
      };
  const editDestinations = adapter.inferEditDestinations
    ? await adapter.inferEditDestinations(context, input.provider, normalizedMetadata)
    : [];
  const ownerSummary = adapter.getOwnerSummary(context, normalizedMetadata);
  const setupSignals = adapter.getSetupSignals ? adapter.getSetupSignals(context, normalizedMetadata) : [];
  const handoffSignals = adapter.getHandoffSignals ? adapter.getHandoffSignals(context, normalizedMetadata) : [];
  const diagnostics = adapter.getDiagnostics(normalizedMetadata, verification, resourceResolution);

  return {
    adapterKey: definition.key,
    authStrategyKey: authStrategy.type,
    verification,
    resourceResolution,
    normalizedMetadata,
    billing,
    health,
    editDestinations,
    ownerSummary,
    setupSignals,
    handoffSignals,
    diagnostics
  };
}

export async function createConnectedProviderRecord(input: {
  actorUserId: string;
  provider: ProviderConnectionInput;
  existingProviderId?: string;
}) {
  const result = await runProviderConnectionOrchestration(input);

  const providerPayload = {
    walletId: input.provider.walletId,
    websiteId: input.provider.websiteId,
    adapterKey: result.adapterKey,
    providerName: input.provider.providerName,
    displayLabel: input.provider.displayLabel,
    category: input.provider.category,
    status: toProviderStatus(result.verification.connectionState),
    connectionState: result.verification.connectionState,
    healthStatus: result.health.state,
    syncState: toSyncState(result.health.syncState ?? result.verification.syncState),
    connectionConfidence: result.resourceResolution?.confidenceScore ?? result.verification.confidenceScore,
    reconnectRequired:
      result.verification.connectionState === "RECONNECT_REQUIRED" ||
      result.health.state === "DISCONNECTED",
    authStrategyKey: result.authStrategyKey,
    connectedAccountLabel:
      result.normalizedMetadata.connectedAccountLabel ??
      result.verification.connectedAccountLabel ??
      input.provider.connectedAccountLabel,
    externalProjectId:
      result.resourceResolution?.selectedResourceValue ??
      result.normalizedMetadata.projectId ??
      result.verification.externalProjectId ??
      input.provider.externalProjectId,
    externalTeamId:
      result.resourceResolution?.selectedTeamId ??
      result.normalizedMetadata.teamId ??
      result.verification.externalTeamId ??
      input.provider.externalTeamId,
    dashboardUrl: result.normalizedMetadata.dashboardUrl ?? input.provider.dashboardUrl,
    billingUrl: result.normalizedMetadata.billingUrl ?? input.provider.billingUrl,
    editUrl: result.normalizedMetadata.editUrl ?? input.provider.editUrl,
    supportUrl: result.normalizedMetadata.supportUrl ?? input.provider.supportUrl,
    ownerDescription: input.provider.ownerDescription ?? result.ownerSummary.plainLanguagePurpose,
    connectionMethod: input.provider.connectionMethod,
    capabilityFlags: result.diagnostics.capabilityCoverage,
    tokenMetadata: result.verification.tokenMetadata as Prisma.InputJsonValue | undefined,
    normalizedMetadata: result.normalizedMetadata as Prisma.InputJsonValue,
    discoveredResources: result.resourceResolution as Prisma.InputJsonValue | undefined,
    billingSnapshot: result.billing as Prisma.InputJsonValue,
    healthSnapshot: result.health as Prisma.InputJsonValue,
    editDestinationHints: result.editDestinations as Prisma.InputJsonValue,
    setupSignals: result.setupSignals as Prisma.InputJsonValue,
    handoffSignals: result.handoffSignals as Prisma.InputJsonValue,
    diagnostics: result.diagnostics as Prisma.InputJsonValue,
    failureCode: result.verification.failureCode,
    failureSummary: result.verification.failureSummary,
    metadata: {
      ...(result.verification.providerMetadata ?? {}),
      providerTemplateSlug: input.provider.providerSlug ?? result.normalizedMetadata.providerSlug,
      ownerSummary: result.ownerSummary
    } as Prisma.InputJsonValue,
    notes: input.provider.notes,
    monthlyCostEstimate:
      input.provider.monthlyCostEstimate !== undefined
        ? new Prisma.Decimal(input.provider.monthlyCostEstimate)
        : undefined,
    renewalDate: input.provider.renewalDate,
    lastVerifiedAt: result.verification.verified ? new Date() : undefined,
    lastSyncAt: result.health.syncState === "SYNCED" ? new Date() : undefined,
    lastHealthCheckAt: new Date(result.health.checkedAt)
  } satisfies Prisma.ProviderConnectionUncheckedCreateInput;

  const createdProvider = await prisma.$transaction(async (tx) => {
    const provider = input.existingProviderId
      ? await tx.providerConnection.update({
          where: { id: input.existingProviderId },
          data: providerPayload
        })
      : await tx.providerConnection.create({
          data: {
            ...providerPayload,
            createdById: input.actorUserId
          }
        });

    if (input.provider.apiToken) {
      await storeProviderSecret(tx, {
        providerConnectionId: provider.id,
        secretType: "API_KEY",
        rawValue: input.provider.apiToken,
        createdById: input.actorUserId
      });
    }

    if (input.provider.oauthAccessToken) {
      await storeProviderSecret(tx, {
        providerConnectionId: provider.id,
        secretType: "ACCESS_TOKEN",
        rawValue: input.provider.oauthAccessToken,
        createdById: input.actorUserId,
        expiresAt: input.provider.oauthExpiresAt,
        scopes: input.provider.oauthScopes ?? []
      });
    }

    if (input.provider.oauthRefreshToken) {
      await storeProviderSecret(tx, {
        providerConnectionId: provider.id,
        secretType: "REFRESH_TOKEN",
        rawValue: input.provider.oauthRefreshToken,
        createdById: input.actorUserId
      });
    }

    if (input.provider.secureCredential) {
      await storeProviderSecret(tx, {
        providerConnectionId: provider.id,
        secretType: "SECURE_LINK_CREDENTIAL",
        rawValue: input.provider.secureCredential,
        createdById: input.actorUserId
      });
    }

    return provider;
  });

  return {
    provider: createdProvider,
    orchestration: result,
    wasReconnect: Boolean(input.existingProviderId)
  };
}

export async function rerunProviderDiagnostics(provider: ProviderConnectionModel & {
  secrets?: Array<{ encryptedValue: string; secretType: string; status: string }>;
}) {
  const adapter = getProviderAdapter(provider.adapterKey ?? provider.providerName);
  return {
    adapter: adapter.getProviderDefinition(),
    auth: adapter.getAuthStrategy(),
    capabilities: adapter.getCapabilities()
  };
}
