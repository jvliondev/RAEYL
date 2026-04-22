import Link from "next/link";

import { saveWalletSetupProfile } from "@/lib/actions/wallets";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { requireSession } from "@/lib/auth/access";
import { getWalletSetupData } from "@/lib/data/wallets";
import { prisma } from "@/lib/prisma";
import { getProviderOptionsByCategory, getSetupSlotDefinitions, buildSetupConnectionTargets, getIntentDescription, getIntentLabel, pickNextSetupConnectionTarget } from "@/lib/services/setup-orchestrator";
import { getWalletIntelligence } from "@/lib/services/wallet-intelligence";
import type { WalletRole } from "@/lib/types";

export default async function WalletSetupPage({
  params,
  searchParams
}: {
  params: Promise<{ walletId: string }>;
  searchParams: Promise<{ saved?: string; formError?: string; setupConnected?: string; setupComplete?: string }>;
}) {
  const { walletId } = await params;
  const { saved, formError, setupConnected, setupComplete } = await searchParams;
  const session = await requireSession();
  const { walletContext, websites, walletTemplate, setupProfile, providers } = await getWalletSetupData(
    walletId,
    session.user.id
  );

  const [providerCount, primaryEditRouteCount, ownerInviteCount] = await Promise.all([
    prisma.providerConnection.count({ where: { walletId } }),
    prisma.editRoute.count({
      where: {
        website: { walletId },
        isEnabled: true,
        isPrimary: true
      }
    }),
    prisma.invite.count({
      where: {
        walletId,
        inviteType: "OWNER_HANDOFF"
      }
    })
  ]);

  const steps = [
    {
      title: "Add website details",
      description: "Document the live site, domain, staging environment, and launch details.",
      href: `/app/wallets/${walletContext.id}/websites/new`,
      complete: websites.length > 0,
      summary: websites.length ? `${websites.length} website record${websites.length === 1 ? "" : "s"} added` : "No website added yet"
    },
    {
      title: "Connect the website tools",
      description: "Add hosting, CMS, billing visibility, domains, and other key services.",
      href: `/app/wallets/${walletContext.id}/providers/new`,
      complete: providerCount > 0,
      summary: providerCount ? `${providerCount} connected tool${providerCount === 1 ? "" : "s"} recorded` : "No tools connected yet"
    },
    {
      title: "Set editing paths",
      description: "Define exactly where the owner should go when they need to make changes.",
      href: websites[0]
        ? `/app/wallets/${walletContext.id}/websites/${websites[0].id}`
        : `/app/wallets/${walletContext.id}/websites/new`,
      complete: primaryEditRouteCount > 0,
      summary: primaryEditRouteCount ? `${primaryEditRouteCount} primary edit path${primaryEditRouteCount === 1 ? "" : "s"} ready` : "No primary edit path yet"
    },
    {
      title: "Invite the owner",
      description: "Send the secure ownership invitation and complete handoff with confidence.",
      href: `/app/wallets/${walletContext.id}/handoff`,
      complete: ownerInviteCount > 0,
      summary: ownerInviteCount ? `${ownerInviteCount} owner invite${ownerInviteCount === 1 ? "" : "s"} created` : "No owner invite sent yet"
    }
  ];

  const completedSteps = steps.filter((step) => step.complete).length;
  const providerRecords = await prisma.providerConnection.findMany({
    where: { walletId },
    select: {
      id: true,
      providerName: true,
      category: true,
      displayLabel: true,
      connectedAccountLabel: true,
      status: true,
      healthStatus: true,
      connectionMethod: true,
      syncState: true,
      dashboardUrl: true,
      billingUrl: true,
      editUrl: true,
      supportUrl: true,
      ownerDescription: true,
      metadata: true,
      monthlyCostEstimate: true,
      renewalDate: true,
      lastSyncAt: true,
      lastHealthCheckAt: true
    }
  });
  const intelligence = getWalletIntelligence({
    role: walletContext.role as WalletRole,
    walletId,
    templateSlug: walletTemplate.slug,
    websites: [],
    providers: providerRecords.map((provider) => ({
      id: provider.id,
      name: provider.providerName,
      category: provider.category.toLowerCase() as
        | "hosting"
        | "database"
        | "cms"
        | "domain"
        | "email_forms"
        | "analytics"
        | "payments"
        | "scheduling"
        | "automation"
        | "support"
        | "storage"
        | "auth_identity"
        | "custom",
      label: provider.displayLabel ?? provider.providerName,
      accountLabel: provider.connectedAccountLabel ?? provider.providerName,
      status: provider.status,
      health:
        provider.healthStatus === "HEALTHY"
          ? "healthy"
          : provider.healthStatus === "ATTENTION_NEEDED"
            ? "attention"
            : provider.healthStatus === "ISSUE_DETECTED"
              ? "issue"
              : provider.healthStatus === "DISCONNECTED"
                ? "disconnected"
                : "unknown",
      connectionMethod: provider.connectionMethod.replaceAll("_", " "),
      syncState: provider.syncState,
      dashboardUrl: provider.dashboardUrl ?? "",
      billingUrl: provider.billingUrl ?? undefined,
      editUrl: provider.editUrl ?? undefined,
      supportUrl: provider.supportUrl ?? undefined,
      monthlyCost: Number(provider.monthlyCostEstimate ?? 0),
      renewalDate: provider.renewalDate?.toISOString(),
      ownerDescription: provider.ownerDescription ?? "Connected tool",
      metadata: {}
    })),
    billing: [],
    alerts: [],
    ownerAccepted: ownerInviteCount > 0
  });
  const connectionTargets = buildSetupConnectionTargets({
    walletId,
    setupProfile,
    walletTemplate,
    providers,
    websites
  });
  const answeredConnections = connectionTargets.filter((target) => target.source !== "unknown").length;
  const nextConnectionTarget = pickNextSetupConnectionTarget(connectionTargets);

  return (
    <AppShell
      title="Wallet setup"
      description="Answer the stack questions once, connect what matters, and let RAEYL keep the setup flow moving."
      walletContext={walletContext}
    >
      {saved ? (
        <div className="mb-4 rounded-xl border border-success/30 bg-success/5 p-4 text-sm text-success">
          Setup answers saved. RAEYL refreshed the recommended connection path for this wallet.
        </div>
      ) : null}
      {setupComplete ? (
        <div className="mb-4 rounded-xl border border-success/30 bg-success/5 p-4 text-sm text-success">
          {setupConnected ? `${setupConnected} connected. ` : ""}RAEYL finished the current connection pass and brought you back to the setup rail.
        </div>
      ) : null}
      {formError ? (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {formError}
        </div>
      ) : null}
      <div className="mb-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-foreground">Setup progress</div>
            <p className="mt-1 text-sm text-muted">
              RAEYL now tracks both what is connected and what you have already answered about the stack.
            </p>
          </div>
          <Badge variant={completedSteps === steps.length ? "success" : "warning"}>
            {completedSteps}/{steps.length} complete
          </Badge>
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="space-y-3 py-5">
            <div className="text-sm font-medium text-foreground">{walletTemplate.label}</div>
            <p className="text-sm text-muted">{walletTemplate.developerSummary}</p>
            <p className="text-sm text-muted">{walletTemplate.editRoutingAdvice}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 py-5">
            <div className="text-sm font-medium text-foreground">Setup mode</div>
            <p className="text-sm text-foreground">{getIntentLabel(setupProfile.setupIntent)}</p>
            <p className="text-sm text-muted">{getIntentDescription(setupProfile.setupIntent)}</p>
            <div className="text-xs text-muted">
              {answeredConnections}/{connectionTargets.length} stack answers captured
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="space-y-3 py-5">
            <div className="text-sm font-medium text-foreground">What would make this wallet feel complete</div>
            {intelligence.missingRecommendedCategories.length ? (
              <div className="flex flex-wrap gap-2">
                {intelligence.missingRecommendedCategories.map((category) => (
                  <Badge key={category} variant="neutral">
                    {category.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">
                The core recommended system categories are already represented in this wallet.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 py-5">
            <div className="text-sm font-medium text-foreground">Autopilot next move</div>
            {nextConnectionTarget ? (
              <>
                <p className="text-sm text-muted">
                  {nextConnectionTarget.status === "repair_needed"
                    ? `Repair ${nextConnectionTarget.providerName} so this part of the wallet is trustworthy before handoff.`
                    : nextConnectionTarget.status === "attention_needed"
                      ? `Review ${nextConnectionTarget.providerName} and tighten the details RAEYL flagged for this wallet.`
                      : `Connect ${nextConnectionTarget.providerName} next so RAEYL can keep building the control rail automatically.`}
                </p>
                <Link
                  href={nextConnectionTarget.href ?? `/app/wallets/${walletId}/providers/new`}
                  className="inline-flex text-sm font-medium text-primary"
                >
                  {nextConnectionTarget.actionLabel}
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted">
                Finish the stack answers below and RAEYL will turn them into one-click connection steps.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="py-5">
            <form action={saveWalletSetupProfile} className="space-y-5">
              <input type="hidden" name="walletId" value={walletId} />
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="What are you trying to do with this wallet?"
                  className="md:col-span-2"
                  hint="This shapes the setup language, connection priorities, and what RAEYL emphasizes next."
                >
                  <Select name="setupIntent" defaultValue={setupProfile.setupIntent}>
                    <option value="full-handoff">Prepare a clean handoff</option>
                    <option value="ongoing-management">Keep managing the site</option>
                    <option value="portfolio-ops">Organize a growing portfolio</option>
                    <option value="agency-ops">Standardize agency delivery</option>
                    <option value="owner-control">Give the owner simple control</option>
                  </Select>
                </FormField>
                <FormField label="How often does this website change?">
                  <Select name="updateCadence" defaultValue={setupProfile.updateCadence}>
                    <option value="rarely">Rarely</option>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                  </Select>
                </FormField>
                <FormField label="Setup notes">
                  <Textarea
                    name="notes"
                    rows={3}
                    defaultValue={setupProfile.notes}
                    placeholder="Anything RAEYL should remember about the stack, handoff, or ownership expectations."
                  />
                </FormField>
                {getSetupSlotDefinitions().map((slot) => (
                  <FormField
                    key={slot.key}
                    label={slot.label}
                    hint={slot.helper}
                    className={slot.key === "domainProviderSlug" || slot.key === "hostingProviderSlug" ? "" : ""}
                  >
                    <Select name={slot.key} defaultValue={setupProfile[slot.key] || ""}>
                      <option value="">
                        {slot.optional ? "Not sure yet" : "Choose a provider"}
                      </option>
                      {getProviderOptionsByCategory(slot.category).map((provider) => (
                        <option key={provider.slug} value={provider.slug}>
                          {provider.displayName}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                ))}
              </div>
              <SubmitButton pendingLabel="Saving setup answers...">Save setup answers</SubmitButton>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 py-5">
            <div>
              <div className="text-sm font-medium text-foreground">Why this matters</div>
              <p className="mt-1 text-sm text-muted">
                Once you answer the stack questions, RAEYL can turn them into connect-now steps instead of making you
                remember every service later.
              </p>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="text-sm font-medium text-foreground">Connect and continue</div>
                <p className="mt-1 text-sm text-muted">
                  Each provider link can return to this setup flow after the connection is saved.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="text-sm font-medium text-foreground">Stack memory</div>
                <p className="mt-1 text-sm text-muted">
                  Even before every provider is connected, this wallet becomes the source of truth for what the site uses.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="text-sm font-medium text-foreground">Owner-ready clarity</div>
                <p className="mt-1 text-sm text-muted">
                  The answers here shape the owner language, quick actions, and handoff confidence.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Card>
          <CardContent className="space-y-4 py-5">
            <div>
              <div className="text-sm font-medium text-foreground">Connection plan</div>
              <p className="mt-1 text-sm text-muted">
                Choose the stack once, then let RAEYL walk you through the right providers in the right order.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {connectionTargets.map((target) => (
                <div key={target.key} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-foreground">{target.label}</div>
                    <Badge
                      variant={
                        target.status === "connected"
                          ? "success"
                          : target.status === "repair_needed"
                            ? "danger"
                            : target.status === "ready_to_connect" || target.status === "attention_needed"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {target.status === "connected"
                        ? "Connected"
                        : target.status === "repair_needed"
                          ? "Repair"
                          : target.status === "attention_needed"
                            ? "Review"
                          : target.status === "ready_to_connect"
                          ? "Ready"
                          : "Waiting"}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-foreground">{target.providerName}</div>
                  <p className="mt-1 text-sm text-muted">{target.description}</p>
                  <p className="mt-2 text-xs text-foreground/80">{target.statusDetail}</p>
                  <div className="mt-3 text-xs text-muted">
                    {target.source === "selected"
                      ? "Chosen in setup"
                      : target.source === "recommended"
                        ? "Recommended by the wallet template"
                        : "No provider chosen yet"}
                  </div>
                  <div className="mt-4">
                    {target.status === "connected" && target.href ? (
                      <Link href={target.href} className="text-sm font-medium text-success">
                        {target.actionLabel}
                      </Link>
                    ) : target.href ? (
                      <Link href={target.href} className="text-sm font-medium text-primary">
                        {target.actionLabel}
                      </Link>
                    ) : (
                      <span className="text-sm text-muted">{target.actionLabel}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {steps.map((step, index) => (
          <Link key={step.title} href={step.href}>
            <Card className="transition hover:border-primary/30">
              <CardContent className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{step.title}</CardTitle>
                      <Badge variant={step.complete ? "success" : "neutral"}>
                        {step.complete ? "Done" : "Next"}
                      </Badge>
                    </div>
                    <CardDescription>{step.description}</CardDescription>
                    <p className="text-sm text-muted">{step.summary}</p>
                  </div>
                </div>
                <div className="text-sm text-primary">Open</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
