import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminAuditData } from "@/lib/data/wallets";
import { formatDate } from "@/lib/utils";

export default async function AdminAuditPage() {
  const logs = await getAdminAuditData();

  return (
    <AppShell
      title="Admin audit"
      description="Inspect immutable records across ownership, billing, invites, and access changes."
    >
      <Card>
        <CardHeader>
          <CardTitle>Audit trail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted">
          {logs.length ? (
            logs.map((log) => (
              <div key={log.id} className="rounded-md border border-white/10 p-4">
                <div className="font-medium text-foreground">{log.action}</div>
                <div>{log.summary}</div>
                <div className="text-xs">
                  {log.walletName} • {log.actor} • {formatDate(log.createdAt)}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No audit events yet"
              description="Immutable platform events will appear here as wallets, billing, and access records change."
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
