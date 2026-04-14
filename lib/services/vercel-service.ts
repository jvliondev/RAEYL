/**
 * Vercel live integration service.
 * Fetches real deployment status, project info, and domain health from the Vercel API.
 */

export type VercelProject = {
  id: string;
  name: string;
  framework: string | null;
  latestDeployment: {
    id: string;
    url: string;
    state: "READY" | "ERROR" | "BUILDING" | "QUEUED" | "CANCELED" | string;
    createdAt: number;
    readyAt: number | null;
  } | null;
  domains: string[];
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

async function vercelFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.vercel.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    next: { revalidate: 60 } // cache for 1 minute
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vercel API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function getVercelProjectHealth(
  apiToken: string,
  projectIdOrName: string
): Promise<VercelHealthResult> {
  try {
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
    }>(`/v9/projects/${encodeURIComponent(projectIdOrName)}`, apiToken);

    const domains = await vercelFetch<{ domains: Array<{ name: string }> }>(
      `/v9/projects/${encodeURIComponent(project.id)}/domains`,
      apiToken
    ).then((r) => r.domains.map((d) => d.name)).catch(() => []);

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
