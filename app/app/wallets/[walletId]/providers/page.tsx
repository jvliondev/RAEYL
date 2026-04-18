import Link from "next/link";

import { refreshWalletHealth } from "@/lib/actions/wallets";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { ProviderCard } from "@/components/app/provider-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/access";
import { hasCapability } from "@/lib/auth/permissions";
import { getWalletProvidersData } from "@/lib/data/wallets";
import { getWalletIntelligence } from "@/lib/services/wallet-intelligence";
import type { WalletRole } from "@/lib/types";

export default async function ProvidersPage({
  params,
  searchParams
}: {
  params: Promise<{ walletId: string }>;
  searchParams: Promise<{ health?: string }>;
}) {
  const { walletId } = await params;
  const { health } = await searchParams;
  const session = await requireSession();
  const { walletContext, providers, templateSlug } = await getWalletProvidersData(walletId, session.user.id);
  const canManageProviders = walletContext.role ? hasCapability(walletContext.role, "provider.write") : false;
  const intelligence = getWalletIntelligence({
    role: walletContext.role as WalletRole,
    walletId,
    templateSlug,
    websites: [],
    providers,
    billing: [],
    alerts: [],
    ownerAccepted: true
  });

  const verifiedCount = providers.filter(
    (provider) => provider.health === "healthy" || provider.health === "attention"
  ).length;

  return (
    <AppShell
      title="Connected tools"
      description="Review every service behind the website, what it does, how it is connected, and where it leads."
      walletContext={walletContext}
    >
      <div className="space-y-6">
        {health === "checked" ? (
          <Card>
            <CardContent className="py-4 text-sm text-success">
              Live health checks finished. Provider status has been refreshed where verification is available.
            </CardContent>
          </Card>
        ) : null}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <Card>
              <CardContent className="flex items-center gap-3 py-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-muted">Connected</div>
                  <div className="text-2xl font-semibold">{providers.length}</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 py-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-muted">Verified</div>
                  <div className="text-2xl font-semibold">{verifiedCount}</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 py-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-muted">Duplicates</div>
                  <div className="text-2xl font-semibold">{intelligence.duplicateProviders.length}</div>
                </div>
              </CardContent>
            </Card>
          </div>
          {canManageProviders ? (
            <div className="flex flex-wrap gap-3">
              <form action={refreshWalletHealth}>
                <input type="hidden" name="walletId" value={walletContext.id} />
                <Button type="submit" variant="secondary">Run health checks</Button>
              </form>
              <Link href={`/app/wallets/${walletContext.id}/providers/new`}>
                <Button>Connect a tool</Button>
              </Link>
            </div>
          ) : null}
        </div>

        {intelligence.missingRecommendedCategories.length > 0 ? (
          <Card>
            <CardContent className="space-y-3 py-5">
              <div className="flex items-center gap-2">
                <Badge variant="warning">Suggested next</Badge>
                <div className="text-sm font-medium">Recommended systems are still missing</div>
              </div>
              <p className="text-sm text-muted">
                Based on this wallet&apos;s website type, adding these categories would make the handoff feel more complete.
              </p>
              <div className="flex flex-wrap gap-2">
                {intelligence.missingRecommendedCategories.map((category) => (
                  <Badge key={category} variant="neutral">
                    {category.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {intelligence.duplicateProviders.length > 0 ? (
          <Card>
            <CardContent className="space-y-3 py-5">
              <div className="flex items-center gap-2">
                <Badge variant="warning">Review</Badge>
                <div className="text-sm font-medium">Possible duplicate tool entries</div>
              </div>
              <p className="text-sm text-muted">
                These services appear more than once. Cleaning them up will make the wallet easier for the owner to trust.
              </p>
              <div className="flex flex-wrap gap-2">
                {intelligence.duplicateProviders.map((providerName) => (
                  <Badge key={providerName} variant="neutral">
                    {providerName}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {providers.length ? (
            providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} walletId={walletContext.id} />
            ))
          ) : (
            <EmptyState
              title="No connected tools yet"
              description="Start with hosting and content editing so the wallet becomes instantly understandable."
              primaryAction={
                canManageProviders ? (
                  <Button asChild>
                    <Link href={`/app/wallets/${walletContext.id}/providers/new`}>Connect the first tool</Link>
                  </Button>
                ) : undefined
              }
              secondaryAction={
                canManageProviders ? (
                  <Button variant="secondary" asChild>
                    <Link href={`/app/wallets/${walletContext.id}/setup`}>Open setup checklist</Link>
                  </Button>
                ) : undefined
              }
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
