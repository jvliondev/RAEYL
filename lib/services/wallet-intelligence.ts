import type { WalletRole } from "@/lib/types";

import type { AlertRecord, BillingRecord, ProviderRecord, WebsiteRecord } from "@/lib/types";

type ChecklistItem = {
  key: string;
  label: string;
  description: string;
  complete: boolean;
  href?: string;
  priority: "critical" | "important" | "helpful";
};

type RecommendedAction = {
  label: string;
  description: string;
  href: string;
  tone: "default" | "warning" | "success";
};

type WalletIntelligenceInput = {
  role: WalletRole;
  walletId: string;
  firstWebsiteId?: string | null;
  websites: WebsiteRecord[];
  providers: ProviderRecord[];
  billing: BillingRecord[];
  alerts: AlertRecord[];
  ownerAccepted?: boolean;
};

export type WalletIntelligence = {
  score: number;
  scoreLabel: string;
  checklist: ChecklistItem[];
  primaryAction: RecommendedAction | null;
  supportingActions: RecommendedAction[];
  summary: string;
  duplicateProviders: string[];
};

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function getPrimaryEditRoute(websites: WebsiteRecord[]) {
  return websites.flatMap((website) => website.editRoutes).find((route) => route.isPrimary);
}

function getDuplicateProviders(providers: ProviderRecord[]) {
  const counts = new Map<string, number>();

  for (const provider of providers) {
    const key = normalizeName(provider.name);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([name]) => name);
}

function buildChecklist(input: WalletIntelligenceInput): ChecklistItem[] {
  const primaryRoute = getPrimaryEditRoute(input.websites);
  const hasHealthyConnection = input.providers.some(
    (provider) => provider.health === "healthy" || provider.health === "attention"
  );

  return [
    {
      key: "website",
      label: "Website profile added",
      description: "The live site, domain, and website basics are documented.",
      complete: input.websites.length > 0,
      href: `/app/wallets/${input.walletId}/websites/new`,
      priority: "critical"
    },
    {
      key: "providers",
      label: "Core tools connected",
      description: "Hosting, content, and other important services are listed in one place.",
      complete: input.providers.length > 0,
      href: `/app/wallets/${input.walletId}/providers/new`,
      priority: "critical"
    },
    {
      key: "verification",
      label: "At least one tool verified",
      description: "A live connection is working instead of only a manual record.",
      complete: hasHealthyConnection,
      href: `/app/wallets/${input.walletId}/providers`,
      priority: "important"
    },
    {
      key: "edit-route",
      label: "Primary edit path ready",
      description: "Owners can click one clear button to update the right part of the website.",
      complete: Boolean(primaryRoute),
      href: input.firstWebsiteId
        ? `/app/wallets/${input.walletId}/websites/${input.firstWebsiteId}`
        : `/app/wallets/${input.walletId}/websites/new`,
      priority: "critical"
    },
    {
      key: "billing",
      label: "Website costs tracked",
      description: "Billing visibility is set up so owners understand what they are paying for.",
      complete: input.billing.length > 0,
      href: `/app/wallets/${input.walletId}/billing`,
      priority: "important"
    },
    {
      key: "owner",
      label: "Owner access confirmed",
      description: "The owner has accepted access and can use the wallet with confidence.",
      complete: input.ownerAccepted ?? false,
      href: `/app/wallets/${input.walletId}/handoff`,
      priority: "important"
    }
  ];
}

function buildSummary(score: number, role: WalletRole, openAlerts: number) {
  if (role === "wallet_owner") {
    if (openAlerts > 0) {
      return "Your website is organized and visible here, with a small number of items that still need review.";
    }

    if (score >= 85) {
      return "Your website control center is fully set up and ready for everyday use.";
    }

    return "Your website is connected here, and the remaining setup items are being finished for you.";
  }

  if (score >= 85) {
    return "This wallet is in strong shape for handoff and everyday management.";
  }

  if (score >= 60) {
    return "The wallet is usable, but a few missing setup steps still weaken the handoff.";
  }

  return "This wallet still needs core setup work before it feels complete for the owner.";
}

function buildPrimaryAction(
  input: WalletIntelligenceInput,
  checklist: ChecklistItem[]
): RecommendedAction | null {
  const primaryRoute = getPrimaryEditRoute(input.websites);
  const firstCriticalGap = checklist.find((item) => !item.complete && item.priority === "critical");

  if (input.role === "wallet_owner") {
    if (primaryRoute) {
      return {
        label: "Edit your website",
        description: "Open the main editing path that was prepared for you.",
        href: primaryRoute.destinationUrl,
        tone: "success"
      };
    }

    if (input.alerts.length > 0) {
      return {
        label: "Review what needs attention",
        description: "See the few items that still need a decision or follow-up.",
        href: `/app/wallets/${input.walletId}/alerts`,
        tone: "warning"
      };
    }

    return {
      label: "Open your connected tools",
      description: "Review what powers the site and where each service lives.",
      href: `/app/wallets/${input.walletId}/providers`,
      tone: "default"
    };
  }

  if (firstCriticalGap) {
    return {
      label: `Complete: ${firstCriticalGap.label}`,
      description: firstCriticalGap.description,
      href: firstCriticalGap.href ?? `/app/wallets/${input.walletId}/setup`,
      tone: "warning"
    };
  }

  if (input.alerts.length > 0) {
    return {
      label: "Resolve open alerts",
      description: "Clear the issues that could make the wallet feel uncertain to the owner.",
      href: `/app/wallets/${input.walletId}/alerts`,
      tone: "warning"
    };
  }

  return {
    label: "Review handoff readiness",
    description: "Confirm the owner path, billing clarity, and connected tools before handoff.",
    href: `/app/wallets/${input.walletId}/handoff`,
    tone: "success"
  };
}

function buildSupportingActions(
  input: WalletIntelligenceInput,
  checklist: ChecklistItem[]
): RecommendedAction[] {
  const incomplete = checklist.filter((item) => !item.complete);
  const actions: RecommendedAction[] = [];

  for (const item of incomplete.slice(0, 3)) {
    actions.push({
      label: item.label,
      description: item.description,
      href: item.href ?? `/app/wallets/${input.walletId}/setup`,
      tone: item.priority === "critical" ? "warning" : "default"
    });
  }

  if (actions.length < 3 && input.alerts.length > 0) {
    actions.push({
      label: "Open alerts",
      description: "Review the issues already detected in this wallet.",
      href: `/app/wallets/${input.walletId}/alerts`,
      tone: "warning"
    });
  }

  if (
    actions.length < 3 &&
    input.role !== "wallet_owner" &&
    !actions.some((action) => action.href.endsWith("/support"))
  ) {
    actions.push({
      label: "Support inbox",
      description: "Check owner questions and keep communication in one place.",
      href: `/app/wallets/${input.walletId}/support`,
      tone: "default"
    });
  }

  return actions.slice(0, 3);
}

export function getWalletIntelligence(input: WalletIntelligenceInput): WalletIntelligence {
  const checklist = buildChecklist(input);
  const score = Math.round(
    (checklist.filter((item) => item.complete).length / Math.max(checklist.length, 1)) * 100
  );
  const duplicateProviders = getDuplicateProviders(input.providers);

  return {
    score,
    scoreLabel: score >= 85 ? "Strong" : score >= 60 ? "In progress" : "Needs setup",
    checklist,
    primaryAction: buildPrimaryAction(input, checklist),
    supportingActions: buildSupportingActions(input, checklist),
    summary: buildSummary(score, input.role, input.alerts.length),
    duplicateProviders
  };
}
