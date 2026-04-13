import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { ProviderCard } from "@/components/app/provider-card";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/access";
import { hasCapability } from "@/lib/auth/permissions";
import { getWalletProvidersData } from "@/lib/data/wallets";

export default async function ProvidersPage({
  params
}: {
  params: Promise<{ walletId: string }>;
}) {
  const { walletId } = await params;
  const session = await requireSession();
  const { walletContext, providers } = await getWalletProvidersData(walletId, session.user.id);
  const canManageProviders = walletContext.role
    ? hasCapability(walletContext.role, "provider.write")
    : false;

  return (
    <AppShell
      title="Connected tools"
      description="Review the services behind the website, what each one does, and where each one leads."
      walletContext={walletContext}
    >
      {canManageProviders ? (
        <div className="mb-6 flex justify-end">
          <Link href={`/app/wallets/${walletContext.id}/providers/new`}>
            <Button>Connect a tool</Button>
          </Link>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {providers.length ? (
          providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} walletId={walletContext.id} />
          ))
        ) : (
          <EmptyState
            title="No connected tools yet"
            description="Add hosting, CMS, billing, and domain services so this wallet becomes useful right away."
          />
        )}
      </div>
    </AppShell>
  );
}
