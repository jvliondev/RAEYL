import Link from "next/link";

import { ActionCard } from "@/components/app/action-card";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState, EmptyStateButton } from "@/components/app/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/access";
import { listWalletsForUser } from "@/lib/data/wallets";

export default async function WalletsPage() {
  const session = await requireSession();
  const wallets = await listWalletsForUser(session.user.id);
  const walletsInSetup = wallets.filter((item) => item.handoffStatus !== "Completed").length;
  const walletsNeedingAttention = wallets.filter((item) => item.alertCount > 0).length;
  const totalProviders = wallets.reduce((sum, item) => sum + item.providerCount, 0);
  const nextActionWallet = wallets.find((item) => item.alertCount > 0) ?? wallets.find((item) => item.handoffStatus !== "Completed");

  return (
    <AppShell
      title="Workspace"
      description="Open the wallets you manage, continue setup, and keep every client handoff moving."
    >
      {wallets.length ? (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>Client wallets</CardDescription>
                <CardTitle>{wallets.length}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted">
                Every client control rail and ownership wallet you can access from this workspace.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Still in setup</CardDescription>
                <CardTitle>{walletsInSetup}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted">
                Wallets that still need provider connections, edit routing, invites, or handoff completion.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Connected tools tracked</CardDescription>
                <CardTitle>{totalProviders}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted">
                Live provider records already attached across the wallets in this workspace.
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ActionCard
              href="/app/wallets/new"
              label="Create a new client wallet"
              description="Start a fresh ownership rail, capture the stack once, and hand it off cleanly."
              rank={1}
            />
            <ActionCard
              href={
                wallets.find((item) => item.alertCount > 0)
                  ? `/app/wallets/${wallets.find((item) => item.alertCount > 0)?.id}/alerts`
                  : "/app/notifications"
              }
              label="Review what needs attention"
              description={
                walletsNeedingAttention
                  ? `${walletsNeedingAttention} wallet${walletsNeedingAttention === 1 ? "" : "s"} currently need review.`
                  : "No urgent wallet alerts are open right now."
              }
              rank={2}
              tone={walletsNeedingAttention ? "warning" : "success"}
            />
            <ActionCard
              href={
                nextActionWallet
                  ? nextActionWallet.alertCount > 0
                    ? `/app/wallets/${nextActionWallet.id}/alerts`
                    : `/app/wallets/${nextActionWallet.id}/setup`
                  : "/app/wallets/new"
              }
              label="Continue the next setup rail"
              description="Jump back into the next wallet that still needs configuration, connection, or handoff work."
              rank={3}
            />
          </div>

          <div className="grid gap-4">
            {wallets.map((item) => {
              const primaryHref =
                item.alertCount > 0
                  ? `/app/wallets/${item.id}/alerts`
                  : item.handoffStatus !== "Completed"
                    ? `/app/wallets/${item.id}/setup`
                    : `/app/wallets/${item.id}`;
              const primaryLabel =
                item.alertCount > 0
                  ? "Review alerts"
                  : item.handoffStatus !== "Completed"
                    ? "Continue setup"
                    : "Open wallet";

              return (
                <Link key={item.id} href={primaryHref}>
                  <Card className="transition hover:border-primary/30">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle>{item.businessName}</CardTitle>
                          <CardDescription>{item.websiteUrl ?? "Website address not added yet"}</CardDescription>
                        </div>
                        <div className="text-xs font-medium text-primary">{primaryLabel}</div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
                      <span>{item.planTier} plan · {item.role}</span>
                      <span>
                        {item.websiteCount} website{item.websiteCount === 1 ? "" : "s"} · {item.providerCount} tool{item.providerCount === 1 ? "" : "s"}
                      </span>
                      <span>{item.alertCount} alert{item.alertCount === 1 ? "" : "s"} · {item.handoffStatus}</span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No client wallets yet"
          description="Create your first wallet in this workspace and let RAEYL start building the handoff rail around it."
          primaryAction={
            <Link href="/app/wallets/new">
              <EmptyStateButton>Create first wallet</EmptyStateButton>
            </Link>
          }
        />
      )}
    </AppShell>
  );
}
