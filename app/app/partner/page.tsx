import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/app/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/app/empty-state";
import { requireSession } from "@/lib/auth/access";
import { getPartnerDashboardData } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PartnerPage() {
  const session = await requireSession();
  const data = await getPartnerDashboardData(session.user.id);

  if (!data) {
    return (
      <AppShell
        title="Partner dashboard"
        description="Track referred wallets, active rewards, and payout readiness."
      >
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted">
              You don&apos;t have a partner account yet. Contact the RAEYL team to get set up.
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Partner dashboard"
      description="Track referred wallets, active rewards, and payout readiness."
    >
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Active referrals"
            value={String(data.stats.activeReferrals)}
            supporting={`${data.stats.totalReferrals} total attributed wallets.`}
          />
          <StatCard
            label="Estimated monthly payout"
            value={formatCurrency(data.stats.estimatedMonthlyPayout)}
            supporting="Based on active referrals and current plan mix."
            tone="success"
          />
          <StatCard
            label="Commission rate"
            value={`${(data.partner.commissionRateBps / 100).toFixed(1)}%`}
            supporting="Your current partner commission rate."
            tone="accent"
          />
          <StatCard
            label="Live wallets"
            value={String(data.stats.liveWallets)}
            supporting="Referred wallets with an active subscription."
          />
          <StatCard
            label="Completed handoffs"
            value={String(data.stats.handoffCompleted)}
            supporting="Wallets fully handed off to the owner."
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Attributed wallets</CardTitle>
                <CardDescription>Wallets referred through your partner account.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.referrals.length === 0 ? (
                <EmptyState
                  title="No referrals yet"
                  description="Wallets attributed to your partner account will appear here."
                />
              ) : (
                data.referrals.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col gap-3 rounded-md border border-white/10 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="font-medium">{r.walletName}</div>
                      <div className="text-sm text-muted">{r.businessName}</div>
                      {r.activatedAt ? (
                        <div className="mt-1 text-xs text-muted">Active since {formatDate(r.activatedAt)}</div>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant={r.status === "ACTIVE" ? "success" : "warning"}>{r.status.toLowerCase()}</Badge>
                      <Badge variant="neutral">{r.planTier}</Badge>
                      <Badge variant={r.handoffStatus === "COMPLETED" ? "success" : "neutral"}>
                        {r.handoffStatus.toLowerCase().replace("_", " ")}
                      </Badge>
                      {r.subscriptionStatus ? (
                        <div className="text-xs text-muted">{r.subscriptionStatus.toLowerCase().replace("_", " ")}</div>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payout history</CardTitle>
              <CardDescription>Recent payouts from your partner account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.payouts.length === 0 ? (
                <EmptyState
                  title="No payouts yet"
                  description="Payouts will appear here once your first payout period closes."
                />
              ) : (
                data.payouts.map((p) => (
                  <div key={p.id} className="space-y-1 rounded-md border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{formatCurrency(p.amount)}</span>
                      <Badge
                        variant={
                          p.status === "PAID"
                            ? "success"
                            : p.status === "READY"
                              ? "accent"
                              : p.status === "FAILED"
                                ? "danger"
                                : "warning"
                        }
                      >
                        {p.status.toLowerCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted">
                      {formatDate(p.periodStart)} - {formatDate(p.periodEnd)}
                    </div>
                    {p.paidAt ? <div className="text-xs text-muted">Paid {formatDate(p.paidAt)}</div> : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
