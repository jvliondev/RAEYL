import type { NormalizedProviderResource, ResourceResolution, WalletProviderContext } from "@/lib/providers/contracts";

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[^a-z0-9.-]+/g, " ")
    .trim();
}

function scoreCandidate(candidate: string, signals: string[]) {
  const normalizedCandidate = normalize(candidate);
  if (!normalizedCandidate) {
    return 0;
  }

  return signals.reduce((total, signal) => {
    const normalizedSignal = normalize(signal);
    if (!normalizedSignal) {
      return total;
    }

    if (normalizedCandidate === normalizedSignal) {
      return total + 45;
    }

    if (normalizedCandidate.includes(normalizedSignal) || normalizedSignal.includes(normalizedCandidate)) {
      return total + 28;
    }

    const parts = normalizedSignal.split(/\s+/).filter(Boolean);
    const overlap = parts.filter((part) => normalizedCandidate.includes(part)).length;
    return total + overlap * 6;
  }, 0);
}

export function getWalletMatchingSignals(context: WalletProviderContext) {
  return [
    context.businessName,
    context.websiteName,
    context.websiteUrl,
    context.primaryDomain,
    context.websiteDescription,
    context.businessCategory
  ].filter((value): value is string => Boolean(value && value.trim()));
}

export function resolveResourceSelection(input: {
  teams: NormalizedProviderResource[];
  resources: NormalizedProviderResource[];
  selectedTeamId?: string;
  selectedResourceValue?: string;
  context: WalletProviderContext;
  resourceLabel: string;
  teamLabel: string;
}): ResourceResolution {
  const signals = getWalletMatchingSignals(input.context);

  const scoredResources = input.resources.map((resource) => {
    const labelScore = scoreCandidate(resource.label, signals);
    const valueScore = scoreCandidate(resource.value, signals);
    const urlScore = scoreCandidate(resource.url ?? "", signals);
    const metadataScore = Object.values(resource.metadata ?? {}).reduce<number>((total, value) => {
      return typeof value === "string" ? total + scoreCandidate(value, signals) : total;
    }, 0);

    return {
      resource,
      score: Math.min(100, labelScore + valueScore + urlScore + metadataScore)
    };
  });

  const ranked = [...scoredResources].sort((a, b) => b.score - a.score);
  const top = ranked[0];
  const second = ranked[1];
  const explicitSelection = input.selectedResourceValue
    ? input.resources.find((resource) => resource.value === input.selectedResourceValue)
    : undefined;

  const autoSelected = !explicitSelection && Boolean(top && top.score >= 60 && (!second || top.score - second.score >= 15));
  const clarificationNeeded =
    !explicitSelection &&
    Boolean(input.resources.length > 1 && (!top || top.score < 45 || (second && top.score - second.score < 15)));

  const selectedTeamId = input.selectedTeamId ?? null;
  const selectedResourceValue = explicitSelection?.value ?? (autoSelected && top ? top.resource.value : null);
  const confidenceScore = explicitSelection ? 98 : top?.score ?? 25;

  const explanation = explicitSelection
    ? `Using the selected ${input.resourceLabel.toLowerCase()} from the connected account.`
    : autoSelected
      ? `RAEYL matched the most likely ${input.resourceLabel.toLowerCase()} using the wallet business name, domain, and website context.`
      : clarificationNeeded
        ? `Multiple ${input.resourceLabel.toLowerCase()} options look plausible, so RAEYL needs one quick confirmation.`
        : `RAEYL verified the account and stored the available ${input.resourceLabel.toLowerCase()} options for this wallet.`;

  return {
    teams: input.teams,
    resources: input.resources,
    selectedTeamId,
    selectedResourceValue,
    confidenceScore,
    autoSelected,
    clarificationNeeded,
    explanation
  };
}
