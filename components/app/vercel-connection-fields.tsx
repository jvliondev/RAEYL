"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type DiscoverResponse = {
  accountLabel: string;
  dashboardUrl: string;
  billingUrl: string;
  teams: Array<{
    id: string;
    label: string;
    slug: string | null;
  }>;
  projects: Array<{
    id: string;
    name: string;
    accountId: string | null;
  }>;
  selectedTeamId: string | null;
  selectedProjectId: string | null;
};

export function VercelConnectionFields({
  walletId,
  initialDashboardUrl,
  initialBillingUrl
}: {
  walletId: string;
  initialDashboardUrl?: string;
  initialBillingUrl?: string;
}) {
  const [apiToken, setApiToken] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [discovery, setDiscovery] = useState<DiscoverResponse | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const visibleProjects = useMemo(() => {
    if (!discovery) {
      return [];
    }

    if (!selectedTeamId) {
      return discovery.projects;
    }

    const filtered = discovery.projects.filter((project) => project.accountId === selectedTeamId);
    return filtered.length ? filtered : discovery.projects;
  }, [discovery, selectedTeamId]);

  async function runDiscovery() {
    setDiscovering(true);
    setDiscoverError(null);

    try {
      const response = await fetch("/api/provider-connect/vercel/discover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          walletId,
          apiToken,
          externalTeamId: selectedTeamId || undefined
        })
      });

      const payload = (await response.json()) as DiscoverResponse & { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "RAEYL could not verify that Vercel token.");
      }

      setDiscovery(payload);
      const nextTeamId = payload.selectedTeamId ?? "";
      setSelectedTeamId(nextTeamId);

      const matchingProjects = nextTeamId
        ? payload.projects.filter((project) => project.accountId === nextTeamId)
        : payload.projects;

      setSelectedProjectId(
        payload.selectedProjectId ??
          (matchingProjects.length === 1 ? matchingProjects[0].id : payload.projects.length === 1 ? payload.projects[0].id : "")
      );
    } catch (error) {
      setDiscovery(null);
      setSelectedProjectId("");
      setDiscoverError(error instanceof Error ? error.message : "RAEYL could not verify that Vercel token.");
    } finally {
      setDiscovering(false);
    }
  }

  return (
    <div className="md:col-span-2 space-y-4 rounded-md border border-primary/20 bg-primary/5 p-4">
      <div>
        <div className="text-sm font-medium text-foreground">Vercel guided connection</div>
        <p className="mt-1 text-sm text-muted">
          Paste a Vercel token once, let RAEYL verify the account, then choose the right team and project.
        </p>
      </div>

      <FormField
        label="Vercel API token"
        hint="Stored encrypted after save. RAEYL uses it to verify the account, discover projects, and run health checks."
      >
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            name="apiToken"
            type="password"
            value={apiToken}
            onChange={(event) => setApiToken(event.target.value)}
            placeholder="Paste Vercel API token"
            className="md:flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            disabled={!apiToken.trim() || discovering}
            onClick={runDiscovery}
            className="md:min-w-[220px]"
          >
            {discovering ? "Checking Vercel..." : "Verify and find projects"}
          </Button>
        </div>
      </FormField>

      {discoverError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {discoverError}
        </div>
      ) : null}

      {discovery ? (
        <div className="space-y-4">
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm">
            <div className="font-medium text-foreground">Verified account</div>
            <div className="mt-1 text-muted">{discovery.accountLabel}</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Team or workspace">
              <Select
                name="externalTeamId"
                value={selectedTeamId}
                onChange={(event) => {
                  const nextTeamId = event.target.value;
                  setSelectedTeamId(nextTeamId);
                  const filtered = discovery.projects.filter((project) => project.accountId === nextTeamId);
                  setSelectedProjectId(filtered.length === 1 ? filtered[0].id : "");
                }}
              >
                <option value="">Personal account or let RAEYL decide</option>
                {discovery.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Project">
              <Select
                name="externalProjectId"
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
              >
                <option value="">Choose a project</option>
                {visibleProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <input type="hidden" name="connectedAccountLabel" value={discovery.accountLabel} />
          <input type="hidden" name="dashboardUrl" value={discovery.dashboardUrl || initialDashboardUrl || ""} />
          <input type="hidden" name="billingUrl" value={discovery.billingUrl || initialBillingUrl || ""} />

          <p className="text-xs text-muted">
            Save after choosing the right project. If the token sees more than one project and none is selected,
            RAEYL will keep the connection but flag it for review.
          </p>
        </div>
      ) : (
        <>
          <input type="hidden" name="dashboardUrl" value={initialDashboardUrl || ""} />
          <input type="hidden" name="billingUrl" value={initialBillingUrl || ""} />
        </>
      )}
    </div>
  );
}
