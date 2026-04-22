import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/access";
import { getWalletAlertsData } from "@/lib/data/wallets";
import { formatDate } from "@/lib/utils";

export default async function AlertsPage({
  params
}: {
  params: Promise<{ walletId: string }>;
}) {
  const { walletId } = await params;
  const session = await requireSession();
  const { walletContext, alerts } = await getWalletAlertsData(walletId, session.user.id);

  return (
    <AppShell
      title="Attention and updates"
      description="Anything that needs a review appears here with the right next step."
      walletContext={walletContext}
    >
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Review what needs attention, why it matters, and the clearest next action.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.length ? (
            alerts.map((alert) => (
              <div key={alert.id} className="rounded-md border border-white/10 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="font-medium">{alert.title}</div>
                  <Badge
                    variant={
                      alert.severity === "critical"
                        ? "danger"
                        : alert.severity === "warning"
                          ? "warning"
                          : "accent"
                    }
                  >
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted">{alert.message}</p>
                <div className="mt-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-muted">
                  {alert.recommendation}
                </div>
                {alert.providerId ? (
                  <div className="mt-3">
                    <Button asChild size="sm" variant="secondary">
                      <a href={`/app/wallets/${walletId}/providers/${alert.providerId}`}>Review this tool</a>
                    </Button>
                  </div>
                ) : null}
                <p className="mt-2 text-xs text-muted">Created {formatDate(alert.createdAt)}</p>
              </div>
            ))
          ) : (
            <EmptyState
              title="No active alerts"
              description="Open issues and reminders will appear here when something needs a review."
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
