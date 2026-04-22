import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminSession } from "@/lib/auth/access";
import { getAdminProviderDiagnosticsData } from "@/lib/data/wallets";
import { formatDate } from "@/lib/utils";

export default async function AdminProvidersPage() {
  await requireAdminSession();
  const providers = await getAdminProviderDiagnosticsData();

  return (
    <AppShell
      title="Provider diagnostics"
      description="Inspect adapter coverage, confidence, connection state, reconnect risk, and live health across wallets."
    >
      <Card>
        <CardHeader>
          <CardTitle>Connected provider diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted">
          {providers.length ? (
            providers.map((provider) => (
              <div key={provider.id} className="rounded-md border border-white/10 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">
                      {provider.displayLabel} · {provider.providerName}
                    </div>
                    <div>
                      <Link
                        href={`/app/wallets/${provider.walletId}/providers/${provider.id}`}
                        className="text-foreground underline-offset-4 hover:underline"
                      >
                        {provider.walletName}
                      </Link>
                      {provider.websiteName ? ` · ${provider.websiteName}` : ""}
                      {provider.primaryDomain ? ` · ${provider.primaryDomain}` : ""}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="neutral">{provider.adapterKey}</Badge>
                      <Badge variant="accent">{provider.connectionState}</Badge>
                      <Badge variant="warning">{provider.healthStatus}</Badge>
                      <Badge variant="neutral">{provider.syncState}</Badge>
                      {provider.confidenceScore ? (
                        <Badge variant="accent">Confidence {provider.confidenceScore}%</Badge>
                      ) : null}
                      {provider.reconnectRequired ? <Badge variant="danger">Reconnect required</Badge> : null}
                    </div>
                  </div>
                  <div className="text-xs text-muted lg:text-right">
                    <div>Updated {formatDate(provider.updatedAt)}</div>
                    <div>{provider.lastVerifiedAt ? `Verified ${formatDate(provider.lastVerifiedAt)}` : "Not yet verified"}</div>
                    <div>
                      {provider.lastHealthCheckAt
                        ? `Health checked ${formatDate(provider.lastHealthCheckAt)}`
                        : "Health not checked yet"}
                    </div>
                  </div>
                </div>

                {provider.failureSummary ? (
                  <div className="mt-3 rounded-md border border-warning/20 bg-warning/[0.06] px-3 py-2 text-warning">
                    {provider.failureSummary}
                  </div>
                ) : null}

                {provider.selectedProject ? (
                  <div className="mt-3 text-xs">
                    Selected resource: <span className="text-foreground">{provider.selectedProject}</span>
                  </div>
                ) : null}

                {Object.keys(provider.diagnostics).length ? (
                  <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {Object.entries(provider.diagnostics).map(([key, value]) => (
                      <div key={key} className="rounded-md border border-white/10 px-3 py-2 text-xs">
                        <div>{key}</div>
                        <div className="mt-1 text-foreground">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <EmptyState
              title="No provider diagnostics yet"
              description="Connected provider telemetry will appear here as wallets begin linking live tools."
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
