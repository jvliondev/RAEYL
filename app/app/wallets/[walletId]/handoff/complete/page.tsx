import Link from "next/link";

import { requireSession } from "@/lib/auth/access";
import { getWalletHandoffData } from "@/lib/data/wallets";
import { formatDate } from "@/lib/utils";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HandoffCompletePage({
  params
}: {
  params: Promise<{ walletId: string }>;
}) {
  const { walletId } = await params;
  const session = await requireSession();
  const { walletContext, latestInvite, latestRecord, readiness } = await getWalletHandoffData(
    walletId,
    session.user.id
  );

  return (
    <AppShell
      title="Handoff complete"
      description={`${walletContext.businessName} has been handed over.`}
      walletContext={walletContext}
    >
      <div className="max-w-3xl space-y-6">
        <div className="space-y-3 rounded-lg border border-success/30 bg-success/5 p-8 text-center">
          <div className="text-xl font-semibold">{walletContext.businessName} is officially handed off.</div>
          <p className="mx-auto max-w-md text-sm text-muted">
            The wallet is live, the owner has access, and the website systems are now explained in one place.
          </p>
          {latestRecord?.completedAt ? (
            <div className="text-xs text-muted">Completed {formatDate(latestRecord.completedAt)}</div>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>What the owner now has</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {readiness.items.filter((item) => item.complete).map((item) => (
                <div key={item.key} className="flex items-center gap-3 rounded-md border border-white/10 p-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/15 text-xs font-semibold text-success">
                    OK
                  </div>
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What happens next</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted">
              <p>The owner can now log in and use RAEYL as their website control center.</p>
              <p>Support requests stay tied to the wallet so the relationship continues cleanly after handoff.</p>
              <p>The wallet remains the shared source of truth for ownership, systems, costs, and edit paths.</p>
            </CardContent>
          </Card>
        </div>

        {latestInvite ? (
          <Card>
            <CardHeader>
              <CardTitle>Owner access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted">
              <div>
                <span className="text-foreground">Invited:</span> {latestInvite.email}
              </div>
              <div>
                <span className="text-foreground">Status:</span> {latestInvite.status}
              </div>
              {latestInvite.acceptedAt ? (
                <div>
                  <span className="text-foreground">Accepted:</span> {formatDate(latestInvite.acceptedAt)}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <div className="flex gap-3">
          <Button asChild>
            <Link href={`/app/wallets/${walletId}`}>View wallet</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/app/wallets">Back to all wallets</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
