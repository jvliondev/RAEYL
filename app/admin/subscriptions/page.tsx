import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSubscriptionsPage() {
  return (
    <AppShell title="Admin subscriptions" description="Review plan state, failed payments, and billing health.">
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted">
          <div className="rounded-md border border-white/10 p-4">Growth • Active • Next renewal May 1</div>
          <div className="rounded-md border border-white/10 p-4">Starter • Past due • Needs payment retry</div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
