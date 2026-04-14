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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function WalletDashboardPage({
  params,
  searchParams
}: {
  params: Promise<{ walletId: string }>;
  searchParams: Promise<{ handoff?: string }>;
}) {
  const { walletId } = await params;
  const { handoff } = await searchParams;
  const session = await requireSession();
  const { wallet, membershipRole } = await getWalletDashboardData(walletId, session.user.id);

  const isOwner = membershipRole.toUpperCase() === "WALLET_OWNER";
  const walletContext = {
    id: wallet.id,
    businessName: wallet.businessName,
    planTier: wallet.planTier,
    role: membershipRole.toLowerCase()
  };

  // Gather all edit routes across all websites
  const allEditRoutes = wallet.websites.flatMap((w) =>
    w.editRoutes.map((r) => ({ ...r, websiteName: w.name, websiteId: w.id }))
  );
  const primaryRoute = allEditRoutes.find((r) => r.isPrimary);

  if (isOwner) {
    // ─── OWNER VIEW ─────────────────────────────────────────────────────────────
    return (
      <AppShell
        title={`Welcome to your ${wallet.businessName} website`}
        description="Everything your website needs — connected, explained, and ready when you need it."
        walletContext={walletContext}
      >
        {handoff === "complete" && (
          <div className="mb-6 rounded-md border border-success/30 bg-success/5 p-5">
            <div className="font-medium text-success">Your website is officially handed off.</div>
            <p className="mt-1 text-sm text-muted">
              Your developer has completed the setup. Everything below is yours to keep.
            </p>
          </div>
        )}

        <div className="space-y-8">
          {/* Primary CTA */}
          {primaryRoute && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold">{primaryRoute.label}</div>
                  <p className="text-sm text-muted mt-1">
                    {primaryRoute.description}
                  </p>
                </div>
                <Button asChild className="shrink-0">
                  <a href={primaryRoute.destinationUrl} target="_blank" rel="noopener noreferrer">
                    Edit your website
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Alerts */}
          {wallet.alerts.length > 0 && (
            <Card className="border-warning/30">
              <CardHeader>
                <CardTitle>Something needs your attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {wallet.alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="rounded-md border border-white/10 p-4">
                    <div className="text-sm font-medium">{alert.title}</div>
                    <p className="text-sm text-muted mt-1">{alert.message}</p>
                    {alert.recommendation && (
                      <p className="text-xs text-primary mt-2">{alert.recommendation}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Other edit paths */}
          {allEditRoutes.filter((r) => !r.isPrimary).length > 0 && (
            <div>
              <SectionHeading
                title="Other things you can update"
                description="These are specific areas of your website you can edit directly."
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {allEditRoutes.filter((r) => !r.isPrimary).map((route) => (
                  <a
                    key={route.id}
                    href={route.destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-1 rounded-md border border-white/10 p-4 hover:bg-white/5 hover:border-white/20 transition-all"
                  >
                    <div className="text-sm font-medium">{route.label}</div>
                    <p className="text-xs text-muted">{route.description}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* What powers your site */}
          <div>
            <SectionHeading
              title="What powers your website"
              description="These are the services that keep your website running. Your developer manages them on your behalf."
            />
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {wallet.providers.length ? (
                wallet.providers.map((provider) => (
                  <div key={provider.id} className="rounded-md border border-white/10 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{provider.name}</div>
                      <Badge variant={
                        provider.health === "healthy" ? "success" :
                        provider.health === "issue" ? "danger" : "secondary"
                      }>
                        {provider.health === "healthy" ? "Running" :
                         provider.health === "issue" ? "Needs attention" : "Connected"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted">{provider.ownerDescription}</p>
                    {provider.dashboardUrl && (
                      <a
                        href={provider.dashboardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Open dashboard →
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No connected tools yet"
                  description="Your developer hasn't connected any tools yet."
                />
              )}
            </div>
          </div>

          {/* Costs */}
          {wallet.billing.length > 0 && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Your website costs</CardTitle>
                  <CardDescription>
                    What you pay each month to keep your website running.
                    Total: {formatCurrency(wallet.monthlyCost)}/month estimated.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {wallet.billing.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-md border border-white/10 px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{record.label}</div>
                      <div className="text-xs text-muted">{record.description}</div>
                    </div>
                    <div className="text-sm shrink-0">{formatCurrency(record.amount)}/mo</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need help?</CardTitle>
              <CardDescription>
                Your developer is here to help with anything your website needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href={`/app/wallets/${walletId}/support`}>
                  Submit a support request
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  // ─── DEVELOPER VIEW ────────────────────────────────────────────────────────────
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
      walletContext={walletContext}
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
                      {item.actor} · {item.action}
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
