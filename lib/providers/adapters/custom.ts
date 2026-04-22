import { ProviderConnectionMethod } from "@prisma/client/index";

import { BaseProviderAdapter } from "@/lib/providers/adapters/base";
import type {
  NormalizedProviderMetadata,
  ProviderConnectionInput,
  ProviderVerificationResult,
  WalletProviderContext
} from "@/lib/providers/contracts";

export class CustomProviderAdapter extends BaseProviderAdapter {
  constructor() {
    super({
      key: "custom",
      slug: "custom",
      displayName: "Custom",
      category: "CUSTOM",
      ownerLabel: "Connected tool",
      authStrategy: {
        type: "manual",
        connectionMethod: ProviderConnectionMethod.MANUAL,
        title: "Guided record",
        description: "Save the tool with the right links and a clear owner explanation.",
        fields: [],
        securityNote: "Use manual records when there is no supported live connection yet.",
        supportsReconnect: true
      },
      capabilities: ["dashboardUrl", "manualFallback", "reconnect"],
      ownerSummary: {
        plainLanguagePurpose: "This connected system is part of the website stack for this wallet.",
        importedSummary: "RAEYL saved the key links and context for this tool.",
        whyItMatters: "It keeps the website stack understandable, even when a tool is managed outside RAEYL.",
        actionGuidance: "Open the saved dashboard or support links when work is needed.",
        healthyMeans: "The links are current and the owner knows what the tool is for.",
        warningMeans: "The record is missing enough detail for a confident handoff."
      }
    });
  }

  async verifyConnection(
    _context: WalletProviderContext,
    input: ProviderConnectionInput
  ): Promise<ProviderVerificationResult> {
    const method = input.connectionMethod;

    if (method === ProviderConnectionMethod.MANUAL || method === ProviderConnectionMethod.SECURE_LINK) {
      return {
        verified: true,
        accountLabel: input.connectedAccountLabel ?? input.providerName,
        connectedAccountLabel: input.connectedAccountLabel ?? input.providerName,
        dashboardUrl: input.dashboardUrl,
        billingUrl: input.billingUrl,
        editUrl: input.editUrl,
        providerMetadata: {
          mode: method === ProviderConnectionMethod.MANUAL ? "manual_record" : "secure_link_record"
        },
        connectionState: "CONNECTED",
        syncState: "DISABLED",
        healthState: "UNKNOWN",
        confidenceScore: input.dashboardUrl || input.billingUrl || input.editUrl ? 82 : 55
      };
    }

    return {
      verified: Boolean(input.apiToken),
      accountLabel: input.connectedAccountLabel ?? input.providerName,
      connectedAccountLabel: input.connectedAccountLabel ?? input.providerName,
      dashboardUrl: input.dashboardUrl,
      billingUrl: input.billingUrl,
      editUrl: input.editUrl,
      providerMetadata: {
        mode: "token_saved_unverified"
      },
      connectionState: input.apiToken ? "CONNECTED" : "AWAITING_AUTH",
      syncState: input.apiToken ? "PENDING" : "DISABLED",
      healthState: input.apiToken ? "ATTENTION_NEEDED" : "UNKNOWN",
      confidenceScore: input.apiToken ? 65 : 40,
      failureSummary: input.apiToken
        ? undefined
        : "Add credentials or use a manual record so RAEYL can keep this tool useful."
    };
  }

  async runHealthCheck(
    _context: WalletProviderContext,
    input: ProviderConnectionInput,
    _metadata: NormalizedProviderMetadata
  ) {
    const hasActionLinks = Boolean(input.dashboardUrl || input.billingUrl || input.editUrl);
    return {
      state: hasActionLinks ? ("HEALTHY" as const) : ("UNKNOWN" as const),
      summary:
        hasActionLinks
          ? "Manual record is in place with working action links."
          : "Manual record saved. Add working links to make this tool more useful in the wallet.",
      syncState: "DISABLED" as const,
      warnings: hasActionLinks ? [] : ["No action links saved yet"],
      checkedAt: new Date().toISOString(),
      nextStep:
        hasActionLinks
          ? undefined
          : "Add a dashboard, billing, or editor link so the owner knows where to go."
    };
  }

  async inferEditDestinations(
    _context: WalletProviderContext,
    input: ProviderConnectionInput,
    metadata: NormalizedProviderMetadata
  ) {
    if (!metadata.editUrl) {
      return [];
    }

    const isCmsLike = input.category === "CMS";
    const providerName = input.providerName.toLowerCase();

    if (isCmsLike || providerName.includes("sanity") || providerName.includes("contentful") || providerName.includes("webflow")) {
      return [
        {
          label: "Edit website",
          purpose: "Primary content editing workspace for the website",
          destinationUrl: metadata.editUrl,
          destinationType: "cms" as const,
          confidenceScore: 90,
          visibleToRoles: ["WALLET_OWNER", "DEVELOPER", "EDITOR"],
          recommendedPrimary: true
        },
        {
          label: "Edit homepage",
          purpose: "Quick path to update the main content surface",
          destinationUrl: metadata.editUrl,
          destinationType: "content_collection" as const,
          confidenceScore: 72,
          visibleToRoles: ["WALLET_OWNER", "DEVELOPER", "EDITOR"],
          recommendedPrimary: false
        }
      ];
    }

    return super.inferEditDestinations(_context, input, metadata);
  }
}
