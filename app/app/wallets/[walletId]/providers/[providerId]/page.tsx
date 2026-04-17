import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/access";
import { hasCapability } from "@/lib/auth/permissions";
import { deleteProviderConnection } from "@/lib/actions/wallets";
import { getWalletProviderDetailData } from "@/lib/data/wallets";
import { detectCMSProvider } from "@/lib/services/cms-service";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ProviderDetailPage({
  params
}: {
  params: Promise<{ walletId: string; providerId: string }>;
}) {
  const { walletId, providerId } = await params;
  const session = await requireSession();
  const { walletContext, provider, recentBilling } = await getWalletProviderDetailData(
    walletId,
    providerId,
    session.user.id
  );

  const isCMS = provider.category === "cms" || !!detectCMSProvider(provider.name);
  const canManage = walletContext.role
    ? hasCapability(walletContext.role, "provider.write")
    : false;

  return (
    <AppShell
      title={provider.label}
      description={`${provider.ownerDescription} Powered by ${provider.name}.`}
      walletContext={walletContext}
    >
      {/* Back nav */}
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
              {isCMS && (
                <Button asChild variant="secondary">
                  <Link href={`/app/wallets/${walletId}/providers/${providerId}/cms-setup`}>
                    Set up editing
                  </Link>
                </Button>
              )}
              {provider.supportUrl ? (
                <Button asChild variant="ghost">
                  <a href={provider.supportUrl} target="_blank" rel="noopener noreferrer">
                    Support docs
                  </a>
                </Button>
              ) : null}
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
                <span className="text-foreground">Estimated cost:</span>{" "}
                {formatCurrency(provider.monthlyCost)}
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
                          {formatCurrency(record.amount)} • {record.status}
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

          {/* Danger zone — remove tool */}
          {canManage && (
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive/80">Remove this tool</CardTitle>
                <CardDescription>
                  Permanently removes this provider from the wallet. The external service is not affected.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={deleteProviderConnection}>
                  <input type="hidden" name="walletId" value={walletId} />
                  <input type="hidden" name="providerId" value={providerId} />
                  <Button
                    type="submit"
                    variant="danger"
                    className="gap-2"
                    onClick={(e) => {
                      if (!confirm(`Remove "${provider.label}" from this wallet?`)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove tool
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
