import { AppShell } from "@/components/app/app-shell";
import { StatCard } from "@/components/app/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <AppShell
      title="Platform admin"
      description="Inspect platform health, onboarding quality, subscriptions, referrals, and support."
    >
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Wallets" value="128" supporting="Across all lifecycle states." />
          <StatCard label="Active subscriptions" value="96" supporting="Current paying wallets." tone="success" />
          <StatCard label="Support queue" value="12" supporting="Open and in-progress cases." tone="warning" />
          <StatCard label="Critical alerts" value="4" supporting="Requires platform review." tone="danger" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Operational focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted">
              <p>Review wallets blocked in handoff.</p>
              <p>Inspect failed billing and provider sync incidents.</p>
              <p>Watch partner referrals and payout readiness.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Admin domains</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted">
              <div className="rounded-md border border-white/10 p-3">Users</div>
              <div className="rounded-md border border-white/10 p-3">Wallets</div>
              <div className="rounded-md border border-white/10 p-3">Subscriptions</div>
              <div className="rounded-md border border-white/10 p-3">Referrals</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
