import { z } from "zod";

import type { ProviderTemplate } from "@/lib/data/provider-catalog";
import { PROVIDER_CATALOG, getTemplateBySlug } from "@/lib/data/provider-catalog";
import type { WalletTemplate } from "@/lib/data/wallet-templates";

export const setupIntentSchema = z.enum([
  "ongoing-management",
  "full-handoff",
  "portfolio-ops",
  "agency-ops",
  "owner-control"
]);

export const updateCadenceSchema = z.enum(["rarely", "monthly", "weekly", "daily"]);

export const setupProfileSchema = z.object({
  setupIntent: setupIntentSchema.default("full-handoff"),
  updateCadence: updateCadenceSchema.default("monthly"),
  domainProviderSlug: z.string().trim().max(80).optional().or(z.literal("")),
  hostingProviderSlug: z.string().trim().max(80).optional().or(z.literal("")),
  cmsProviderSlug: z.string().trim().max(80).optional().or(z.literal("")),
  databaseProviderSlug: z.string().trim().max(80).optional().or(z.literal("")),
  paymentsProviderSlug: z.string().trim().max(80).optional().or(z.literal("")),
  analyticsProviderSlug: z.string().trim().max(80).optional().or(z.literal("")),
  authProviderSlug: z.string().trim().max(80).optional().or(z.literal("")),
  schedulingProviderSlug: z.string().trim().max(80).optional().or(z.literal("")),
  supportProviderSlug: z.string().trim().max(80).optional().or(z.literal("")),
  emailProviderSlug: z.string().trim().max(80).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal(""))
});

export type WalletSetupProfile = z.infer<typeof setupProfileSchema>;

export type SetupSlotKey =
  | "domainProviderSlug"
  | "hostingProviderSlug"
  | "cmsProviderSlug"
  | "databaseProviderSlug"
  | "paymentsProviderSlug"
  | "analyticsProviderSlug"
  | "authProviderSlug"
  | "schedulingProviderSlug"
  | "supportProviderSlug"
  | "emailProviderSlug";

type SetupSlotDefinition = {
  key: SetupSlotKey;
  label: string;
  category: ProviderTemplate["category"];
  helper: string;
  optional?: boolean;
};

const SETUP_SLOT_DEFINITIONS: SetupSlotDefinition[] = [
  {
    key: "domainProviderSlug",
    label: "Domain provider",
    category: "DOMAIN",
    helper: "Where the website's domain name is registered or managed."
  },
  {
    key: "hostingProviderSlug",
    label: "Hosting provider",
    category: "HOSTING",
    helper: "Where the live website is deployed and served from."
  },
  {
    key: "cmsProviderSlug",
    label: "Content editor",
    category: "CMS",
    helper: "Where pages, text, blog posts, or media are updated.",
    optional: true
  },
  {
    key: "databaseProviderSlug",
    label: "Database",
    category: "DATABASE",
    helper: "Where app data, submissions, or dynamic records live.",
    optional: true
  },
  {
    key: "paymentsProviderSlug",
    label: "Payments",
    category: "PAYMENTS",
    helper: "Where payments, subscriptions, or checkout activity are managed.",
    optional: true
  },
  {
    key: "analyticsProviderSlug",
    label: "Analytics",
    category: "ANALYTICS",
    helper: "Where website traffic and performance are tracked.",
    optional: true
  },
  {
    key: "authProviderSlug",
    label: "Sign-in and identity",
    category: "AUTH_IDENTITY",
    helper: "Where user sign-in and account access are handled.",
    optional: true
  },
  {
    key: "schedulingProviderSlug",
    label: "Scheduling",
    category: "SCHEDULING",
    helper: "Where appointment or booking flows live.",
    optional: true
  },
  {
    key: "supportProviderSlug",
    label: "Support",
    category: "SUPPORT",
    helper: "Where support inboxes, tickets, or help requests are handled.",
    optional: true
  },
  {
    key: "emailProviderSlug",
    label: "Email and forms",
    category: "EMAIL_FORMS",
    helper: "Where email sending or contact form delivery is managed.",
    optional: true
  }
];

