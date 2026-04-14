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
      <div className="max-w-2xl space-y-6">
        {/* The moment */}
        <div className="rounded-lg border border-success/30 bg-success/5 p-8 text-center space-y-3">
          <div className="text-4xl">✓</div>
          <div className="text-xl font-semibold">
            {walletContext.businessName} is officially handed off.
          </div>
          <p className="text-sm text-muted max-w-md mx-auto">
            The wallet is live, the owner has access, and everything is documented. This is what a
            professional handoff looks like.
          </p>
          {latestRecord?.completedAt && (
            <div className="text-xs text-muted">
              Completed {formatDate(latestRecord.completedAt)}
            </div>
          )}
        </div>

        {/* What the owner has */}
        <Card>
          <CardHeader>
            <CardTitle>What the owner now has</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {readiness.items.filter((i) => i.complete).map((item) => (
              <div key={item.key} className="flex items-center gap-3 rounded-md border border-white/10 p-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/15 text-success text-xs font-semibold">
                  ✓
                </div>
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Owner info */}
        {latestInvite && (
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
              {latestInvite.acceptedAt && (
                <div>
                  <span className="text-foreground">Accepted:</span>{" "}
                  {formatDate(latestInvite.acceptedAt)}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Next steps */}
        <Card>
          <CardHeader>
            <CardTitle>What happens next</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            <p>
              The owner can now log in to RAEYL and see their website control center — the tools,
              costs, and editing paths you set up for them.
            </p>
            <p>
              If they have questions or need changes, they can submit a support request directly
              from their wallet. You&apos;ll be notified.
            </p>
            <p>
              The wallet stays live and connected. Nothing expires — you stay available as long as
              the wallet is active.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button asChild>
            <Link href={`/app/wallets/${walletId}`}>
              View wallet
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/app/wallets">
              Back to all wallets
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
