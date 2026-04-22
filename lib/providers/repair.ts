type ProviderRepairInput = {
  providerName: string;
  templateSlug?: string | null;
  connectionState?: string | null;
  health?: string | null;
  confidenceScore?: number | null;
  hasDashboardUrl?: boolean;
  hasBillingUrl?: boolean;
  hasEditUrl?: boolean;
  hasProjectId?: boolean;
  hasTeamId?: boolean;
  syncState?: string | null;
};

export type ProviderRepairPlan = {
  severity: "healthy" | "attention" | "issue";
  title: string;
  summary: string;
  nextSteps: string[];
};

export function getProviderRepairPlan(input: ProviderRepairInput): ProviderRepairPlan {
  if (input.connectionState === "Connected" && input.health === "healthy" && (input.confidenceScore ?? 0) >= 85) {
    return {
      severity: "healthy",
      title: "Connection looks solid",
      summary: "RAEYL has a confident match for this tool and the connection is in a good state.",
      nextSteps: [
        "Leave the connection as-is and let RAEYL keep using it for health and setup signals.",
        input.hasBillingUrl ? "Billing access is already in place." : "Add a billing link later if owners need direct billing visibility.",
        input.hasEditUrl ? "Edit access is already connected." : "Add an editor link if this tool should become a direct owner action."
      ]
    };
  }

  if (input.connectionState === "Awaiting Selection" || !input.hasProjectId) {
    return {
      severity: "attention",
      title: "One confirmation will make this precise",
      summary: "RAEYL verified the account, but it still needs the exact resource so future checks and links stay accurate.",
      nextSteps: [
        "Reconnect this tool and confirm the exact project or workspace.",
        input.hasTeamId ? "Keep the selected workspace if it is correct." : "Choose the correct workspace if the provider offers one.",
        "Save after selection so the wallet can trust future health, billing, and edit guidance."
      ]
    };
  }

  if (input.connectionState === "Reconnect Required" || input.health === "disconnected" || input.syncState === "Failed") {
    return {
      severity: "issue",
      title: "This connection needs repair",
      summary: "RAEYL cannot trust the live signal for this tool right now, so the safest move is to reconnect it.",
      nextSteps: [
        "Reconnect the tool with fresh credentials.",
        "Confirm the same project or choose the replacement resource if ownership changed.",
        input.hasDashboardUrl ? "Use the saved dashboard link to verify the external account still looks right." : "Add a working dashboard link during reconnect."
      ]
    };
  }

  if (!input.hasDashboardUrl && !input.hasBillingUrl && !input.hasEditUrl) {
    return {
      severity: "attention",
      title: "This record needs action links",
      summary: "The connection exists, but the wallet still lacks the links that make the tool useful to the owner.",
      nextSteps: [
        "Add a dashboard link so the owner or developer can open the right tool immediately.",
        "Add a billing or edit link if this provider affects costs or content work.",
        "Keep the owner-facing description plain and specific."
      ]
    };
  }

  return {
    severity: "attention",
    title: "This connection can get sharper",
    summary: "RAEYL has enough data to keep the record visible, but a refresh would improve confidence and future automation.",
    nextSteps: [
      "Reconnect the tool if you want higher-confidence matching.",
      "Add missing action links so the wallet is more complete.",
      "Review the latest diagnostics to see what RAEYL could and could not verify."
    ]
  };
}