export function getEmptySetupProfile(): WalletSetupProfile {
  return {
    setupIntent: "full-handoff",
    updateCadence: "monthly",
    domainProviderSlug: "",
    hostingProviderSlug: "",
    cmsProviderSlug: "",
    databaseProviderSlug: "",
    paymentsProviderSlug: "",
    analyticsProviderSlug: "",
    authProviderSlug: "",
    schedulingProviderSlug: "",
    supportProviderSlug: "",
    emailProviderSlug: "",
    notes: ""
  };
}

export function parseStoredSetupProfile(value: unknown): WalletSetupProfile {
  const result = setupProfileSchema.safeParse(value);
  return result.success ? result.data : getEmptySetupProfile();
}

export function getSetupSlotDefinitions() {
  return SETUP_SLOT_DEFINITIONS;
}

export function getProviderOptionsByCategory(category: ProviderTemplate["category"]) {
  return PROVIDER_CATALOG.filter((provider) => provider.category === category);
}

export function getIntentLabel(intent: WalletSetupProfile["setupIntent"]) {
  switch (intent) {
    case "ongoing-management":
      return "Keep managing the site";
    case "portfolio-ops":
      return "Organize a growing portfolio";
    case "agency-ops":
      return "Standardize agency delivery";
    case "owner-control":
      return "Give the owner simple control";
    default:
      return "Prepare a clean handoff";
  }
}

export function getIntentDescription(intent: WalletSetupProfile["setupIntent"]) {
  switch (intent) {
    case "ongoing-management":
      return "Optimize the wallet for continued developer support, quick operations, and shared visibility.";
    case "portfolio-ops":
      return "Prioritize repeatable stack memory, speed, and less context switching across many sites.";
    case "agency-ops":
      return "Keep the process consistent across team members, handoffs, and future support.";
    case "owner-control":
      return "Lead with owner confidence, plain language, and the simplest possible next steps.";
    default:
      return "Structure the wallet so the owner can accept it and feel everything is already in order.";
  }
}

export type SetupConnectionTarget = {
  key: SetupSlotKey;
  label: string;
  category: ProviderTemplate["category"];
  helper: string;
  providerSlug: string | null;
  providerName: string;
  source: "selected" | "recommended" | "unknown";
  status: "connected" | "attention_needed" | "repair_needed" | "ready_to_connect" | "missing";
  description: string;
  statusDetail: string;
  actionLabel: string;
  href: string | null;
};

type ExistingProvider = {
  id: string;
  providerName: string;
  category: string;
  connectionState?: string | null;
  healthStatus?: string | null;
  connectionConfidence?: number | null;
  reconnectRequired?: boolean | null;
  metadata?: Record<string, unknown>;
};

function getExistingProviderStatus(existing: ExistingProvider | null): SetupConnectionTarget["status"] {
  if (!existing) {
    return "missing";
  }

  if (
    existing.reconnectRequired ||
    existing.healthStatus === "DISCONNECTED" ||
    existing.connectionState === "RECONNECT_REQUIRED" ||
    existing.connectionState === "FAILED" ||
    existing.connectionState === "AWAITING_SELECTION"
  ) {
    return "repair_needed";
  }

  if (
    existing.healthStatus === "ATTENTION_NEEDED" ||
    existing.healthStatus === "ISSUE_DETECTED" ||
    (typeof existing.connectionConfidence === "number" && existing.connectionConfidence < 60)
  ) {
    return "attention_needed";
  }

  return "connected";
}

function getStatusDetail(status: SetupConnectionTarget["status"], providerName: string) {
  switch (status) {
    case "connected":
      return `${providerName} is linked and ready inside this wallet.`;
    case "attention_needed":
      return `${providerName} is connected, but there are a few details worth reviewing before handoff.`;
    case "repair_needed":
      return `${providerName} needs repair before this part of the stack can be trusted.`;
    case "ready_to_connect":
      return `${providerName} is chosen and ready for one guided connection pass.`;
    default:
      return "Choose a provider so RAEYL can turn this into a guided connection step.";
  }
}

