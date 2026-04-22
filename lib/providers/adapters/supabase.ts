import { ProviderConnectionMethod } from "@prisma/client/index";

import { BaseProviderAdapter } from "@/lib/providers/adapters/base";
import type {
  NormalizedProviderMetadata,
  ProviderConnectionInput,
  ProviderHealthCheckResult,
  ProviderVerificationResult,
  WalletProviderContext
} from "@/lib/providers/contracts";
import { resolveResourceSelection } from "@/lib/providers/matching";

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
    throw new Error(`Supabase verification failed (${response.status}): ${body || "Unknown response."}`);
  }

  return (await response.json()) as T;
}

export class SupabaseProviderAdapter extends BaseProviderAdapter {
  constructor() {
    super({
      key: "supabase",
      slug: "supabase",
      displayName: "Supabase",
      category: "DATABASE",
      ownerLabel: "Database and storage",
      authStrategy: {
        type: "api_token",
        connectionMethod: ProviderConnectionMethod.API_TOKEN,
        title: "Supabase guided connection",
        description: "Paste a personal access token once and let RAEYL find the correct organization and project.",
        fields: [
          {
            key: "apiToken",
            label: "Supabase personal access token",
            type: "password",
            placeholder: "Paste Supabase access token",
            required: true,
            hint: "Stored encrypted after save. Used for verification, discovery, and future health checks."
          }
        ],
        securityNote: "RAEYL stores the token encrypted and only uses it to verify the linked project.",
        supportsReconnect: true,
        tokenStorageExpectation: "Encrypted personal access token."
      },
      capabilities: ["oauth", "apiToken", "dashboardUrl", "resourceDiscovery", "reconnect", "manualFallback"],
      ownerSummary: {
        plainLanguagePurpose: "This provider stores your website data, storage, and backend services.",
        importedSummary: "RAEYL imported the Supabase organization and project details it could verify.",
        whyItMatters: "It helps the owner understand where forms, accounts, and dynamic website data live.",
        actionGuidance: "Open Supabase when a developer needs to inspect the project backend or project settings.",
        healthyMeans: "The selected project is still reachable and the saved project reference is current.",
        warningMeans: "The token may need to be refreshed or the project still needs to be confirmed."
      }
    });
  }

  getOAuthConfig() {
    return {
      authorizationUrl: "https://api.supabase.com/v1/oauth/authorize",
      tokenUrl: "https://api.supabase.com/v1/oauth/token",
      scopes: ["organizations:read", "projects:read"],
      clientIdEnvKey: "SUPABASE_OAUTH_CLIENT_ID",
      clientSecretEnvKey: "SUPABASE_OAUTH_CLIENT_SECRET"
    };
  }

  async verifyConnection(
    _context: WalletProviderContext,
    input: ProviderConnectionInput
  ): Promise<ProviderVerificationResult> {
    if (!input.apiToken) {
      return {
        verified: false,
        connectionState: "AWAITING_AUTH",
        syncState: "PENDING",
        healthState: "UNKNOWN",
        confidenceScore: 0,
        failureCode: "missing_token",
        failureSummary: "Add a Supabase token so RAEYL can verify the account and project."
      };
    }

    const [organizations, projects] = await Promise.all([
      fetchJson<Array<{ id: string; slug?: string; name?: string }>>("https://api.supabase.com/v1/organizations", input.apiToken).catch(() => []),
      fetchJson<
        Array<{
          id: string;
          ref?: string;
          organization_id?: string;
          organization_slug?: string;
          name?: string;
          region?: string;
          status?: string;
          database?: { host?: string; version?: string };
        }>
      >("https://api.supabase.com/v1/projects", input.apiToken).catch(() => [])
    ]);

    const selectedOrganization =
      organizations.find(
        (organization) =>
          organization.id === input.externalTeamId ||
          organization.slug === input.externalTeamId ||
          organization.name === input.externalTeamId
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
          project.id === input.externalProjectId ||
          project.ref === input.externalProjectId ||
          project.name === input.externalProjectId
      ) ?? (visibleProjects.length === 1 ? visibleProjects[0] : undefined);

    const projectRef = selectedProject?.ref ?? selectedProject?.id;
    const organizationSlug = selectedOrganization?.slug ?? selectedProject?.organization_slug;
    const accountLabel =
      selectedOrganization?.name ??
      selectedOrganization?.slug ??
      projects[0]?.organization_slug ??
      "Verified Supabase account";

    return {
      verified: true,
      accountLabel,
      connectedAccountLabel: selectedProject?.name ? `${accountLabel} • ${selectedProject.name}` : accountLabel,
      externalProjectId: projectRef,
      externalTeamId: selectedOrganization?.id,
      dashboardUrl: projectRef
        ? `https://supabase.com/dashboard/project/${projectRef}`
        : "https://supabase.com/dashboard/projects",
      billingUrl: organizationSlug
        ? `https://supabase.com/dashboard/org/${organizationSlug}/billing`
        : "https://supabase.com/dashboard/account/tokens",
      tokenMetadata: {
        verifiedProvider: "supabase",
        organizationCount: organizations.length,
        projectCount: visibleProjects.length
      },
      providerMetadata: {
        accountLabel,
        selectedProjectName: selectedProject?.name ?? "not selected",
        selectedProjectRef: projectRef ?? "not selected",
        selectedOrganizationSlug: organizationSlug ?? "not selected",
        region: selectedProject?.region ?? "unknown",
        databaseHost: selectedProject?.database?.host ?? "not available"
      },
      connectionState: selectedProject ? "CONNECTED" : visibleProjects.length > 1 ? "AWAITING_SELECTION" : "CONNECTED",
      syncState: "SYNCED",
      healthState: selectedProject || visibleProjects.length <= 1 ? "HEALTHY" : "ATTENTION_NEEDED",
      confidenceScore: selectedProject ? 95 : visibleProjects.length === 1 ? 86 : 56
    };
  }

