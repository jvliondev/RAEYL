import Link from "next/link";

import { dismissOwnerWalkthrough } from "@/lib/actions/wallets";
import { requireSession } from "@/lib/auth/access";
import { getWalletDashboardData } from "@/lib/data/wallets";
import { getWalletIntelligence } from "@/lib/services/wallet-intelligence";
import type { WalletRole } from "@/lib/types";
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

  const role = membershipRole.toLowerCase();
  const isOwner = membershipRole.toUpperCase() === "WALLET_OWNER";
  const walletContext = {
    id: wallet.id,
    businessName: wallet.businessName,
    planTier: wallet.planTier,
    role
  };

  const intelligence = getWalletIntelligence({
    role: role as WalletRole,
    walletId: wallet.id,
    templateSlug: wallet.template.slug,
    firstWebsiteId: wallet.websites[0]?.id ?? null,
    websites: wallet.websites,
    providers: wallet.providers,
    billing: wallet.billing,
    alerts: wallet.alerts,
    ownerAccepted: wallet.handoffStatus.toLowerCase() === "completed"
  });

  const allEditRoutes = wallet.websites.flatMap((website) =>
    website.editRoutes.map((route) => ({ ...route, websiteName: website.name }))
  );

  if (isOwner) {
    return (
      <AppShell
        title={`Welcome to your ${wallet.businessName} website`}
        description="Everything your website needs, connected, explained, and ready when you need it."
        walletContext={walletContext}
      >
        {handoff === "complete" ? (
          <div className="mb-6 rounded-md border border-success/30 bg-success/5 p-5">
            <div className="font-medium text-success">Your website is officially handed off.</div>
            <p className="mt-1 text-sm text-muted">
              Your developer has completed the setup. Everything below is now organized for you in one place.
            </p>
          </div>
        ) : null}

        <div className="space-y-8">
          {!wallet.ownerWalkthroughDismissed ? (
            <Card>
              <CardHeader>
                <CardTitle>Start here</CardTitle>
                <CardDescription>
                  This wallet was set up to help you understand your website without needing technical language.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-md border border-white/10 p-4 text-sm text-muted">
                    <div className="font-medium text-foreground">Your main action</div>
                    <p className="mt-2">Use the top button whenever you need to update the website.</p>
                  </div>
                  <div className="rounded-md border border-white/10 p-4 text-sm text-muted">
                    <div className="font-medium text-foreground">Your services</div>
                    <p className="mt-2">Every tool is explained in plain language, including what it does and when it matters.</p>
                  </div>
                  <div className="rounded-md border border-white/10 p-4 text-sm text-muted">
                    <div className="font-medium text-foreground">Your costs</div>
                    <p className="mt-2">Billing is summarized here so you can see what the website needs to stay live.</p>
                  </div>
                </div>
                <form action={dismissOwnerWalkthrough}>
                  <input type="hidden" name="walletId" value={wallet.id} />
                  <Button type="submit" variant="secondary">Got it</Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Confidence"
              value={intelligence.confidenceLabel}
              supporting={intelligence.confidenceSummary}
              tone={intelligence.score >= 85 ? "success" : intelligence.score >= 60 ? "accent" : "warning"}
              tag={`${intelligence.score}%`}
            />
            <StatCard
              label="Connected services"
              value={String(wallet.providers.length)}
              supporting="Everything linked to this website is organized here."
              tag={`${intelligence.verifiedProviderCount} verified`}
            />
            <StatCard
              label="Monthly website cost"
              value={formatCurrency(wallet.monthlyCost)}
              supporting="A simple estimate across the tracked website services."
              tag="Estimated"
            />
            <StatCard
              label="Needs review"
              value={String(wallet.urgentAlerts)}
              supporting="Anything important stays visible instead of hidden in provider dashboards."
              tone="warning"
              tag="Attention"
            />
          </div>

          {intelligence.primaryAction ? (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold">{intelligence.primaryAction.label}</div>
                  <p className="mt-1 text-sm text-muted">{intelligence.primaryAction.description}</p>
                  <p className="mt-3 text-xs text-muted">{intelligence.summary}</p>
                </div>
                <Button asChild className="shrink-0">
                  <a
                    href={intelligence.primaryAction.href}
                    target={intelligence.primaryAction.href.startsWith("http") ? "_blank" : undefined}
                    rel={intelligence.primaryAction.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    {intelligence.primaryAction.label}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {wallet.alerts.length > 0 ? (
            <Card className="border-warning/30">
              <CardHeader>
                <CardTitle>Something needs your attention</CardTitle>
                <CardDescription>
                  Nothing here is technical for the sake of it. Each item explains what happened and what to do next.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {wallet.alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="rounded-md border border-white/10 p-4">
                    <div className="text-sm font-medium">{alert.title}</div>
                    <p className="mt-1 text-sm text-muted">{alert.message}</p>
                    {alert.recommendation ? <p className="mt-2 text-xs text-primary">{alert.recommendation}</p> : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {allEditRoutes.filter((route) => !route.isPrimary).length > 0 ? (
            <div>
              <SectionHeading
                title="Other things you can update"
                description="These are the specific parts of the website that already have a direct editing path."
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {allEditRoutes
                  .filter((route) => !route.isPrimary)
                  .map((route) => (
                    <a
                      key={route.id}
                      href={route.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col gap-1 rounded-md border border-white/10 p-4 transition-all hover:border-white/20 hover:bg-white/5"
                    >
                      <div className="text-sm font-medium">{route.label}</div>
                      <p className="text-xs text-muted">{route.description}</p>
                    </a>
                  ))}
              </div>
            </div>
          ) : null}

          <div>
            <SectionHeading
              title="What powers your website"
              description="Every service is explained in plain language, so you know what it does and when it matters."
            />
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {wallet.providers.length ? (
                wallet.providers.map((provider) => (
                  <div key={provider.id} className="space-y-2 rounded-md border border-white/10 p-5">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{provider.name}</div>
                      <Badge
                        variant={
                          provider.health === "healthy"
                            ? "success"
                            : provider.health === "issue"
                              ? "danger"
                              : "neutral"
                        }
                      >
                        {provider.health === "healthy"
                          ? "Running"
                          : provider.health === "issue"
                            ? "Needs attention"
                            : "Connected"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted">{provider.ownerDescription}</p>
                    {provider.dashboardUrl ? (
                      <a
                        href={provider.dashboardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Open dashboard →
                      </a>
                    ) : null}
                  </div>
                ))
              ) : (
                <EmptyState
                  title="Your website services will appear here"
                  description="Once the main website tools are connected, you will see what each one does and where it lives."
                />
              )}
            </div>
          </div>

          {wallet.billing.length > 0 ? (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Your website costs</CardTitle>
                  <CardDescription>
                    What you pay each month to keep your website running. Total: {formatCurrency(wallet.monthlyCost)}/month estimated.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {wallet.billing.map((record) => (
                  <div key={record.id} className="flex items-center justify-between rounded-md border border-white/10 px-4 py-3">
                    <div>
                      <div className="text-sm font-medium">{record.label}</div>
                      <div className="text-xs text-muted">{record.description}</div>
                    </div>
                    <div className="shrink-0 text-sm">{formatCurrency(record.amount)}/mo</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Need help?</CardTitle>
              <CardDescription>
                Your support history and next request both live in one place, so you never have to guess where to ask.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href={`/app/wallets/${walletId}/support`}>Submit a support request</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Your website control center"
      description="See what powers the site, what still needs setup, and the clearest next move for handoff."
      walletContext={walletContext}
    >
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Readiness score"
            value={`${intelligence.score}%`}
            supporting={intelligence.confidenceSummary}
            tone={intelligence.score >= 85 ? "success" : intelligence.score >= 60 ? "accent" : "warning"}
            tag={intelligence.confidenceLabel}
          />
          <StatCard
            label="Connected tools"
            value={String(wallet.providers.length)}
            supporting="Every service behind the site is listed here."
            tone="accent"
            tag={`${intelligence.verifiedProviderCount} verified`}
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
            supporting="Anything that weakens trust or handoff stays visible."
            tone="warning"
            tag="Review"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Best next steps</CardTitle>
                <CardDescription>
                  RAEYL picks the most useful next move based on what is already configured and what is still missing.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {[intelligence.primaryAction, ...intelligence.supportingActions]
                .filter(Boolean)
                .map((action) => (
                  <ActionCard
                    key={action!.label}
                    href={action!.href}
                    label={action!.label}
                    description={action!.description}
                  />
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Readiness checklist</CardTitle>
                <CardDescription>
                  A clean handoff needs the basics documented, connected, and easy for the owner to trust.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {intelligence.checklist.map((item) => (
                <div key={item.key} className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">{item.label}</div>
                      <p className="mt-1 text-sm text-muted">{item.description}</p>
                    </div>
                    <Badge variant={item.complete ? "success" : item.priority === "critical" ? "warning" : "neutral"}>
                      {item.complete ? "Ready" : "Missing"}
                    </Badge>
                  </div>
                  {!item.complete && item.href ? (
                    <div className="mt-3">
                      <Button asChild variant="secondary" className="h-8 px-3 text-xs">
                        <Link href={item.href}>Open</Link>
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {intelligence.missingRecommendedCategories.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>What would make this wallet feel complete</CardTitle>
              <CardDescription>
                Based on the selected website type, these system categories would make the owner experience feel more complete.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {intelligence.missingRecommendedCategories.map((category) => (
                <Badge key={category} variant="neutral">
                  {category.replace("_", " ")}
                </Badge>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {wallet.alerts.length > 0 || intelligence.duplicateProviders.length > 0 || intelligence.staleProviderCount > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Attention and cleanup</CardTitle>
              <CardDescription>
                Fixing these items makes the wallet feel clearer and more trustworthy to the owner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {wallet.alerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-1 text-sm font-medium">{alert.title}</div>
                  <p className="text-sm text-muted">{alert.message}</p>
                  <p className="mt-2 text-xs text-primary">{alert.recommendation}</p>
                </div>
              ))}
              {intelligence.duplicateProviders.map((providerName) => (
                <div key={providerName} className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-1 text-sm font-medium">Possible duplicate tool entry</div>
                  <p className="text-sm text-muted">
                    {providerName} appears more than once. Clean this up so the owner sees one clear record per service.
                  </p>
                  <p className="mt-2 text-xs text-primary">Review connected tools and merge or remove duplicates.</p>
                </div>
              ))}
              {intelligence.staleProviderCount > 0 ? (
                <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-1 text-sm font-medium">Provider checks are getting stale</div>
                  <p className="text-sm text-muted">
                    {intelligence.staleProviderCount} connected tool{intelligence.staleProviderCount === 1 ? "" : "s"} have not been checked recently.
                  </p>
                  <p className="mt-2 text-xs text-primary">Run provider health checks so the owner sees fresher status signals.</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-4">
          <SectionHeading
            title="How your website is set up"
            description="Each connected tool explains what it does, how it is connected, and whether it still needs verification."
          />
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {wallet.providers.length ? (
              wallet.providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} walletId={wallet.id} />
              ))
            ) : (
              <EmptyState
                title="No connected tools yet"
                description="Start with hosting and content editing so the wallet becomes instantly useful."
                primaryAction={
                  <Button asChild>
                    <Link href={`/app/wallets/${wallet.id}/providers/new`}>Connect the first tool</Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Your website costs</CardTitle>
                <CardDescription>
                  Clear cost visibility helps the owner understand value, renewals, and who manages what.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {wallet.billing.length ? (
                wallet.billing.slice(0, 4).map((record) => (
                  <div key={record.id} className="flex items-center justify-between rounded-md border border-white/10 px-4 py-3">
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
                  description="Add billing records so the owner can see the real monthly website picture."
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
