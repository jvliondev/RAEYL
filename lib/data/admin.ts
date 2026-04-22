import { MembershipStatus, WalletStatus, BillingStatus, ReferralStatus } from "@prisma/client/index";

import { prisma } from "@/lib/prisma";

export async function getAdminStats() {
  const [
    totalWallets,
    activeSubscriptions,
    openSupportCount,
    criticalAlertCount,
    totalUsers,
    walletsInSetup,
    walletsActive
  ] = await Promise.all([
    prisma.wallet.count(),
    prisma.walletSubscription.count({ where: { status: { in: [BillingStatus.ACTIVE, BillingStatus.TRIALING] } } }),
    prisma.supportRequest.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.alert.count({ where: { severity: "CRITICAL", status: "OPEN" } }),
    prisma.user.count(),
    prisma.wallet.count({ where: { status: WalletStatus.IN_SETUP } }),
    prisma.wallet.count({ where: { status: WalletStatus.ACTIVE } })
  ]);

  return {
    totalWallets,
    activeSubscriptions,
    openSupportCount,
    criticalAlertCount,
    totalUsers,
    walletsInSetup,
    walletsActive
  };
}

export async function getAdminUsersData() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      memberships: {
        where: { status: MembershipStatus.ACTIVE },
        select: { walletId: true, role: true, isPrimaryOwner: true, isPrimaryDeveloper: true }
      },
      _count: {
        select: { memberships: true }
      }
    }
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name ?? u.email,
    email: u.email,
    status: u.status,
    type: u.type,
    walletCount: u._count.memberships,
    ownedWallets: u.memberships.filter((m) => m.isPrimaryOwner).length,
    developedWallets: u.memberships.filter((m) => m.isPrimaryDeveloper).length,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null
  }));
}

export async function getAdminWalletsData() {
  const wallets = await prisma.wallet.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      _count: {
        select: { memberships: true, providers: true, websites: true }
      },
      subscriptions: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { status: true, planKey: true }
      },
      createdBy: {
        select: { name: true, email: true }
      }
    }
  });

  return wallets.map((w) => ({
    id: w.id,
    name: w.name,
    businessName: w.businessName,
    status: w.status,
    handoffStatus: w.handoffStatus,
    planTier: w.planTier ?? "None",
    memberCount: w._count.memberships,
    providerCount: w._count.providers,
    websiteCount: w._count.websites,
    subscription: w.subscriptions[0] ?? null,
    createdBy: w.createdBy ? (w.createdBy.name ?? w.createdBy.email) : "Unknown",
    createdAt: w.createdAt.toISOString()
  }));
}

export async function getAdminSubscriptionsData() {
  const subs = await prisma.walletSubscription.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      wallet: {
        select: { name: true, businessName: true }
      }
    }
  });

  return subs.map((s) => ({
    id: s.id,
    walletId: s.walletId,
    walletName: s.wallet.name,
    businessName: s.wallet.businessName,
    planKey: s.planKey,
    status: s.status,
    provider: s.provider,
    stripeSubscriptionId: s.stripeSubscriptionId,
    currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: s.cancelAtPeriodEnd,
    startedAt: s.startedAt?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString()
  }));
}

export async function getAdminReferralsData() {
  const referrals = await prisma.referral.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      wallet: { select: { name: true, businessName: true } },
      partnerAccount: {
        select: { displayName: true, status: true, commissionRateBps: true }
      }
    }
  });

  return referrals.map((r) => ({
    id: r.id,
    walletName: r.wallet.name,
    businessName: r.wallet.businessName,
    partnerName: r.partnerAccount.displayName,
    partnerStatus: r.partnerAccount.status,
    commissionRateBps: r.commissionRateBps,
    status: r.status,
    activatedAt: r.activatedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString()
  }));
}

export async function getPartnerDashboardData(userId: string) {
  const partner = await prisma.partnerAccount.findUnique({
    where: { userId },
    include: {
      referrals: {
        where: { status: { in: [ReferralStatus.ACTIVE, ReferralStatus.PENDING] } },
        include: {
          wallet: {
            select: {
              name: true,
              businessName: true,
              planTier: true,
              handoffStatus: true,
              subscriptions: {
                take: 1,
                orderBy: { createdAt: "desc" },
                select: { status: true }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      },
      payouts: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  });

  if (!partner) return null;

  const activeReferrals = partner.referrals.filter((r) => r.status === ReferralStatus.ACTIVE);
  const pendingPayout = partner.payouts.find((p) => p.status === "PENDING");
  const planValues: Record<string, number> = {
    Starter: 39,
    Growth: 99,
    Scale: 199
  };

  const estimatedMonthlyPayout = activeReferrals.reduce((sum, r) => {
    const baseAmount = planValues[r.wallet.planTier ?? "Starter"] ?? 39;
    return sum + (baseAmount * r.commissionRateBps) / 10000;
  }, 0);

  const liveWallets = activeReferrals.filter((r) => r.wallet.subscriptions[0]?.status === BillingStatus.ACTIVE).length;
  const handoffCompleted = activeReferrals.filter((r) => r.wallet.handoffStatus === "COMPLETED").length;

  return {
    partner: {
      id: partner.id,
      displayName: partner.displayName,
      status: partner.status,
      commissionRateBps: partner.commissionRateBps
    },
    stats: {
      activeReferrals: activeReferrals.length,
      totalReferrals: partner.referrals.length,
      estimatedMonthlyPayout,
      payoutStatus: pendingPayout?.status ?? "No pending payout",
      liveWallets,
      handoffCompleted
    },
    referrals: partner.referrals.map((r) => ({
      id: r.id,
      walletName: r.wallet.name,
      businessName: r.wallet.businessName,
      planTier: r.wallet.planTier ?? "Starter",
      status: r.status,
      commissionRateBps: r.commissionRateBps,
      activatedAt: r.activatedAt?.toISOString() ?? null,
      handoffStatus: r.wallet.handoffStatus,
      subscriptionStatus: r.wallet.subscriptions[0]?.status ?? null
    })),
    payouts: partner.payouts.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      periodStart: p.periodStart.toISOString(),
      periodEnd: p.periodEnd.toISOString(),
      paidAt: p.paidAt?.toISOString() ?? null
    }))
  };
}
