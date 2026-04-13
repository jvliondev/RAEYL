import Link from "next/link";

import { requireSession } from "@/lib/auth/access";
import { hasCapability } from "@/lib/auth/permissions";
import { getWalletDashboardData } from "@/lib/data/wallets";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ActionCard } from "@/components/app/action-card";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { ProviderCard } from "@/components/app/provider-card";
import { SectionHeading } from "@/components/app/section-heading";
import { StatCard } from "@/components/app/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function WalletDashboardPage({
  params
}: {
  params: Promise<{ walletId: string }>;
}) {
  const { walletId } = await params;
  const session = await requireSession();
  const { wallet, membershipRole } = await getWalletDashboardData(walletId, session.user.id);
  const visibleActions = [
    {
      label: "Edit website",
      description: "Open the main editing path for website updates.",
      href: wallet.websites[0]
        ? `/app/wallets/${wallet.id}/websites/${wallet.websites[0].id}`
        : `/app/wallets/${wallet.id}/setup`,
      visible: hasCapability(membershipRole.toLowerCase(), "wallet.read")
    },
    {
      label: "Review what needs attention",
      description: "See the items that need a quick review right now.",
      href: `/app/wallets/${wallet.id}/alerts`,
      visible: hasCapability(membershipRole.toLowerCase(), "wallet.read")
    },
    {
      label: "Manage people and access",
      description: "Review who can access this wallet and what they can do.",
      href: `/app/wallets/${wallet.id}/access`,
      visible: hasCapability(membershipRole.toLowerCase(), "access.manage")
    },
    {
      label: "Review costs and billing",
      description: "See what each service costs and where each bill is managed.",
      href: `/app/wallets/${wallet.id}/billing`,
      visible: hasCapability(membershipRole.toLowerCase(), "billing.read")
    }
  ].filter((action) => action.visible);

  return (
    <AppShell
      title="Your website control center"
      description="See what powers your website, what needs attention, and where to go when you need to make a change."
      walletContext={{
        id: wallet.id,
        businessName: wallet.businessName,
        planTier: wallet.planTier,
        role: membershipRole.toLowerCase()
      }}
    >
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Website status"
            value={wallet.setupStatus}
            supporting="A clear summary of the current wallet state."
            tone={wallet.urgentAlerts ? "warning" : "success"}
            tag={wallet.alerts.length ? `${wallet.alerts.length} open` : "Healthy"}
          />
          <StatCard
            label="Connected tools"
            value={String(wallet.providers.length)}
            supporting="Every service behind the site is listed here."
            tone="accent"
            tag="Mapped"
          />
          <StatCard
            label="Monthly website cost"
            value={formatCurrency(wallet.monthlyCost)}
            supporting="Across the active website services in this wallet."
            tag="Estimated"
          />
          <StatCard
            label="Needs attention"
            value={String(wallet.urgentAlerts)}
            supporting="Nothing important is buried or easy to miss."
            tone="warning"
            tag="Review"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>What would you like to do?</CardTitle>
                <CardDescription>RAEYL will guide you to the right place without making you guess.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {visibleActions.map((action) => (
                <ActionCard key={action.label} {...action} />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Attention and updates</CardTitle>
                <CardDescription>Anything that needs a review appears here with a clear next step.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {wallet.alerts.length ? (
                wallet.alerts.slice(0, 2).map((alert) => (
                  <div key={alert.id} className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-1 text-sm font-medium">{alert.title}</div>
                    <p className="text-sm text-muted">{alert.message}</p>
                    <p className="mt-2 text-xs text-primary">{alert.recommendation}</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="Everything looks good right now."
                  description="If something needs your attention, it will appear here with the next step."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <SectionHeading
            title="How your website is set up"
            description="Each connected tool includes a simple explanation, current status, and the right place to go when action is needed."
          />
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {wallet.providers.length ? (
              wallet.providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} walletId={wallet.id} />
              ))
            ) : (
              <EmptyState
                title="No connected tools yet"
                description="Add the main website services so the owner can see how the site is powered."
              />
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Your website costs</CardTitle>
                <CardDescription>See what each service is for, what it costs, and where each bill is managed.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {wallet.billing.length ? (
                wallet.billing.slice(0, 4).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-md border border-white/10 px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{record.label}</div>
                      <div className="text-xs text-muted">{record.description}</div>
                    </div>
                    <div className="text-sm">{formatCurrency(record.amount)}</div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No costs recorded yet"
                  description="Tracked website costs will appear here once billing records are added."
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recent timeline</CardTitle>
                <CardDescription>See the latest setup, ownership, and connected-tool updates.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {wallet.activity.length ? (
                wallet.activity.map((item) => (
                  <div key={item.id} className="border-l border-white/10 pl-4">
                    <div className="text-sm font-medium">
                      {item.actor} • {item.action}
                    </div>
                    <p className="text-sm text-muted">{item.detail}</p>
                    <p className="mt-1 text-xs text-muted">{formatDate(item.createdAt)}</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No timeline entries yet"
                  description="Important setup, ownership, and support events will appear here."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
