"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type DiscoverResponse = {
  accountLabel: string;
  billingUrl: string;
  organizations: Array<{
    id: string;
    slug: string | null;
    label: string;
  }>;
  projects: Array<{
    id: string;
    ref: string;
    name: string;
    organizationId: string | null;
    region: string | null;
  }>;
  selectedOrganizationId: string | null;
};

export function SupabaseConnectionFields({
  walletId,
  initialBillingUrl
}: {
  walletId: string;
  initialBillingUrl?: string;
}) {
  const [apiToken, setApiToken] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [discovery, setDiscovery] = useState<DiscoverResponse | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [selectedProjectRef, setSelectedProjectRef] = useState("");

  const visibleProjects = useMemo(() => {
    if (!discovery) {
      return [];
    }

    if (!selectedOrganizationId) {
      return discovery.projects;
    }

    const filtered = discovery.projects.filter((project) => project.organizationId === selectedOrganizationId);
    return filtered.length ? filtered : discovery.projects;
  }, [discovery, selectedOrganizationId]);

  async function runDiscovery() {
    setDiscovering(true);
    setDiscoverError(null);

    try {
      const response = await fetch("/api/provider-connect/supabase/discover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          walletId,
          apiToken,
          externalTeamId: selectedOrganizationId || undefined
        })
      });

      const payload = (await response.json()) as DiscoverResponse & { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "RAEYL could not verify that Supabase token.");
      }

      setDiscovery(payload);
      const nextOrganizationId = payload.selectedOrganizationId ?? "";
      setSelectedOrganizationId(nextOrganizationId);
      const matchingProjects = nextOrganizationId
        ? payload.projects.filter((project) => project.organizationId === nextOrganizationId)
        : payload.projects;
      setSelectedProjectRef(
        matchingProjects.length === 1
          ? matchingProjects[0].ref
          : payload.projects.length === 1
            ? payload.projects[0].ref
            : ""
      );
    } catch (error) {
      setDiscovery(null);
      setSelectedProjectRef("");
      setDiscoverError(error instanceof Error ? error.message : "RAEYL could not verify that Supabase token.");
    } finally {
      setDiscovering(false);
    }
  }

  return (
    <div className="md:col-span-2 space-y-4 rounded-md border border-primary/20 bg-primary/5 p-4">
      <div>
        <div className="text-sm font-medium text-foreground">Supabase guided connection</div>
        <p className="mt-1 text-sm text-muted">
          Paste a Supabase personal access token once, let RAEYL find the organizations and projects, then pick the
          right project ref.
        </p>
      </div>

      <FormField
        label="Supabase personal access token"
        hint="Stored encrypted after save. RAEYL uses it to verify the account and connect the right project."
      >
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            name="apiToken"
            type="password"
            value={apiToken}
            onChange={(event) => setApiToken(event.target.value)}
            placeholder="Paste Supabase access token"
            className="md:flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            disabled={!apiToken.trim() || discovering}
            onClick={runDiscovery}
            className="md:min-w-[220px]"
          >
            {discovering ? "Checking Supabase..." : "Verify and find projects"}
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
            <FormField label="Organization">
              <Select
                name="externalTeamId"
                value={selectedOrganizationId}
                onChange={(event) => {
                  const nextOrganizationId = event.target.value;
                  setSelectedOrganizationId(nextOrganizationId);
                  const filtered = discovery.projects.filter((project) => project.organizationId === nextOrganizationId);
                  setSelectedProjectRef(filtered.length === 1 ? filtered[0].ref : "");
                }}
              >
                <option value="">Any organization or personal workspace</option>
                {discovery.organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Project">
              <Select
                name="externalProjectId"
                value={selectedProjectRef}
                onChange={(event) => setSelectedProjectRef(event.target.value)}
              >
                <option value="">Choose a project</option>
                {visibleProjects.map((project) => (
                  <option key={project.id} value={project.ref}>
                    {project.name}
                    {project.region ? ` • ${project.region}` : ""}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <input type="hidden" name="connectedAccountLabel" value={discovery.accountLabel} />
          <input type="hidden" name="billingUrl" value={discovery.billingUrl || initialBillingUrl || ""} />

          <p className="text-xs text-muted">
            Save after choosing the right project. If the token sees more than one project and none is selected,
            RAEYL will keep the connection but flag it for review.
          </p>
        </div>
      ) : (
        <input type="hidden" name="billingUrl" value={initialBillingUrl || ""} />
      )}
    </div>
  );
}
