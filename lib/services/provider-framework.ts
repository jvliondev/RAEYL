import { getTemplateBySlug } from "@/lib/data/provider-catalog";

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

const PROFILES: Record<string, ProviderFrameworkProfile> = {
  vercel: {
    slug: "vercel",
    bestConnectionMethod: "API_TOKEN",
    autoImportLabel: "Verify account, discover projects, and lock the wallet to the right deployment.",
    oauthStatus: "planned",
    supportsLiveVerification: true,
    supportsHealthChecks: true,
    supportsBillingSync: false,
    supportsEditRouting: false,
    fieldsToPrioritize: ["apiToken", "externalProjectId", "externalTeamId"],
    reconnectAdvice: "Reconnect with a fresh token if project health stops updating or the team changes.",
    ownerTrustNote: "When this is verified, the owner can trust that hosting status is coming from the live platform."
  },
  sanity: {
    slug: "sanity",
    bestConnectionMethod: "API_TOKEN",
    autoImportLabel: "Store the Studio links and prepare the CMS for direct edit routing.",
    oauthStatus: "planned",
    supportsLiveVerification: false,
    supportsHealthChecks: false,
    supportsBillingSync: false,
    supportsEditRouting: true,
    fieldsToPrioritize: ["dashboardUrl", "editUrl", "apiToken"],
    reconnectAdvice: "Keep the Studio URL current so owners always land in the right editing workspace.",
    ownerTrustNote: "This tool becomes valuable when the editing link is explicit and labeled in plain language."
  },
  stripe: {
    slug: "stripe",
    bestConnectionMethod: "API_TOKEN",
    autoImportLabel: "Store billing and dashboard links with room for future payment health checks.",
    oauthStatus: "planned",
    supportsLiveVerification: false,
    supportsHealthChecks: false,
    supportsBillingSync: false,
    supportsEditRouting: false,
    fieldsToPrioritize: ["dashboardUrl", "billingUrl", "apiToken"],
    reconnectAdvice: "Reconnect if payment owners change or the account moves to another workspace.",
    ownerTrustNote: "Owners need a clear explanation of what Stripe does and when to open it."
  },
  "cloudflare-dns": {
    slug: "cloudflare-dns",
    bestConnectionMethod: "API_TOKEN",
    autoImportLabel: "Keep DNS and domain access discoverable in one place.",
    oauthStatus: "planned",
    supportsLiveVerification: false,
    supportsHealthChecks: false,
    supportsBillingSync: false,
    supportsEditRouting: false,
    fieldsToPrioritize: ["dashboardUrl", "billingUrl", "apiToken"],
    reconnectAdvice: "Reconnect if DNS ownership changes or the zone moves to another account.",
    ownerTrustNote: "Domain tools are high-trust surfaces because owners care about renewals and continuity."
  }
};

const DEFAULT_PROFILE: ProviderFrameworkProfile = {
  slug: "custom",
  bestConnectionMethod: "MANUAL",
  autoImportLabel: "Store the dashboard, support, billing, and owner explanation cleanly.",
  oauthStatus: "not_recommended",
  supportsLiveVerification: false,
  supportsHealthChecks: false,
  supportsBillingSync: false,
  supportsEditRouting: false,
  fieldsToPrioritize: ["dashboardUrl", "billingUrl", "ownerDescription"],
  reconnectAdvice: "Review this record manually when account access or ownership changes.",
  ownerTrustNote: "A clear description and working links matter more than raw technical metadata."
};

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function getProviderFrameworkProfile(input: { slug?: string | null; providerName?: string | null }) {
  const templateSlug = input.slug ? slugify(input.slug) : null;
  const direct = templateSlug ? PROFILES[templateSlug] : null;

  if (direct) {
    return direct;
  }

  const derivedTemplate = input.providerName ? getTemplateBySlug(slugify(input.providerName)) : undefined;
  if (derivedTemplate?.slug && PROFILES[derivedTemplate.slug]) {
    return PROFILES[derivedTemplate.slug];
  }

  return DEFAULT_PROFILE;
}
