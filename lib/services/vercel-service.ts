/**
 * Vercel integration service.
 * Centralizes account discovery, project lookup, and live health checks.
 */

export type VercelTeam = {
  id: string;
  slug?: string;
  name?: string;
};

export type VercelProject = {
  id: string;
  name?: string;
  accountId?: string;
  framework?: string | null;
  latestDeployments?: Array<{
    id: string;
    url: string;
    readyState: string;
    createdAt: number;
    readyAt: number | null;
  }>;
};

export type VercelConnectionSnapshot = {
  accountLabel: string;
  user: {
    id: string | null;
    username: string | null;
    email: string | null;
    name: string | null;
  };
  teams: VercelTeam[];
  projects: VercelProject[];
  selectedTeam: VercelTeam | null;
  selectedProject: VercelProject | null;
  dashboardUrl: string;
  billingUrl: string;
};

export type VercelHealthResult = {
  ok: boolean;
  projectId: string | null;
  projectName: string | null;
  deploymentState: string | null;
  deploymentUrl: string | null;
  lastDeployedAt: string | null;
  domains: string[];
  error: string | null;
};

function buildTeamQuery(teamId?: string | null) {
  if (!teamId) {
    return "";
  }

  return `?teamId=${encodeURIComponent(teamId)}`;
}

async function vercelFetch<T>(path: string, token: string, options?: { revalidate?: number }): Promise<T> {
  const res = await fetch(`https://api.vercel.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    ...(options?.revalidate !== undefined ? { next: { revalidate: options.revalidate } } : { cache: "no-store" })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vercel API error ${res.status}: ${text || "Unknown error"}`);
  }

  return res.json() as Promise<T>;
}

function matchTeam(teams: VercelTeam[], externalTeamId?: string) {
  if (!externalTeamId) {
    return teams.length === 1 ? teams[0] : null;
  }

  return (
    teams.find(
      (team) =>
        team.id === externalTeamId || team.slug === externalTeamId || team.name === externalTeamId
    ) ?? null
  );
}

function matchProject(projects: VercelProject[], externalProjectId?: string) {
  if (!externalProjectId) {
    return projects.length === 1 ? projects[0] : null;
  }

  return (
    projects.find(
      (project) => project.id === externalProjectId || project.name === externalProjectId
    ) ?? null
  );
}

export async function getVercelConnectionSnapshot(input: {
  apiToken: string;
  externalProjectId?: string;
  externalTeamId?: string;
}): Promise<VercelConnectionSnapshot> {
  const [userResult, teamsResult, projectsResult] = await Promise.all([
    vercelFetch<{ user?: { id?: string; username?: string; email?: string; name?: string } }>(
      "/v2/user",
      input.apiToken
    ),
    vercelFetch<{ teams?: VercelTeam[] }>("/v2/teams", input.apiToken).catch(() => ({ teams: [] })),
    vercelFetch<{ projects?: VercelProject[] }>("/v10/projects", input.apiToken).catch(() => ({ projects: [] }))
  ]);

  const teams = teamsResult.teams ?? [];
  const projects = projectsResult.projects ?? [];
  const selectedTeam = matchTeam(teams, input.externalTeamId);
  const selectedProject = matchProject(
    selectedTeam ? projects.filter((project) => project.accountId === selectedTeam.id) : projects,
    input.externalProjectId
  );

  const accountLabel =
    userResult.user?.name ??
    userResult.user?.username ??
    userResult.user?.email ??
    "Verified Vercel account";

  return {
    accountLabel,
    user: {
      id: userResult.user?.id ?? null,
      username: userResult.user?.username ?? null,
      email: userResult.user?.email ?? null,
      name: userResult.user?.name ?? null
    },
    teams,
    projects,
    selectedTeam,
    selectedProject,
    dashboardUrl:
      selectedProject && selectedTeam?.slug
        ? `https://vercel.com/${selectedTeam.slug}/${selectedProject.name ?? selectedProject.id}`
        : "https://vercel.com/dashboard",
    billingUrl: "https://vercel.com/account/billing"
  };
}

export async function getVercelProjectHealth(
  apiToken: string,
  projectIdOrName: string,
  teamId?: string | null
): Promise<VercelHealthResult> {
  try {
    const query = buildTeamQuery(teamId);
    const project = await vercelFetch<{
      id: string;
      name: string;
      framework: string | null;
      latestDeployments?: Array<{
        id: string;
        url: string;
        readyState: string;
        createdAt: number;
        readyAt: number | null;
      }>;
    }>(`/v9/projects/${encodeURIComponent(projectIdOrName)}${query}`, apiToken, { revalidate: 60 });

    const domains = await vercelFetch<{ domains: Array<{ name: string }> }>(
      `/v9/projects/${encodeURIComponent(project.id)}/domains${query}`,
      apiToken,
      { revalidate: 60 }
    )
      .then((result) => result.domains.map((domain) => domain.name))
      .catch(() => []);

    const latestDeployment = project.latestDeployments?.[0] ?? null;

    return {
      ok: latestDeployment?.readyState === "READY",
      projectId: project.id,
      projectName: project.name,
      deploymentState: latestDeployment?.readyState ?? null,
      deploymentUrl: latestDeployment ? `https://${latestDeployment.url}` : null,
      lastDeployedAt: latestDeployment ? new Date(latestDeployment.createdAt).toISOString() : null,
      domains,
      error: null
    };
  } catch (err) {
    return {
      ok: false,
      projectId: null,
      projectName: null,
      deploymentState: null,
      deploymentUrl: null,
      lastDeployedAt: null,
      domains: [],
      error: err instanceof Error ? err.message : "Unknown error"
    };
  }
}

export function mapVercelStateToHealth(
  state: string | null
): "HEALTHY" | "ATTENTION_NEEDED" | "ISSUE_DETECTED" | "UNKNOWN" {
  if (!state) return "UNKNOWN";
  if (state === "READY") return "HEALTHY";
  if (state === "ERROR" || state === "CANCELED") return "ISSUE_DETECTED";
  if (state === "BUILDING" || state === "QUEUED") return "ATTENTION_NEEDED";
  return "UNKNOWN";
}
