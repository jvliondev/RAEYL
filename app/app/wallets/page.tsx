import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { EmptyState, EmptyStateButton } from "@/components/app/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/access";
import { listWalletsForUser } from "@/lib/data/wallets";

export default async function WalletsPage() {
  const session = await requireSession();
  const wallets = await listWalletsForUser(session.user.id);

  return (
    <AppShell title="Wallets" description="Open the website wallets you own, support, or manage.">
      {wallets.length ? (
        <div className="grid gap-4">
          {wallets.map((item) => (
            <Link key={item.id} href={`/app/wallets/${item.id}`}>
              <Card className="transition hover:border-primary/30">
                <CardHeader>
                  <div>
                    <CardTitle>{item.businessName}</CardTitle>
                    <CardDescription>{item.websiteUrl ?? "Website address not added yet"}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-sm text-muted">
                  <span>{item.planTier} plan • {item.role}</span>
                  <span>{item.handoffStatus}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No wallets yet"
          description="Create your first website wallet to begin the setup and handoff flow."
          primaryAction={
            <Link href="/app/wallets/new">
              <EmptyStateButton>Start first wallet</EmptyStateButton>
            </Link>
          }
        />
      )}
    </AppShell>
  );
}
