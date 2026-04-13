import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/access";
import { getWalletActivityData } from "@/lib/data/wallets";
import { formatDate } from "@/lib/utils";

export default async function ActivityPage({
  params
}: {
  params: Promise<{ walletId: string }>;
}) {
  const { walletId } = await params;
  const session = await requireSession();
  const { walletContext, activity } = await getWalletActivityData(walletId, session.user.id);

  return (
    <AppShell
      title="Timeline"
      description="Review the key ownership, setup, and support moments in this wallet."
      walletContext={walletContext}
    >
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Wallet timeline</CardTitle>
            <CardDescription>A clear record of the moments that shaped this wallet.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activity.length ? (
            activity.map((item) => (
              <div key={item.id} className="border-l border-white/10 pl-4">
                <div className="text-sm font-medium">{item.actor}</div>
                <div className="text-sm text-foreground">{item.action}</div>
                <div className="text-sm text-muted">{item.detail}</div>
                <div className="mt-1 text-xs text-muted">{formatDate(item.createdAt)}</div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No timeline entries yet"
              description="This wallet's audit history will appear here as setup and ownership events happen."
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
