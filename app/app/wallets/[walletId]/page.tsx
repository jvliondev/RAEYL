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
          <div className="mb-6 rounded-xl border border-success/25 bg-success/[0.06] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="status-dot status-dot-healthy" />
              <div className="text-[14px] font-semibold text-success">Your website is officially handed off.</div>
            </div>
            <p className="mt-1.5 pl-[18px] text-[13px] text-white/55">
              Your developer has completed the setup. Everything below is organized for you in one place.
            </p>
          </div>
        ) : null}

        <div className="space-y-6">
          {!wallet.ownerWalkthroughDismissed ? (
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.07] to-transparent p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
              <p className="app-eyebrow mb-3">Getting started</p>
              <h3 className="mb-4 text-[17px] font-semibold text-white/90">Your website is ready to explore.</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { title: "Your main action", body: "Use the top button to update your website — it goes directly to the right editing tool." },
                  { title: "Your services", body: "Every tool behind your site is listed here in plain language — what it does, what it costs." },
                  { title: "Your costs", body: "All website billing is summarized so you always know what keeps the site running." }
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                    <div className="mb-1.5 text-[13px] font-semibold text-white/85">{item.title}</div>
                    <p className="text-[12px] leading-5 text-white/50">{item.body}</p>
                  </div>
                ))}
              </div>
              <form action={dismissOwnerWalkthrough} className="mt-5">
                <input type="hidden" name="walletId" value={wallet.id} />
                <Button type="submit" variant="secondary" size="sm">Got it, dismiss</Button>
              </form>
            </div>
          ) : null}

          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
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
              supporting="Estimated across your tracked website services."
              tag="Estimated"
            />
            <StatCard
              label="Needs review"
              value={String(wallet.urgentAlerts)}
              supporting="Anything important stays visible here — not buried in provider dashboards."
              tone={wallet.urgentAlerts > 0 ? "warning" : "neutral"}
              tag={wallet.urgentAlerts > 0 ? "Attention" : "All clear"}
            />
          </div>

          {intelligence.primaryAction ? (
            <div
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#151515] to-[#0f0f0f] px-6 py-5"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.35)" }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="app-eyebrow mb-1.5">Recommended action</p>
                  <div className="text-[16px] font-semibold text-white/90">{intelligence.primaryAction.label}</div>
                  <p className="mt-1 text-[13px] text-white/50">{intelligence.primaryAction.description}</p>
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
              </div>
            </div>
          ) : null}

          {wallet.alerts.length > 0 ? (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Something needs your attention</CardTitle>
                  <CardDescription>
                    Each item explains what happened and what to do next — no technical jargon.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {wallet.alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="rounded-xl border border-warning/15 bg-warning/[0.03] px-4 py-3.5">
                    <div className="flex items-start gap-2.5">
                      <span className="status-dot status-dot-attention mt-[3px] flex-shrink-0" />
                      <div>
                        <div className="text-[13px] font-semibold text-white/85">{alert.title}</div>
                        <p className="mt-0.5 text-[13px] text-white/50">{alert.message}</p>
                        {alert.recommendation ? (
                          <p className="mt-1.5 text-[12px] font-medium text-warning/80">{alert.recommendation}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {allEditRoutes.filter((route) => !route.isPrimary).length > 0 ? (
            <div>
              <SectionHeading
                title="Other things you can update"
                description="These are specific parts of your website with a direct editing path already set up."
              />
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {allEditRoutes.filter((route) => !route.isPrimary).map((route) => (
                  <a
                    key={route.id}
                    href={route.destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 transition-all hover:border-white/[0.13] hover:bg-white/[0.04]"
                  >
                    <div>
                      <div className="text-[13px] font-semibold text-white/85 group-hover:text-white transition-colors">{route.label}</div>
                      {route.description ? (
                        <p className="mt-0.5 text-[12px] text-white/45">{route.description}</p>
                      ) : null}
                    </div>
                    <span className="text-[13px] text-white/30 group-hover:text-white/60 transition-colors mt-0.5">↗</span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <SectionHeading
              title="What powers your website"
              description="Every service explained in plain language — what it does, and when it matters."
            />
            <div className="mt-4 grid gap-3.5 lg:grid-cols-2">
              {wallet.providers.length ? (
                wallet.providers.map((provider) => (
                  <div key={provider.id} className="app-surface rounded-2xl overflow-hidden">
                    <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-white/[0.055]">
                      <div>
                        <div className="text-[15px] font-semibold text-white/90">{provider.name}</div>
                        <p className="mt-1 text-[13px] leading-5 text-white/50">{provider.ownerDescription}</p>
                      </div>
                      <Badge variant={
                        provider.health === "healthy" ? "success" :
                        provider.health === "issue" ? "danger" : "neutral"
                      } className="flex-shrink-0 mt-0.5">
                        {provider.health === "healthy" ? "Running" :
                         provider.health === "issue" ? "Needs attention" : "Connected"}
                      </Badge>
                    </div>
                    {provider.dashboardUrl ? (
                      <div className="px-5 py-3">
                        <a
                          href={provider.dashboardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] font-medium text-white/45 transition-colors hover:text-white/80"
                        >
                          Open dashboard ↗
                        </a>
                      </div>
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
                    What you pay each month to keep your website running.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-0 divide-y divide-white/[0.05]">
                {wallet.billing.map((record) => (
                  <div key={record.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-white/85 truncate">{record.label}</div>
                      {record.description ? (
                        <div className="text-[12px] text-white/40 truncate">{record.description}</div>
                      ) : null}
                    </div>
                    <div className="flex-shrink-0 text-[13px] font-semibold tabular-nums text-white/70">
                      {formatCurrency(record.amount)}<span className="text-[11px] font-normal text-white/35">/mo</span>
                    </div>
                  </div>
                ))}
                {wallet.monthlyCost > 0 ? (
                  <div className="flex items-center justify-between gap-4 py-3">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/35">Total estimated</div>
                    <div className="text-[16px] font-bold tabular-nums text-white/80">
                      {formatCurrency(wallet.monthlyCost)}<span className="text-[11px] font-normal text-white/35">/mo</span>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Need help?</CardTitle>
                <CardDescription>
                  Your support history and next request both live here. You never have to guess where to ask.
                </CardDescription>
              </div>
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

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Best next steps</CardTitle>
                <CardDescription>
                  RAEYL picks the most useful next move based on what is configured and what is still missing.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2.5 sm:grid-cols-2">
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
                  The basics a clean handoff needs — documented, connected, and ready to trust.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {intelligence.checklist.map((item) => (
                <div
                  key={item.key}
                  className={`rounded-xl border px-4 py-3 transition-colors ${
                    item.complete
                      ? "border-success/15 bg-success/[0.04]"
                      : item.priority === "critical"
                        ? "border-warning/15 bg-warning/[0.03]"
                        : "border-white/[0.06] bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className={`mt-[3px] status-dot flex-shrink-0 ${
                        item.complete ? "status-dot-healthy" :
                        item.priority === "critical" ? "status-dot-attention" :
                        "status-dot-neutral"
                      }`} />
                      <div>
                        <div className="text-[13px] font-medium text-white/85">{item.label}</div>
                        <p className="mt-0.5 text-[12px] leading-4 text-white/45">{item.description}</p>
                      </div>
                    </div>
                    <Badge variant={item.complete ? "success" : item.priority === "critical" ? "warning" : "neutral"} className="flex-shrink-0 mt-0.5">
                      {item.complete ? "Ready" : "Missing"}
                    </Badge>
                  </div>
                  {!item.complete && item.href ? (
                    <div className="mt-2.5 pl-[22px]">
                      <Button asChild variant="secondary" size="sm">
                        <Link href={item.href}>Complete this step</Link>
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
              <div>
                <CardTitle>What would make this wallet feel complete</CardTitle>
                <CardDescription>
                  Based on the selected website type, these system categories would make the owner experience feel more complete.
                </CardDescription>
              </div>
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
              <div>
                <CardTitle>Attention & cleanup</CardTitle>
                <CardDescription>
                  Fixing these items makes the wallet feel clearer and more trustworthy to the owner.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {wallet.alerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="rounded-xl border border-warning/15 bg-warning/[0.03] px-4 py-3.5">
                  <div className="flex items-start gap-2.5">
                    <span className="status-dot status-dot-attention mt-[3px] flex-shrink-0" />
                    <div>
                      <div className="text-[13px] font-semibold text-white/85">{alert.title}</div>
                      <p className="mt-0.5 text-[13px] text-white/50">{alert.message}</p>
                      {alert.recommendation ? (
                        <p className="mt-1.5 text-[12px] font-medium text-warning/80">{alert.recommendation}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              {intelligence.duplicateProviders.map((providerName) => (
                <div key={providerName} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5">
                  <div className="text-[13px] font-semibold text-white/85">Possible duplicate: {providerName}</div>
                  <p className="mt-0.5 text-[13px] text-white/50">
                    Appears more than once. Clean this up so the owner sees one clear record per service.
                  </p>
                </div>
              ))}
              {intelligence.staleProviderCount > 0 ? (
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5">
                  <div className="text-[13px] font-semibold text-white/85">Provider checks are getting stale</div>
                  <p className="mt-0.5 text-[13px] text-white/50">
                    {intelligence.staleProviderCount} connected tool{intelligence.staleProviderCount === 1 ? "" : "s"} haven&apos;t been checked recently.
                    Run health checks so the owner sees current status.
                  </p>
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

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Website costs</CardTitle>
                <CardDescription>
                  Clear cost visibility helps the owner understand value, renewals, and who manages what.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-white/[0.05]">
              {wallet.billing.length ? (
                <>
                  {wallet.billing.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-white/85 truncate">{record.label}</div>
                        {record.description ? (
                          <div className="text-[12px] text-white/40 truncate">{record.description}</div>
                        ) : null}
                      </div>
                      <div className="flex-shrink-0 text-[13px] font-semibold tabular-nums text-white/70">
                        {formatCurrency(record.amount)}<span className="text-[11px] font-normal text-white/35">/mo</span>
                      </div>
                    </div>
                  ))}
                  {wallet.monthlyCost > 0 ? (
                    <div className="flex items-center justify-between gap-4 py-3">
                      <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/35">Total estimated</div>
                      <div className="text-[15px] font-bold tabular-nums text-white/80">
                        {formatCurrency(wallet.monthlyCost)}<span className="text-[11px] font-normal text-white/35">/mo</span>
                      </div>
                    </div>
                  ) : null}
                </>
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
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Setup, ownership, and tool updates — in order.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              {wallet.activity.length ? (
                <div className="space-y-0">
                  {wallet.activity.map((item, i) => (
                    <div key={item.id} className={`relative flex gap-3 py-3 ${i < wallet.activity.length - 1 ? "border-b border-white/[0.05]" : ""}`}>
                      {/* Timeline dot */}
                      <div className="mt-[5px] flex-shrink-0">
                        <div className="h-[6px] w-[6px] rounded-full bg-white/20 ring-2 ring-white/[0.06]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-white/80 leading-snug">
                          <span className="text-white/60">{item.actor}</span>
                          {" · "}
                          {item.action}
                        </div>
                        {item.detail ? (
                          <p className="mt-0.5 text-[12px] text-white/45 leading-4">{item.detail}</p>
                        ) : null}
                        <p className="mt-1 text-[11px] text-white/30">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
