import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/app/empty-state";
import { requireAdminSession } from "@/lib/auth/access";
import { getAdminReferralsData } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";

export default async function AdminReferralsPage() {
  await requireAdminSession();
  const referrals = await getAdminReferralsData();

  return (
    <AppShell title="Referrals" description="Track partner attribution, payout readiness, and disputes.">
      <Card>
        <CardHeader>
          <CardTitle>All referrals ({referrals.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {referrals.length === 0 ? (
            <EmptyState title="No referrals yet" description="Partner referrals will appear here." />
          ) : (
            referrals.map((ref) => (
              <div
                key={ref.id}
                className="flex flex-col gap-3 rounded-md border border-white/10 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-medium">{ref.partnerName}</div>
                  <div className="text-sm text-muted">{ref.walletName} · {ref.businessName}</div>
                  <div className="mt-1 text-xs text-muted">
                    {(ref.commissionRateBps / 100).toFixed(1)}% commission
                    {ref.activatedAt ? ` · Active since ${formatDate(ref.activatedAt)}` : ""}
                    {" · "}
                    {formatDate(ref.createdAt)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={ref.status === "ACTIVE" ? "success" : ref.status === "PENDING" ? "warning" : "neutral"}
                  >
                    {ref.status.toLowerCase()}
                  </Badge>
                  <Badge variant={ref.partnerStatus === "ACTIVE" ? "success" : "warning"}>
                    Partner {ref.partnerStatus.toLowerCase()}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
