import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/access";
import { getWalletProviderDetailData } from "@/lib/data/wallets";
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

  return (
    <AppShell
      title={provider.label}
      description={`${provider.ownerDescription} Powered by ${provider.name}.`}
      walletContext={walletContext}
    >
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
              <Button>Open tool dashboard</Button>
              <Button variant="secondary">Review billing</Button>
              <Button variant="secondary">Reconnect access</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>What this system does</CardTitle>
                <CardDescription>Start with the plain-language purpose of the tool, then show deeper detail below.</CardDescription>
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
              <div><span className="text-foreground">Estimated cost:</span> {formatCurrency(provider.monthlyCost)}</div>
              <div><span className="text-foreground">Renewal date:</span> {provider.renewalDate ? formatDate(provider.renewalDate) : "Not set"}</div>
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
                    <span className="text-foreground">{value}</span>
                  </div>
                ))
              ) : (
                <div>No technical metadata has been recorded yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
