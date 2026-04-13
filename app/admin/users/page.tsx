import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUsersPage() {
  return (
    <AppShell title="Admin users" description="Inspect account state, memberships, and onboarding quality.">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted">
          <div className="rounded-md border border-white/10 p-4">Alex Morgan • Active • 3 wallets</div>
          <div className="rounded-md border border-white/10 p-4">Maya Bennett • Pending owner acceptance</div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
