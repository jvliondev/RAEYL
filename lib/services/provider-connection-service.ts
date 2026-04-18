import { HealthStatus, ProviderConnectionMethod, ProviderStatus, SyncState } from "@prisma/client";
import { getVercelConnectionSnapshot } from "@/lib/services/vercel-service";

type VerificationInput = {
  providerName: string;
  connectionMethod: ProviderConnectionMethod;
  apiToken?: string;
  externalProjectId?: string;
  externalTeamId?: string;
};

type VerificationResult = {
  status: ProviderStatus;
  healthStatus: HealthStatus;
  syncState: SyncState;
  connectedAccountLabel?: string;
  externalProjectId?: string;
  externalTeamId?: string;
  dashboardUrl?: string;
  billingUrl?: string;
  editUrl?: string;
  tokenMetadata?: Record<string, string | number | boolean>;
  metadata?: Record<string, string | number | boolean>;
  notes?: string;
  lastSyncAt?: Date;
  lastHealthCheckAt?: Date;
};

function isVercelProvider(providerName: string) {
  return providerName.trim().toLowerCase().includes("vercel");
}

async function verifyVercelToken({
  apiToken,
  externalProjectId,
  externalTeamId
}: VerificationInput): Promise<VerificationResult> {
  if (!apiToken) {
    throw new Error("A Vercel API token is required to connect automatically.");
  }

  const snapshot = await getVercelConnectionSnapshot({
    apiToken,
    externalProjectId,
    externalTeamId
  });
  const selectedProject = snapshot.selectedProject ?? undefined;
  const selectedTeam = snapshot.selectedTeam ?? undefined;
  const projects = snapshot.projects;
  const accountLabel = snapshot.accountLabel;

  return {
    status: ProviderStatus.CONNECTED,
    healthStatus: selectedProject || projects.length <= 1 ? HealthStatus.HEALTHY : HealthStatus.ATTENTION_NEEDED,
    syncState: SyncState.SYNCED,
    connectedAccountLabel: selectedProject?.name
      ? `${accountLabel} • ${selectedProject.name}`
      : accountLabel,
    externalProjectId: selectedProject?.id,
    externalTeamId: selectedTeam?.id,
    dashboardUrl: snapshot.dashboardUrl,
    billingUrl: snapshot.billingUrl,
    tokenMetadata: {
      verifiedProvider: "vercel",
      verifiedAccount: accountLabel,
      projectCount: projects.length,
      teamCount: snapshot.teams.length
    },
    metadata: {
      accountLabel,
      vercelUserId: snapshot.user.id ?? "unknown",
      selectedProjectName: selectedProject?.name ?? "not selected",
      selectedTeamSlug: selectedTeam?.slug ?? "personal",
      availableProjects: projects.slice(0, 5).map((project) => project.name ?? project.id).join(", ") || "none",
      availableTeamSlugs:
        snapshot.teams.slice(0, 5).map((team) => team.slug ?? team.name ?? team.id).join(", ") || "none"
    },
    notes:
      projects.length > 1 && !selectedProject
        ? "Token verified. Multiple Vercel projects were found; add a project ID or name to lock this wallet to the right one."
        : undefined,
    lastSyncAt: new Date(),
    lastHealthCheckAt: new Date()
  };
}

export async function verifyProviderConnection(input: VerificationInput): Promise<VerificationResult | null> {
  if (input.connectionMethod === ProviderConnectionMethod.OAUTH) {
    throw new Error("OAuth connections are not available yet. Use API token or manual record for now.");
  }

  if (input.connectionMethod === ProviderConnectionMethod.MANUAL) {
    return {
      status: ProviderStatus.CONNECTED,
      healthStatus: HealthStatus.UNKNOWN,
      syncState: SyncState.DISABLED,
      lastHealthCheckAt: new Date()
    };
  }

  if (input.connectionMethod === ProviderConnectionMethod.SECURE_LINK) {
    return {
      status: ProviderStatus.CONNECTED,
      healthStatus: HealthStatus.UNKNOWN,
      syncState: SyncState.DISABLED,
      tokenMetadata: {
        verification: "manual_secure_link"
      },
      lastHealthCheckAt: new Date()
    };
  }

  if (input.connectionMethod === ProviderConnectionMethod.API_TOKEN && isVercelProvider(input.providerName)) {
    return verifyVercelToken(input);
  }

  if (input.connectionMethod === ProviderConnectionMethod.API_TOKEN) {
    return {
      status: ProviderStatus.PENDING_VERIFICATION,
      healthStatus: HealthStatus.ATTENTION_NEEDED,
      syncState: SyncState.PENDING,
      tokenMetadata: {
        verification: "stored_not_verified",
        reason: "provider_specific_verifier_not_implemented"
      },
      lastHealthCheckAt: new Date()
    };
  }

  return null;
}
