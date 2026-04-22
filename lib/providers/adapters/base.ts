import { ProviderCategory } from "@prisma/client/index";

import type {
  AdapterDiagnostics,
  ConnectProviderAdapter,
  InferredEditDestination,
  NormalizedProviderMetadata,
  ProviderAuthStrategy,
  ProviderCapability,
  ProviderConnectionInput,
  ProviderHealthCheckResult,
  ProviderOAuthConfig,
  ProviderOwnerSummary,
  ProviderSetupSignal,
  ProviderVerificationResult,
  ResourceResolution,
  WalletProviderContext
} from "@/lib/providers/contracts";

type BaseAdapterConfig = {
  key: string;
  slug: string;
  displayName: string;
  category: ProviderCategory;
  ownerLabel: string;
  authStrategy: ProviderAuthStrategy;
  capabilities: ProviderCapability[];
  ownerSummary: ProviderOwnerSummary;
};

export abstract class BaseProviderAdapter implements ConnectProviderAdapter {
  constructor(protected readonly config: BaseAdapterConfig) {}

  getProviderDefinition() {
    const { key, slug, displayName, category, ownerLabel } = this.config;
    return { key, slug, displayName, category, ownerLabel };
  }

  getCapabilities() {
    return this.config.capabilities;
  }

  getAuthStrategy() {
    return this.config.authStrategy;
  }

  getOAuthConfig(): ProviderOAuthConfig | null {
    return null;
  }

  abstract verifyConnection(
    context: WalletProviderContext,
    input: ProviderConnectionInput
  ): Promise<ProviderVerificationResult>;

  async normalizeConnectionMetadata(
    _context: WalletProviderContext,
    input: ProviderConnectionInput,
    verification: ProviderVerificationResult,
    resourceResolution?: ResourceResolution
  ): Promise<NormalizedProviderMetadata> {
    const definition = this.getProviderDefinition();

    return {
      providerName: input.providerName,
      providerSlug: definition.slug,
      category: input.category,
      accountLabel: verification.accountLabel,
      connectedAccountLabel: verification.connectedAccountLabel ?? input.connectedAccountLabel,
      teamId: resourceResolution?.selectedTeamId ?? verification.externalTeamId ?? input.externalTeamId ?? null,
      projectId:
        resourceResolution?.selectedResourceValue ?? verification.externalProjectId ?? input.externalProjectId ?? null,
      dashboardUrl: verification.dashboardUrl ?? input.dashboardUrl,
      billingUrl: verification.billingUrl ?? input.billingUrl,
      supportUrl: input.supportUrl,
      editUrl: verification.editUrl ?? input.editUrl,
      metadataSnapshot: {
        ...(verification.providerMetadata ?? {}),
        selectedTeamId: resourceResolution?.selectedTeamId ?? verification.externalTeamId ?? input.externalTeamId,
        selectedResourceValue:
          resourceResolution?.selectedResourceValue ?? verification.externalProjectId ?? input.externalProjectId
      }
    };
  }

  async syncBilling(
    _context: WalletProviderContext,
    _input: ProviderConnectionInput,
    metadata: NormalizedProviderMetadata
  ) {
    return metadata.billingUrl
      ? [
          {
            label: `${metadata.providerName} billing`,
            cadence: "MONTHLY" as const,
            billingUrl: metadata.billingUrl,
            accountLabel: metadata.accountLabel
          }
        ]
      : [];
  }

  async runHealthCheck(
    _context: WalletProviderContext,
    _input: ProviderConnectionInput,
    metadata: NormalizedProviderMetadata
  ): Promise<ProviderHealthCheckResult> {
    return {
      state: "UNKNOWN",
      summary: metadata.projectId
        ? "Connection verified. Live health monitoring is not available for this provider yet."
        : "Connection saved. Add a specific resource to improve connection confidence.",
      syncState: "PENDING",
      warnings: [],
      nextStep: metadata.projectId ? undefined : "Reconnect and choose the exact project or resource.",
      checkedAt: new Date().toISOString()
    };
  }

  async inferEditDestinations(
    _context: WalletProviderContext,
    _input: ProviderConnectionInput,
    metadata: NormalizedProviderMetadata
  ): Promise<InferredEditDestination[]> {
    if (!metadata.editUrl) {
      return [];
    }

    return [
      {
        label: "Open editor",
        purpose: "Direct editing access for this connected system",
        destinationUrl: metadata.editUrl,
        destinationType: "dashboard",
        confidenceScore: 72,
        visibleToRoles: ["WALLET_OWNER", "DEVELOPER", "EDITOR"],
        recommendedPrimary: true
      }
    ];
  }

  getOwnerSummary(): ProviderOwnerSummary {
    return this.config.ownerSummary;
  }

  getSetupSignals(_context: WalletProviderContext, metadata: NormalizedProviderMetadata): ProviderSetupSignal[] {
    return [
      {
        key: `${this.config.slug}.connected`,
        label: `${this.config.displayName} connected`,
        complete: true
      },
      {
        key: `${this.config.slug}.resource`,
        label: "Specific resource selected",
        complete: Boolean(metadata.projectId),
        recommendation: metadata.projectId ? undefined : "Reconnect and confirm the exact project or resource."
      }
    ];
  }

  getHandoffSignals(_context: WalletProviderContext, metadata: NormalizedProviderMetadata): ProviderSetupSignal[] {
    return [
      {
        key: `${this.config.slug}.owner_summary`,
        label: "Owner-friendly tool summary ready",
        complete: true
      },
      {
        key: `${this.config.slug}.actionable_link`,
        label: "Action link available",
        complete: Boolean(metadata.dashboardUrl || metadata.editUrl || metadata.billingUrl),
        recommendation:
          metadata.dashboardUrl || metadata.editUrl || metadata.billingUrl
            ? undefined
            : "Add a working dashboard, billing, or editor link so the owner knows where to go."
      }
    ];
  }

  getDiagnostics(
    metadata: NormalizedProviderMetadata,
    verification: ProviderVerificationResult,
    resourceResolution?: ResourceResolution
  ): AdapterDiagnostics {
    return {
      adapterKey: this.config.key,
      capabilityCoverage: this.getCapabilities(),
      lifecycleState: verification.connectionState,
      confidenceScore: resourceResolution?.confidenceScore ?? verification.confidenceScore,
      summary: verification.failureSummary ?? "Connection processed through the provider adapter.",
      details: {
        projectId: metadata.projectId,
        teamId: metadata.teamId,
        verified: verification.verified,
        clarificationNeeded: resourceResolution?.clarificationNeeded ?? false
      }
    };
  }
}
