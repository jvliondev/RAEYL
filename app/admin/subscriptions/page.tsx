import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/app/empty-state";
import { getAdminSubscriptionsData } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await getAdminSubscriptionsData();

  return (
    <AppShell title="Subscriptions" description="Review plan state, failed payments, and billing health.">
      <Card>
        <CardHeader>
          <CardTitle>All subscriptions ({subscriptions.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {subscriptions.length === 0 ? (
            <EmptyState title="No subscriptions yet" description="Wallet subscriptions will appear here." />
          ) : (
            subscriptions.map((sub) => (
              <div key={sub.id} className="flex flex-col gap-3 rounded-md border border-white/10 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-medium">{sub.walletName}</div>
                  <div className="text-sm text-muted">{sub.businessName}</div>
                  <div className="text-xs text-muted mt-1">
                    {sub.currentPeriodEnd ? `Renews ${formatDate(sub.currentPeriodEnd)}` : "No renewal date"}
                    {sub.cancelAtPeriodEnd ? " · Cancels at period end" : ""}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{sub.planKey}</Badge>
                  <Badge variant={
                    sub.status === "ACTIVE" || sub.status === "TRIALING" ? "success" :
                    sub.status === "PAST_DUE" ? "danger" : "warning"
                  }>
                    {sub.status.toLowerCase().replace("_", " ")}
                  </Badge>
                  <Badge variant="neutral">{sub.provider.toLowerCase()}</Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
