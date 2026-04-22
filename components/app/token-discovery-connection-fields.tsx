"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ProviderMagicConnectProfile } from "@/lib/services/provider-connect-broker";

type DiscoveryResponse = {
  accountLabel: string;
  dashboardUrl?: string;
  billingUrl?: string;
  confidenceScore?: number;
  autoSelected?: boolean;
  clarificationNeeded?: boolean;
  explanation?: string;
  resourceLabel?: string;
  teamLabel?: string;
  teams: Array<{
    id: string;
    label: string;
    slug?: string | null;
  }>;
  resources: Array<{
    id: string;
    value: string;
    label: string;
    groupId?: string | null;
    subtitle?: string | null;
  }>;
  selectedTeamId?: string | null;
  selectedResourceValue?: string | null;
};

export function TokenDiscoveryConnectionFields({
  walletId,
  profile,
  initialDashboardUrl,
  initialBillingUrl
}: {
  walletId: string;
  profile: ProviderMagicConnectProfile;
  initialDashboardUrl?: string;
  initialBillingUrl?: string;
}) {
  const [apiToken, setApiToken] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [discovery, setDiscovery] = useState<DiscoveryResponse | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedResourceValue, setSelectedResourceValue] = useState("");

  const visibleResources = useMemo(() => {
    if (!discovery) {
      return [];
    }

    if (!selectedTeamId) {
      return discovery.resources;
    }

    const filtered = discovery.resources.filter((resource) => resource.groupId === selectedTeamId);
    return filtered.length ? filtered : discovery.resources;
  }, [discovery, selectedTeamId]);

  async function runDiscovery() {
    setDiscovering(true);
    setDiscoverError(null);

    try {
      const response = await fetch("/api/provider-connect/discover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          walletId,
          providerSlug: profile.providerSlug,
          apiToken,
          externalTeamId: selectedTeamId || undefined
        })
      });

      const payload = (await response.json()) as DiscoveryResponse & { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "RAEYL could not verify this provider token.");
      }

      setDiscovery(payload);
      const nextTeamId = payload.selectedTeamId ?? "";
      setSelectedTeamId(nextTeamId);

      const matchingResources = nextTeamId
        ? payload.resources.filter((resource) => resource.groupId === nextTeamId)
        : payload.resources;

      setSelectedResourceValue(
        payload.selectedResourceValue ??
          (matchingResources.length === 1
            ? matchingResources[0].value
            : payload.resources.length === 1
              ? payload.resources[0].value
              : "")
      );
    } catch (error) {
      setDiscovery(null);
      setSelectedResourceValue("");
      setDiscoverError(error instanceof Error ? error.message : "RAEYL could not verify this provider token.");
    } finally {
      setDiscovering(false);
    }
  }

  return (
    <div className="md:col-span-2 space-y-4 rounded-md border border-primary/20 bg-primary/5 p-4">
      <div>
        <div className="text-sm font-medium text-foreground">{profile.title}</div>
        <p className="mt-1 text-sm text-muted">{profile.description}</p>
      </div>

      <FormField label={profile.tokenLabel} hint={profile.tokenHint}>
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            name="apiToken"
            type="password"
            value={apiToken}
            onChange={(event) => setApiToken(event.target.value)}
            placeholder={profile.tokenPlaceholder}
            className="md:flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            disabled={!apiToken.trim() || discovering}
            onClick={runDiscovery}
            className="md:min-w-[220px]"
          >
            {discovering ? "Checking..." : "Verify and find resources"}
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
            <div className="mt-2 text-xs text-muted">
              {discovery.explanation ?? "RAEYL verified this account and loaded the available resources."}
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md border border-white/10 px-2 py-1">
                Confidence {discovery.confidenceScore ? `${discovery.confidenceScore}%` : "unscored"}
              </span>
              {discovery.autoSelected ? (
                <span className="rounded-md border border-success/30 bg-success/[0.08] px-2 py-1 text-success">
                  Auto-match ready
                </span>
              ) : null}
              {discovery.clarificationNeeded ? (
                <span className="rounded-md border border-warning/30 bg-warning/[0.08] px-2 py-1 text-warning">
                  One confirmation needed
                </span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={discovery.teamLabel ?? profile.teamLabel}>
              <Select
                name="externalTeamId"
                value={selectedTeamId}
                onChange={(event) => {
                  const nextTeamId = event.target.value;
                  setSelectedTeamId(nextTeamId);
                  const filtered = discovery.resources.filter((resource) => resource.groupId === nextTeamId);
                  setSelectedResourceValue(filtered.length === 1 ? filtered[0].value : "");
                }}
              >
                <option value="">{profile.teamPlaceholder}</option>
                {discovery.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label={discovery.resourceLabel ?? profile.resourceLabel}>
              <Select
                name="externalProjectId"
                value={selectedResourceValue}
                onChange={(event) => setSelectedResourceValue(event.target.value)}
              >
                <option value="">{profile.resourcePlaceholder}</option>
                {visibleResources.map((resource) => (
                  <option key={resource.id} value={resource.value}>
                    {resource.label}
                    {resource.subtitle ? ` • ${resource.subtitle}` : ""}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <input type="hidden" name="connectedAccountLabel" value={discovery.accountLabel} />
          <input type="hidden" name="dashboardUrl" value={discovery.dashboardUrl || initialDashboardUrl || ""} />
          <input type="hidden" name="billingUrl" value={discovery.billingUrl || initialBillingUrl || ""} />

          <p className="text-xs text-muted">
            Save after choosing the right resource. If multiple resources are available and none is selected, RAEYL
            will keep the connection but flag it for review.
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
