import { AppShell } from "@/components/app/app-shell";
import { StatCard } from "@/components/app/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { wallet } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function PartnerPage() {
  return (
    <AppShell
      title="Partner dashboard"
      description="Track referred wallets, active rewards, and payout readiness."
    >
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Active referrals" value={String(wallet.referrals.length)} supporting="Wallets attributed to your partner account." />
          <StatCard label="Estimated monthly payout" value={formatCurrency(wallet.referrals[0]?.monthlyPayout ?? 0)} supporting="Current referred wallet rewards." tone="success" />
          <StatCard label="Payout status" value="Pending" supporting="Next payout window closes at month end." tone="warning" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Attributed wallets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {wallet.referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between rounded-md border border-white/10 p-4">
                <div>
                  <div className="font-medium">{referral.walletName}</div>
                  <div className="text-sm text-muted">{referral.partnerName}</div>
                </div>
                <div className="text-sm">{formatCurrency(referral.monthlyPayout)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