function getActionLabel(status: SetupConnectionTarget["status"]) {
  switch (status) {
    case "connected":
      return "Review connection";
    case "attention_needed":
      return "Review details";
    case "repair_needed":
      return "Repair connection";
    case "ready_to_connect":
      return "Connect now";
    default:
      return "Choose a provider";
  }
}

function normalizeProviderSlug(value: string) {
  return value.trim().toLowerCase();
}

function findExistingProviderForSlot(
  slot: SetupSlotDefinition,
  providerSlug: string | null,
  providers: ExistingProvider[]
) {
  return (
    providers.find((provider) => {
      const metadataSlug =
        provider.metadata &&
        typeof provider.metadata === "object" &&
        "providerTemplateSlug" in provider.metadata &&
        typeof provider.metadata.providerTemplateSlug === "string"
          ? normalizeProviderSlug(provider.metadata.providerTemplateSlug)
          : null;

      if (providerSlug && metadataSlug === normalizeProviderSlug(providerSlug)) {
        return true;
      }

      return provider.category === slot.category;
    }) ?? null
  );
}

function getRecommendedSlug(slot: SetupSlotDefinition, walletTemplate: WalletTemplate) {
  return (
    walletTemplate.recommendedProviderSlugs.find((slug) => {
      const template = getTemplateBySlug(slug);
      return template?.category === slot.category;
    }) ?? null
  );
}

export function buildSetupConnectionTargets(input: {
  walletId: string;
  setupProfile: WalletSetupProfile;
  walletTemplate: WalletTemplate;
  providers: ExistingProvider[];
  websites: Array<{ id: string }>;
}) {
  const websiteId = input.websites[0]?.id;
  const returnTo = encodeURIComponent(`/app/wallets/${input.walletId}/setup`);

  return SETUP_SLOT_DEFINITIONS.map((slot): SetupConnectionTarget => {
    const selectedSlug = input.setupProfile[slot.key] || null;
    const recommendedSlug = getRecommendedSlug(slot, input.walletTemplate);
    const providerSlug = selectedSlug || recommendedSlug;
    const providerTemplate = providerSlug ? getTemplateBySlug(providerSlug) : null;
    const existing = findExistingProviderForSlot(slot, providerSlug, input.providers);
    const status = existing ? getExistingProviderStatus(existing) : providerSlug ? "ready_to_connect" : "missing";
    const detailHref = existing ? `/app/wallets/${input.walletId}/providers/${existing.id}` : null;
    const providerName = providerTemplate?.displayName ?? existing?.providerName ?? "Not chosen yet";

    return {
      key: slot.key,
      label: slot.label,
      category: slot.category,
      helper: slot.helper,
      providerSlug,
      providerName,
      source: selectedSlug ? "selected" : providerSlug ? "recommended" : "unknown",
      status,
      description:
        providerTemplate?.defaultDescription ??
        "Choose the provider for this part of the website stack so RAEYL can connect or document it.",
      statusDetail: getStatusDetail(status, providerName),
      actionLabel: getActionLabel(status),
      href: existing
        ? detailHref
        : providerSlug
          ? `/app/wallets/${input.walletId}/providers/new?template=${providerSlug}${websiteId ? `&websiteId=${websiteId}` : ""}&returnTo=${returnTo}&setupChain=1`
          : null
    };
  });
}

export function getSetupQuestionCount(profile: WalletSetupProfile) {
  return SETUP_SLOT_DEFINITIONS.filter((slot) => profile[slot.key]).length;
}

export function pickNextSetupConnectionTarget(targets: SetupConnectionTarget[]) {
  return (
    targets.find((target) => target.status === "repair_needed") ??
    targets.find((target) => target.status === "ready_to_connect") ??
    targets.find((target) => target.status === "attention_needed") ??
    null
  );
}
