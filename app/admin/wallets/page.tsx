import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminWalletsPage() {
  return (
    <AppShell title="Admin wallets" description="Review wallet lifecycle, handoff readiness, and ownership state.">
      <Card>
        <CardHeader>
          <CardTitle>Wallets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted">
          <div className="rounded-md border border-white/10 p-4">Evergreen Dental Wallet • Owner invited • Growth plan</div>
          <div className="rounded-md border border-white/10 p-4">Northshore Legal Wallet • Active • Scale plan</div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
