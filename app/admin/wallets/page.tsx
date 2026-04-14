import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/app/empty-state";
import { getAdminWalletsData } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";

export default async function AdminWalletsPage() {
  const wallets = await getAdminWalletsData();

  return (
    <AppShell title="Wallets" description="Review wallet lifecycle, handoff readiness, and ownership state.">
      <Card>
        <CardHeader>
          <CardTitle>All wallets ({wallets.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {wallets.length === 0 ? (
            <EmptyState title="No wallets yet" description="Wallets will appear here once created." />
          ) : (
            wallets.map((wallet) => (
              <Link
                key={wallet.id}
                href={`/app/wallets/${wallet.id}`}
                className="flex flex-col gap-3 rounded-md border border-white/10 p-4 hover:bg-white/5 transition-colors md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-medium">{wallet.name}</div>
                  <div className="text-sm text-muted">{wallet.businessName}</div>
                  <div className="text-xs text-muted mt-1">
                    Created by {wallet.createdBy} · {formatDate(wallet.createdAt)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={"neutral"}>
                    {wallet.status.toLowerCase().replace("_", " ")}
                  </Badge>
                  {wallet.planTier !== "None" && (
                    <Badge variant="accent">{wallet.planTier}</Badge>
                  )}
                  <Badge variant="neutral">{wallet.memberCount} members</Badge>
                  <Badge variant="neutral">{wallet.providerCount} tools</Badge>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
