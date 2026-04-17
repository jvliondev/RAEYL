import { HealthStatus, ProviderConnectionMethod, ProviderStatus, SyncState } from "@prisma/client";

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

async function fetchJson<T>(url: string, token: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Provider verification failed (${response.status}): ${body || "Unknown response."}`);
  }

  return (await response.json()) as T;
}

async function verifyVercelToken({
  apiToken,
  externalProjectId,
  externalTeamId
}: VerificationInput): Promise<VerificationResult> {
  if (!apiToken) {
    throw new Error("A Vercel API token is required to connect automatically.");
  }

  const [userResult, teamsResult, projectsResult] = await Promise.all([
    fetchJson<{ user?: { id?: string; username?: string; email?: string; name?: string } }>(
      "https://api.vercel.com/v2/user",
      apiToken
    ),
    fetchJson<{ teams?: Array<{ id: string; slug?: string; name?: string }> }>(
      "https://api.vercel.com/v2/teams",
      apiToken
    ).catch(() => ({ teams: [] })),
    fetchJson<{
      projects?: Array<{
        id: string;
        name?: string;
        accountId?: string;
      }>;
    }>("https://api.vercel.com/v10/projects", apiToken).catch(() => ({ projects: [] }))
  ]);

  const teams = teamsResult.teams ?? [];
  const projects = projectsResult.projects ?? [];
  const selectedProject =
    projects.find((project) => project.id === externalProjectId || project.name === externalProjectId) ??
    (projects.length === 1 ? projects[0] : undefined);
  const selectedTeam =
    teams.find((team) => team.id === externalTeamId || team.slug === externalTeamId || team.name === externalTeamId) ??
    (teams.length === 1 ? teams[0] : undefined);
  const accountLabel =
    userResult.user?.name ??
    userResult.user?.username ??
    userResult.user?.email ??
    "Verified Vercel account";

  return {
    status: ProviderStatus.CONNECTED,
    healthStatus: selectedProject || projects.length <= 1 ? HealthStatus.HEALTHY : HealthStatus.ATTENTION_NEEDED,
    syncState: SyncState.SYNCED,
    connectedAccountLabel: selectedProject?.name
      ? `${accountLabel} • ${selectedProject.name}`
      : accountLabel,
    externalProjectId: selectedProject?.id,
    externalTeamId: selectedTeam?.id,
    dashboardUrl:
      selectedProject && selectedTeam?.slug
        ? `https://vercel.com/${selectedTeam.slug}/${selectedProject.name ?? selectedProject.id}`
        : "https://vercel.com/dashboard",
    billingUrl: "https://vercel.com/account/billing",
    tokenMetadata: {
      verifiedProvider: "vercel",
      verifiedAccount: accountLabel,
      projectCount: projects.length,
      teamCount: teams.length
    },
    metadata: {
      accountLabel,
      vercelUserId: userResult.user?.id ?? "unknown",
      selectedProjectName: selectedProject?.name ?? "not selected",
      selectedTeamSlug: selectedTeam?.slug ?? "personal",
      availableProjects: projects.slice(0, 5).map((project) => project.name ?? project.id).join(", ") || "none"
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
