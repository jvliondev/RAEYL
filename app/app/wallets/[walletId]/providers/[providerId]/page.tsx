import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { refreshProviderHealth } from "@/lib/actions/wallets";
import { requireSession } from "@/lib/auth/access";
import { hasCapability } from "@/lib/auth/permissions";
import { getWalletProviderDetailData } from "@/lib/data/wallets";
import { detectCMSProvider } from "@/lib/services/cms-service";
import { getProviderFrameworkProfile } from "@/lib/services/provider-framework";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AppShell } from "@/components/app/app-shell";
import { DeleteProviderButton } from "@/components/app/delete-provider-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProviderDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ walletId: string; providerId: string }>;
  searchParams: Promise<{ health?: string }>;
}) {
  const { walletId, providerId } = await params;
  const { health } = await searchParams;
  const session = await requireSession();
  const { walletContext, provider, recentBilling } = await getWalletProviderDetailData(
    walletId,
    providerId,
    session.user.id
  );

  const isCMS = provider.category === "cms" || !!detectCMSProvider(provider.name);
  const canManage = walletContext.role ? hasCapability(walletContext.role, "provider.write") : false;
  const framework = getProviderFrameworkProfile({
    slug: provider.templateSlug ?? undefined,
    providerName: provider.name
  });
  const needsProjectSelection =
    provider.templateSlug === "vercel" && provider.metadata.selectedProjectName === "not selected";

  return (
    <AppShell
      title={provider.label}
      description={`${provider.ownerDescription} Powered by ${provider.name}.`}
      walletContext={walletContext}
    >
      <div className="mb-6">
        <Link
          href={`/app/wallets/${walletId}/providers`}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to connected tools
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {health === "checked" ? (
            <div className="rounded-md border border-success/30 bg-success/5 p-4 text-sm text-success">
              Live health check completed. RAEYL refreshed this tool with the latest data it could verify.
            </div>
          ) : null}
          {needsProjectSelection ? (
            <div className="rounded-md border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
              This Vercel account is verified, but the wallet is not locked to one project yet. Reconnect it with the
              right project so health checks and links stay precise.
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <div>
                <CardTitle>{provider.label}</CardTitle>
                <CardDescription>Powered by {provider.name}</CardDescription>
              </div>
              <Badge
                variant={
                  provider.health === "healthy"
                    ? "success"
                    : provider.health === "attention"
                      ? "warning"
                      : "danger"
                }
              >
                {provider.status}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {provider.dashboardUrl ? (
                <Button asChild>
                  <a href={provider.dashboardUrl} target="_blank" rel="noopener noreferrer">
                    Open tool dashboard
                  </a>
                </Button>
              ) : (
                <Button disabled>Open tool dashboard</Button>
              )}
              {provider.billingUrl ? (
                <Button asChild variant="secondary">
                  <a href={provider.billingUrl} target="_blank" rel="noopener noreferrer">
                    Review billing
                  </a>
                </Button>
              ) : null}
              {provider.editUrl ? (
                <Button asChild variant="secondary">
                  <a href={provider.editUrl} target="_blank" rel="noopener noreferrer">
                    Open editor
                  </a>
                </Button>
              ) : null}
              {isCMS ? (
                <Button asChild variant="secondary">
                  <Link href={`/app/wallets/${walletId}/providers/${providerId}/cms-setup`}>Set up editing</Link>
                </Button>
              ) : null}
              {provider.supportUrl ? (
                <Button asChild variant="ghost">
                  <a href={provider.supportUrl} target="_blank" rel="noopener noreferrer">
                    Support docs
                  </a>
                </Button>
              ) : null}
              {canManage ? (
                <Button asChild variant="ghost">
                  <Link
                    href={`/app/wallets/${walletId}/providers/new?template=${provider.templateSlug ?? "custom"}${provider.websiteId ? `&websiteId=${provider.websiteId}` : ""}`}
                  >
                    Reconnect this tool
                  </Link>
                </Button>
              ) : null}
              <form action={refreshProviderHealth}>
                <input type="hidden" name="walletId" value={walletId} />
                <input type="hidden" name="providerId" value={providerId} />
                <Button type="submit" variant="secondary">
                  Run live check
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>What this system does</CardTitle>
                <CardDescription>Plain-language purpose of this tool.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted">
              <p>{provider.ownerDescription}</p>
              <p>Connected account: {provider.accountLabel}</p>
              <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                <div className="font-medium text-foreground">Why this record matters</div>
                <p className="mt-2">{framework.ownerTrustNote}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Connection state</CardTitle>
                <CardDescription>How this tool was connected and what RAEYL can verify today.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted">
              <div>
                <span className="text-foreground">Method:</span> {provider.connectionMethod ?? "Not recorded"}
              </div>
              <div>
                <span className="text-foreground">Sync state:</span> {provider.syncState ?? "Unknown"}
              </div>
              <div>
                <span className="text-foreground">Last health check:</span>{" "}
                {provider.lastHealthCheckAt ? formatDate(provider.lastHealthCheckAt) : "Not checked yet"}
              </div>
              <div>
                <span className="text-foreground">Last sync:</span>{" "}
                {provider.lastSyncAt ? formatDate(provider.lastSyncAt) : "No sync recorded yet"}
              </div>
              <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                <div className="font-medium text-foreground">Connection intelligence</div>
                <p className="mt-2">{framework.autoImportLabel}</p>
                <p className="mt-2">{framework.reconnectAdvice}</p>
              </div>
              {provider.credentials?.length ? (
                <div className="pt-2">
                  <div className="mb-2 font-medium text-foreground">Stored credentials</div>
                  <div className="space-y-2">
                    {provider.credentials.map((credential) => (
                      <div key={credential.id} className="rounded-md border border-white/10 px-3 py-2">
                        <div>{credential.type}</div>
                        <div className="text-xs text-muted">
                          {credential.maskedPreview} · {credential.status}
                          {credential.expiresAt ? ` · Expires ${formatDate(credential.expiresAt)}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>No encrypted credentials are stored for this tool yet.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing and renewal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted">
              <div>
                <span className="text-foreground">Estimated cost:</span> {formatCurrency(provider.monthlyCost)}
              </div>
              <div>
                <span className="text-foreground">Renewal date:</span>{" "}
                {provider.renewalDate ? formatDate(provider.renewalDate) : "Not set"}
              </div>
              {recentBilling.length ? (
                <div className="pt-2">
                  <div className="mb-2 text-sm font-medium text-foreground">Recent billing records</div>
                  <div className="space-y-2">
                    {recentBilling.map((record) => (
                      <div key={record.id} className="rounded-md border border-white/10 px-3 py-2">
                        <div>{record.label}</div>
                        <div className="text-xs text-muted">
                          {formatCurrency(record.amount)} · {record.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Framework support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>Best method: {framework.bestConnectionMethod.replace("_", " ")}</div>
                <div>OAuth: {framework.oauthStatus}</div>
                <div>Live verification: {framework.supportsLiveVerification ? "Available" : "Limited"}</div>
                <div>Health checks: {framework.supportsHealthChecks ? "Available" : "Planned"}</div>
                <div>Billing sync: {framework.supportsBillingSync ? "Available" : "Planned"}</div>
                <div>Edit routing: {framework.supportsEditRouting ? "Supported" : "Optional"}</div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                <div className="font-medium text-foreground">Fields to prioritize</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {framework.fieldsToPrioritize.map((field) => (
                    <span key={field} className="rounded-md border border-white/10 px-2 py-1 text-xs">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technical metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted">
              {Object.keys(provider.metadata).length ? (
                Object.entries(provider.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <span>{key}</span>
                    <span className="text-foreground">{String(value)}</span>
                  </div>
                ))
              ) : (
                <div>No technical metadata recorded yet.</div>
              )}
            </CardContent>
          </Card>

          {canManage ? (
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive/80">Remove this tool</CardTitle>
                <CardDescription>
                  Permanently removes this provider from the wallet. The external service is not affected.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeleteProviderButton walletId={walletId} providerId={providerId} label={provider.label} />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
