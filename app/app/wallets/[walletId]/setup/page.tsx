import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/access";
import { getWalletSetupData } from "@/lib/data/wallets";
import { prisma } from "@/lib/prisma";
import { getWalletIntelligence } from "@/lib/services/wallet-intelligence";
import type { WalletRole } from "@/lib/types";

export default async function WalletSetupPage({
  params
}: {
  params: Promise<{ walletId: string }>;
}) {
  const { walletId } = await params;
  const session = await requireSession();
  const { walletContext, websites, walletTemplate } = await getWalletSetupData(walletId, session.user.id);

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

  return (
    <AppShell
      title="Wallet setup"
      description="Move through the setup steps in the same order a polished handoff naturally happens."
      walletContext={walletContext}
    >
      <div className="mb-6 rounded-md border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-foreground">Setup progress</div>
            <p className="mt-1 text-sm text-muted">
              Complete each step once so the owner lands in a wallet that feels finished.
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
