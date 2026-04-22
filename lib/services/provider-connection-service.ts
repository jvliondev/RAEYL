import { HealthStatus, ProviderConnectionMethod, ProviderStatus, SyncState } from "@prisma/client/index";
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

function isSupabaseProvider(providerName: string) {
  return providerName.trim().toLowerCase().includes("supabase");
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

async function verifySupabaseToken({
  apiToken,
  externalProjectId,
  externalTeamId
}: VerificationInput): Promise<VerificationResult> {
  if (!apiToken) {
    throw new Error("A Supabase personal access token is required to connect automatically.");
  }

  const [organizations, projects] = await Promise.all([
    fetchJson<Array<{ id: string; slug?: string; name?: string }>>("https://api.supabase.com/v1/organizations", apiToken).catch(() => []),
    fetchJson<
      Array<{
        id: string;
        ref?: string;
        organization_id?: string;
        organization_slug?: string;
        name?: string;
        region?: string;
        status?: string;
        database?: {
          host?: string;
          version?: string;
        };
      }>
    >("https://api.supabase.com/v1/projects", apiToken).catch(() => [])
  ]);

  const selectedOrganization =
    organizations.find(
      (organization) =>
        organization.id === externalTeamId ||
        organization.slug === externalTeamId ||
        organization.name === externalTeamId
    ) ?? (organizations.length === 1 ? organizations[0] : undefined);

  const visibleProjects = selectedOrganization
    ? projects.filter(
        (project) =>
          project.organization_id === selectedOrganization.id ||
          project.organization_slug === selectedOrganization.slug
      )
    : projects;

  const selectedProject =
    visibleProjects.find(
      (project) =>
        project.id === externalProjectId ||
        project.ref === externalProjectId ||
        project.name === externalProjectId
    ) ?? (visibleProjects.length === 1 ? visibleProjects[0] : undefined);

  const accountLabel =
    selectedOrganization?.name ??
    selectedOrganization?.slug ??
    projects[0]?.organization_slug ??
    "Verified Supabase account";

  const selectedProjectRef = selectedProject?.ref ?? selectedProject?.id;
  const organizationSlug = selectedOrganization?.slug ?? selectedProject?.organization_slug;

  return {
    status: ProviderStatus.CONNECTED,
    healthStatus: selectedProject || visibleProjects.length <= 1 ? HealthStatus.HEALTHY : HealthStatus.ATTENTION_NEEDED,
    syncState: SyncState.SYNCED,
    connectedAccountLabel: selectedProject?.name ? `${accountLabel} • ${selectedProject.name}` : accountLabel,
    externalProjectId: selectedProjectRef,
    externalTeamId: selectedOrganization?.id,
    dashboardUrl: selectedProjectRef
      ? `https://supabase.com/dashboard/project/${selectedProjectRef}`
      : "https://supabase.com/dashboard/projects",
    billingUrl: organizationSlug
      ? `https://supabase.com/dashboard/org/${organizationSlug}/billing`
      : "https://supabase.com/dashboard/account/tokens",
    tokenMetadata: {
      verifiedProvider: "supabase",
      verifiedAccount: accountLabel,
      projectCount: visibleProjects.length,
      organizationCount: organizations.length
    },
    metadata: {
      accountLabel,
      selectedProjectName: selectedProject?.name ?? "not selected",
      selectedProjectRef: selectedProjectRef ?? "not selected",
      selectedOrganizationSlug: organizationSlug ?? "not selected",
      databaseHost: selectedProject?.database?.host ?? "not available",
      region: selectedProject?.region ?? "not available",
      availableProjects:
        visibleProjects.slice(0, 5).map((project) => project.name ?? project.ref ?? project.id).join(", ") || "none"
    },
    notes:
      visibleProjects.length > 1 && !selectedProject
        ? "Token verified. Multiple Supabase projects were found; choose the right project ref so this wallet stays precise."
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

  if (input.connectionMethod === ProviderConnectionMethod.API_TOKEN && isSupabaseProvider(input.providerName)) {
    return verifySupabaseToken(input);
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
