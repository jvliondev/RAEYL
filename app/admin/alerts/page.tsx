import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminSession } from "@/lib/auth/access";
import { getAdminAlertsData } from "@/lib/data/wallets";
import { formatDate } from "@/lib/utils";

export default async function AdminAlertsPage() {
  await requireAdminSession();
  const alerts = await getAdminAlertsData();

  return (
    <AppShell
      title="Admin alerts"
      description="Review platform-wide issues across wallets, billing, provider sync, and handoff."
    >
      <Card>
        <CardHeader>
          <CardTitle>Global alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted">
          {alerts.length ? (
            alerts.map((alert) => (
              <div key={alert.id} className="rounded-md border border-white/10 p-4">
                <div className="font-medium text-foreground">
                  {alert.severity} · {alert.title}
                </div>
                <div>
                  {alert.walletName}
                  {alert.provider ? ` · ${alert.provider}` : ""}
                </div>
                <div className="text-xs">{formatDate(alert.createdAt)}</div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No open platform alerts"
              description="Platform-wide issues will surface here once alerts are created."
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
