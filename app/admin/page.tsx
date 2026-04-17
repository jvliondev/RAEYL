import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { StatCard } from "@/components/app/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminSession } from "@/lib/auth/access";
import { getAdminStats } from "@/lib/data/admin";

export default async function AdminPage() {
  await requireAdminSession();
  const stats = await getAdminStats();

  return (
    <AppShell
      title="Platform admin"
      description="Inspect platform health, onboarding quality, subscriptions, referrals, and support."
    >
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total wallets"
            value={String(stats.totalWallets)}
            supporting={`${stats.walletsInSetup} in setup · ${stats.walletsActive} active`}
          />
          <StatCard
            label="Active subscriptions"
            value={String(stats.activeSubscriptions)}
            supporting="Current paying wallets."
            tone="success"
          />
          <StatCard
            label="Support queue"
            value={String(stats.openSupportCount)}
            supporting="Open and in-progress cases."
            tone={stats.openSupportCount > 0 ? "warning" : undefined}
          />
          <StatCard
            label="Critical alerts"
            value={String(stats.criticalAlertCount)}
            supporting="Requires platform review."
            tone={stats.criticalAlertCount > 0 ? "danger" : undefined}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Total users" value={String(stats.totalUsers)} supporting="All registered accounts." />
          <StatCard label="In setup" value={String(stats.walletsInSetup)} supporting="Wallets not yet handed off." />
          <StatCard label="Handed off" value={String(stats.walletsActive)} supporting="Live wallets with owners." />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick links</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              {[
                { href: "/admin/users", label: "Users" },
                { href: "/admin/wallets", label: "Wallets" },
                { href: "/admin/subscriptions", label: "Subscriptions" },
                { href: "/admin/referrals", label: "Referrals" },
                { href: "/admin/alerts", label: "Alerts" },
                { href: "/admin/support", label: "Support queue" },
                { href: "/admin/audit", label: "Audit log" }
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md border border-white/10 p-3 transition-colors hover:bg-white/5"
                >
                  {label}
                </Link>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Operational focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted">
              <p>Review wallets blocked in handoff.</p>
              <p>Inspect failed billing and provider sync incidents.</p>
              <p>Watch partner referrals and payout readiness.</p>
              <p>Monitor critical alerts and open support cases.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
