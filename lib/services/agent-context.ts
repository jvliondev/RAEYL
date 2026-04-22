import { prisma } from "@/lib/prisma";
import { MembershipStatus } from "@prisma/client/index";

export type WalletAgentContext = {
  walletId: string;
  businessName: string;
  role: string;
  planTier: string;
  websites: {
    id: string;
    name: string;
    productionUrl: string | null;
    primaryDomain: string | null;
    framework: string | null;
    editRoutes: { label: string; destinationUrl: string; description: string | null; isPrimary: boolean }[];
  }[];
  providers: {
    name: string;
    displayLabel: string | null;
    category: string;
    health: string;
    dashboardUrl: string | null;
    billingUrl: string | null;
    ownerDescription: string | null;
    monthlyCost: number | null;
    renewalDate: Date | null;
  }[];
  billing: {
    totalMonthlyEstimate: number;
    records: { label: string; amount: number; cadence: string; status: string; renewalDate: Date | null }[];
  };
  openAlerts: { title: string; message: string; severity: string; providerName: string | null }[];
  handoffStatus: string | null;
};

export async function buildWalletAgentContext(
  walletId: string,
  userId: string
): Promise<WalletAgentContext | null> {
  const membership = await prisma.walletMembership.findFirst({
    where: { walletId, userId, status: MembershipStatus.ACTIVE },
    select: { role: true }
  });

  if (!membership) return null;

  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    include: {
      websites: {
        select: {
          id: true,
          name: true,
          productionUrl: true,
          primaryDomain: true,
          framework: true,
          editRoutes: {
            where: { isEnabled: true },
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            select: {
              label: true,
              destinationUrl: true,
              description: true,
              isPrimary: true
            }
          }
        }
      },
      providers: {
        where: { status: { not: "ARCHIVED" } },
        select: {
          providerName: true,
          displayLabel: true,
          category: true,
          healthStatus: true,
          dashboardUrl: true,
          billingUrl: true,
          ownerDescription: true,
          monthlyCostEstimate: true,
          renewalDate: true
        }
      },
      billingRecords: {
        where: { status: { not: "CANCELED" } },
        select: {
          label: true,
          amount: true,
          cadence: true,
          status: true,
          renewalDate: true
        }
      },
      alerts: {
        where: { status: { in: ["OPEN", "SNOOZED"] } },
        select: {
          title: true,
          message: true,
          severity: true,
          providerConnection: { select: { providerName: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  });

  if (!wallet) return null;

  const totalMonthly = wallet.billingRecords.reduce(
    (sum: number, r: { amount: { toString(): string } }) => sum + Number(r.amount),
    0
  );

  return {
    walletId: wallet.id,
    businessName: wallet.businessName,
    role: membership.role,
    planTier: wallet.planTier ?? "Standard",
    websites: wallet.websites.map((w) => ({
      id: w.id,
      name: w.name,
      productionUrl: w.productionUrl,
      primaryDomain: w.primaryDomain,
      framework: w.framework,
      editRoutes: w.editRoutes
    })),
    providers: wallet.providers.map((p) => ({
      name: p.providerName,
      displayLabel: p.displayLabel,
      category: p.category,
      health: p.healthStatus ?? "UNKNOWN",
      dashboardUrl: p.dashboardUrl,
      billingUrl: p.billingUrl,
      ownerDescription: p.ownerDescription,
      monthlyCost: p.monthlyCostEstimate ? Number(p.monthlyCostEstimate) : null,
      renewalDate: p.renewalDate
    })),
    billing: {
      totalMonthlyEstimate: totalMonthly,
      records: wallet.billingRecords.map((r) => ({
        label: r.label,
        amount: Number(r.amount),
        cadence: r.cadence,
        status: r.status,
        renewalDate: r.renewalDate
      }))
    },
    openAlerts: wallet.alerts.map((a) => ({
      title: a.title,
      message: a.message,
      severity: a.severity,
      providerName: a.providerConnection?.providerName ?? null
    })),
    handoffStatus: wallet.handoffStatus
  };
}

export function formatContextForPrompt(ctx: WalletAgentContext): string {
  const lines: string[] = [
    `WALLET: ${ctx.businessName} (${ctx.planTier} plan)`,
    `USER ROLE: ${ctx.role}`,
    ``
  ];

  if (ctx.websites.length) {
    lines.push("WEBSITES:");
    for (const w of ctx.websites) {
      lines.push(`  - ${w.name}${w.productionUrl ? ` (${w.productionUrl})` : ""}${w.framework ? ` — ${w.framework}` : ""}`);
      if (w.editRoutes.length) {
        for (const r of w.editRoutes) {
          lines.push(`    • ${r.label}${r.isPrimary ? " [primary edit path]" : ""}: ${r.destinationUrl}${r.description ? ` — ${r.description}` : ""}`);
        }
      }
    }
    lines.push("");
  }

  if (ctx.providers.length) {
    lines.push("CONNECTED TOOLS:");
    for (const p of ctx.providers) {
      const name = p.displayLabel ?? p.name;
      const cost = p.monthlyCost ? ` (~$${p.monthlyCost}/mo)` : "";
      const health = p.health !== "HEALTHY" && p.health !== "UNKNOWN" ? ` [${p.health}]` : "";
      lines.push(`  - ${name} (${p.category})${cost}${health}`);
      if (p.ownerDescription) lines.push(`    ${p.ownerDescription}`);
      if (p.dashboardUrl) lines.push(`    Dashboard: ${p.dashboardUrl}`);
    }
    lines.push("");
  }

  if (ctx.billing.totalMonthlyEstimate > 0) {
    lines.push(`BILLING: ~$${ctx.billing.totalMonthlyEstimate.toFixed(2)}/mo estimated total`);
    lines.push("");
  }

  if (ctx.openAlerts.length) {
    lines.push("OPEN ALERTS:");
    for (const a of ctx.openAlerts) {
      lines.push(`  - [${a.severity}] ${a.title}: ${a.message}${a.providerName ? ` (${a.providerName})` : ""}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