  async discoverResources(context: WalletProviderContext, input: ProviderConnectionInput) {
    if (!input.apiToken) {
      throw new Error("A Supabase access token is required to discover projects.");
    }

    const [organizations, projects] = await Promise.all([
      fetchJson<Array<{ id: string; slug?: string; name?: string }>>("https://api.supabase.com/v1/organizations", input.apiToken).catch(() => []),
      fetchJson<
        Array<{
          id: string;
          ref?: string;
          organization_id?: string;
          organization_slug?: string;
          name?: string;
          region?: string;
        }>
      >("https://api.supabase.com/v1/projects", input.apiToken).catch(() => [])
    ]);

    const teams = organizations.map((organization) => ({
      id: organization.id,
      type: "team" as const,
      label: organization.name ?? organization.slug ?? organization.id,
      value: organization.id,
      metadata: {
        slug: organization.slug ?? null
      }
    }));

    const resources = projects.map((project) => ({
      id: project.id,
      type: "project" as const,
      label: project.name ?? project.ref ?? project.id,
      value: project.ref ?? project.id,
      parentId: project.organization_id ?? null,
      url: project.ref ? `https://supabase.com/dashboard/project/${project.ref}` : undefined,
      metadata: {
        region: project.region ?? null,
        organizationSlug: project.organization_slug ?? null
      }
    }));

    return resolveResourceSelection({
      teams,
      resources,
      selectedTeamId: input.externalTeamId,
      selectedResourceValue: input.externalProjectId,
      context,
      resourceLabel: "Project",
      teamLabel: "Organization"
    });
  }

  async normalizeConnectionMetadata(
    context: WalletProviderContext,
    input: ProviderConnectionInput,
    verification: ProviderVerificationResult,
    resourceResolution?: Awaited<ReturnType<SupabaseProviderAdapter["discoverResources"]>>
  ): Promise<NormalizedProviderMetadata> {
    const metadata = await super.normalizeConnectionMetadata(context, input, verification, resourceResolution);
    const selectedProject = resourceResolution?.resources.find(
      (resource) => resource.value === resourceResolution.selectedResourceValue
    );

    return {
      ...metadata,
      projectId: resourceResolution?.selectedResourceValue ?? verification.externalProjectId ?? input.externalProjectId ?? null,
      teamId: resourceResolution?.selectedTeamId ?? verification.externalTeamId ?? input.externalTeamId ?? null,
      dashboardUrl: selectedProject?.url ?? verification.dashboardUrl ?? input.dashboardUrl,
      metadataSnapshot: {
        ...metadata.metadataSnapshot,
        resolvedProjectLabel: selectedProject?.label ?? null,
        resolutionExplanation: resourceResolution?.explanation ?? null
      }
    };
  }

  async runHealthCheck(
    _context: WalletProviderContext,
    input: ProviderConnectionInput,
    metadata: NormalizedProviderMetadata
  ): Promise<ProviderHealthCheckResult> {
    if (!input.apiToken || !metadata.projectId) {
      return {
        state: "ATTENTION_NEEDED",
        summary: "RAEYL can verify the Supabase account, but it still needs the exact project to keep the wallet precise.",
        syncState: "PENDING",
        warnings: ["Project selection missing"],
        nextStep: "Reconnect and confirm the correct Supabase project.",
        checkedAt: new Date().toISOString()
      };
    }

    try {
      const projects = await fetchJson<
        Array<{ id: string; ref?: string; name?: string; region?: string; status?: string }>
      >("https://api.supabase.com/v1/projects", input.apiToken);
      const project = projects.find((item) => item.ref === metadata.projectId || item.id === metadata.projectId);

      if (!project) {
        return {
          state: "ATTENTION_NEEDED",
          summary: "The saved Supabase project was not found in the verified account.",
          syncState: "FAILED",
          warnings: ["Saved project was not found during refresh"],
          nextStep: "Reconnect and choose the correct project.",
          checkedAt: new Date().toISOString()
        };
      }

      return {
        state: "HEALTHY",
        summary: `Supabase project ${project.name ?? project.ref ?? project.id} is still reachable.`,
        syncState: "SYNCED",
        warnings: [],
        checkedAt: new Date().toISOString(),
        metadata: {
          region: project.region ?? null,
          projectStatus: project.status ?? null
        }
      };
    } catch (error) {
      return {
        state: "ISSUE_DETECTED",
        summary: error instanceof Error ? error.message : "Supabase health check failed.",
        syncState: "FAILED",
        warnings: [error instanceof Error ? error.message : "Unknown error"],
        nextStep: "Reconnect the token or verify the linked organization and project.",
        checkedAt: new Date().toISOString()
      };
    }
  }
}
