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
import { getVercelProjectHealth, getVercelConnectionSnapshot, mapVercelStateToHealth } from "@/lib/services/vercel-service";

export class VercelProviderAdapter extends BaseProviderAdapter {
  constructor() {
    super({
      key: "vercel",
      slug: "vercel",
      displayName: "Vercel",
      category: "HOSTING",
      ownerLabel: "Website hosting",
      authStrategy: {
        type: "api_token",
        connectionMethod: ProviderConnectionMethod.API_TOKEN,
        title: "Vercel guided connection",
        description: "Paste a token once and let RAEYL verify the account, find projects, and lock onto the right one.",
        fields: [
          {
            key: "apiToken",
            label: "Vercel API token",
            type: "password",
            placeholder: "Paste Vercel API token",
            required: true,
            hint: "Stored encrypted after save. Used for verification, discovery, and health checks."
          }
        ],
        securityNote: "RAEYL stores the token encrypted and only uses it for verified hosting checks.",
        supportsReconnect: true,
        tokenStorageExpectation: "Encrypted API key with optional future token rotation."
      },
      capabilities: [
        "oauth",
        "apiToken",
        "dashboardUrl",
        "resourceDiscovery",
        "healthChecks",
        "reconnect",
        "manualFallback"
      ],
      ownerSummary: {
        plainLanguagePurpose: "This provider hosts your live website and handles deployments.",
        importedSummary: "RAEYL imported the Vercel account, workspace, project, and deployment signals it could verify.",
        whyItMatters: "It is the fastest place to confirm the site is live and where new code changes are being published.",
        actionGuidance: "Open Vercel when you need deployment visibility or a developer is checking live hosting issues.",
        healthyMeans: "The selected project is reachable and recent deployment signals look normal.",
        warningMeans: "The project may not be selected yet, the token may need reconnecting, or the last deployment needs attention."
      }
    });
  }

  getOAuthConfig() {
    return {
      authorizationUrl: "https://vercel.com/oauth/authorize",
      tokenUrl: "https://api.vercel.com/login/oauth/token",
      scopes: ["openid", "email", "profile", "offline_access"],
      clientIdEnvKey: "VERCEL_OAUTH_CLIENT_ID",
      clientSecretEnvKey: "VERCEL_OAUTH_CLIENT_SECRET",
      includeNonce: true
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
        failureSummary: "Add a Vercel token so RAEYL can verify the account and project."
      };
    }

    const snapshot = await getVercelConnectionSnapshot({
      apiToken: input.apiToken,
      externalProjectId: input.externalProjectId,
      externalTeamId: input.externalTeamId
    });

    const selectedProject = snapshot.selectedProject ?? undefined;
    const selectedTeam = snapshot.selectedTeam ?? undefined;
    const visibleProjects = selectedTeam
      ? snapshot.projects.filter((project) => project.accountId === selectedTeam.id)
      : snapshot.projects;

    return {
      verified: true,
      accountLabel: snapshot.accountLabel,
      connectedAccountLabel: selectedProject?.name
        ? `${snapshot.accountLabel} • ${selectedProject.name}`
        : snapshot.accountLabel,
      dashboardUrl: snapshot.dashboardUrl,
      billingUrl: snapshot.billingUrl,
      externalProjectId: selectedProject?.id,
      externalTeamId: selectedTeam?.id,
      tokenMetadata: {
        verifiedProvider: "vercel",
        teamCount: snapshot.teams.length,
        projectCount: visibleProjects.length
      },
      providerMetadata: {
        accountLabel: snapshot.accountLabel,
        selectedProjectName: selectedProject?.name ?? "not selected",
        selectedTeamSlug: selectedTeam?.slug ?? "personal",
        projectCount: visibleProjects.length,
        userEmail: snapshot.user.email
      },
      connectionState: selectedProject ? "CONNECTED" : visibleProjects.length > 1 ? "AWAITING_SELECTION" : "CONNECTED",
      syncState: "SYNCED",
      healthState: selectedProject || visibleProjects.length <= 1 ? "HEALTHY" : "ATTENTION_NEEDED",
      confidenceScore: selectedProject ? 96 : visibleProjects.length === 1 ? 88 : 58,
      diagnostics: {
        teamCount: snapshot.teams.length,
        projectCount: visibleProjects.length
      }
    };
  }

  async discoverResources(context: WalletProviderContext, input: ProviderConnectionInput) {
    if (!input.apiToken) {
      throw new Error("A Vercel API token is required to discover projects.");
    }

    const snapshot = await getVercelConnectionSnapshot({
      apiToken: input.apiToken,
      externalProjectId: input.externalProjectId,
      externalTeamId: input.externalTeamId
    });

    const teams = snapshot.teams.map((team) => ({
      id: team.id,
      type: "team" as const,
      label: team.name ?? team.slug ?? team.id,
      value: team.id,
      metadata: {
        slug: team.slug ?? null
      }
    }));

    const resources = snapshot.projects.map((project) => ({
      id: project.id,
      type: "project" as const,
      label: project.name ?? project.id,
      value: project.id,
      parentId: project.accountId ?? null,
      url:
        snapshot.selectedTeam?.slug && project.name
          ? `https://vercel.com/${snapshot.selectedTeam.slug}/${project.name}`
          : undefined,
      metadata: {
        framework: project.framework ?? null
      }
    }));

    return resolveResourceSelection({
      teams,
      resources,
      selectedTeamId: input.externalTeamId ?? snapshot.selectedTeam?.id ?? undefined,
      selectedResourceValue: input.externalProjectId ?? snapshot.selectedProject?.id ?? undefined,
      context,
      resourceLabel: "Project",
      teamLabel: "Team or workspace"
    });
  }

  async normalizeConnectionMetadata(
    context: WalletProviderContext,
    input: ProviderConnectionInput,
    verification: ProviderVerificationResult,
    resourceResolution?: Awaited<ReturnType<VercelProviderAdapter["discoverResources"]>>
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
      domainData: context.primaryDomain ? [context.primaryDomain] : [],
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
        summary: "RAEYL can verify the Vercel account, but it still needs the exact project to run live hosting checks.",
        syncState: "PENDING",
        warnings: ["Project selection missing"],
        nextStep: "Reconnect and confirm the correct Vercel project.",
        checkedAt: new Date().toISOString()
      };
    }

    const health = await getVercelProjectHealth(input.apiToken, metadata.projectId, metadata.teamId);
    const state = health.error ? "ISSUE_DETECTED" : mapVercelStateToHealth(health.deploymentState);

    return {
      state,
      summary: health.error
        ? `RAEYL could not refresh the live Vercel health signal: ${health.error}`
        : `Latest deployment is ${health.deploymentState ?? "unknown"} for ${health.projectName ?? metadata.projectId}.`,
      syncState: health.error ? "FAILED" : "SYNCED",
      warnings: health.error ? [health.error] : health.domains.length ? [] : ["No domains were returned for the selected project."],
      nextStep: health.error ? "Reconnect the token or confirm the selected project." : undefined,
      checkedAt: new Date().toISOString(),
      metadata: {
        deploymentUrl: health.deploymentUrl,
        domains: health.domains,
        lastDeployedAt: health.lastDeployedAt
      }
    };
  }
}
