import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminReferralsPage() {
  return (
    <AppShell title="Admin referrals" description="Track partner attribution, payout readiness, and disputes.">
      <Card>
        <CardHeader>
          <CardTitle>Referrals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted">
          <div className="rounded-md border border-white/10 p-4">Northline Studio • Evergreen Dental Wallet • Active</div>
          <div className="rounded-md border border-white/10 p-4">Signal Works • Pending review</div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
