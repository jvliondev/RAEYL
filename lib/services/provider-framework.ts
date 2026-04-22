import { getProviderAdapter } from "@/lib/providers/registry";

type ProviderFrameworkProfile = {
  slug: string;
  bestConnectionMethod: "OAUTH" | "API_TOKEN" | "MANUAL" | "SECURE_LINK";
  autoImportLabel: string;
  oauthStatus: "available" | "planned" | "not_recommended";
  supportsLiveVerification: boolean;
  supportsHealthChecks: boolean;
  supportsBillingSync: boolean;
  supportsEditRouting: boolean;
  fieldsToPrioritize: string[];
  reconnectAdvice: string;
  ownerTrustNote: string;
};

export function getProviderFrameworkProfile(input: { slug?: string | null; providerName?: string | null }): ProviderFrameworkProfile {
  const adapter = getProviderAdapter(input.slug ?? input.providerName);
  const definition = adapter.getProviderDefinition();
  const authStrategy = adapter.getAuthStrategy();
  const capabilities = adapter.getCapabilities();
  const oauthConfig = adapter.getOAuthConfig?.();
  const ownerSummary = adapter.getOwnerSummary(
    {
      walletId: "preview",
      businessName: "Preview wallet"
    },
    {
      providerName: definition.displayName,
      providerSlug: definition.slug,
      category: definition.category,
      metadataSnapshot: {}
    }
  );

  return {
    slug: definition.slug,
    bestConnectionMethod: authStrategy.connectionMethod,
    autoImportLabel: ownerSummary.importedSummary,
    oauthStatus:
      authStrategy.type === "oauth" || authStrategy.type === "hybrid" || Boolean(oauthConfig)
        ? "available"
        : capabilities.includes("oauth")
          ? "planned"
          : "not_recommended",
    supportsLiveVerification: capabilities.includes("apiToken") || capabilities.includes("oauth"),
    supportsHealthChecks: capabilities.includes("healthChecks"),
    supportsBillingSync: capabilities.includes("billingSync"),
    supportsEditRouting: capabilities.includes("editRouteInference"),
    fieldsToPrioritize: authStrategy.fields.map((field) => field.key),
    reconnectAdvice: capabilities.includes("reconnect")
      ? "Reconnect with fresh credentials if the account changes or live verification falls behind."
      : "Review this record manually whenever ownership or access changes.",
    ownerTrustNote: ownerSummary.whyItMatters
  };
}
