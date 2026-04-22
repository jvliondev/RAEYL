import Link from "next/link";
import {
  Bell,
  ClipboardList,
  CreditCard,
  Gauge,
  Handshake,
  LifeBuoy,
  LogOut,
  PanelLeft,
  Settings2,
  Shield,
  Siren,
  Workflow
} from "lucide-react";

import { FloatingChat } from "@/components/app/floating-chat";
import { NavLink } from "@/components/app/nav-link";
import { RaeylLogo } from "@/components/ui/raeyl-logo";
import { logOut } from "@/lib/actions/auth";
import { requireSession } from "@/lib/auth/access";
import { hasCapability, type Capability } from "@/lib/auth/permissions";
import { listWalletsForUser } from "@/lib/data/wallets";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

function buildNav(walletId: string, role?: string, websiteId?: string) {
  const isOwner = role === "wallet_owner";
  const isDeveloper = role === "developer";
  const isBillingManager = role === "billing_manager";

  const items = [
    { href: `/app/wallets/${walletId}`, label: "Overview", icon: Gauge, capability: "wallet.read" as Capability },
    {
      href: websiteId ? `/app/wallets/${walletId}/websites/${websiteId}` : `/app/wallets/${walletId}`,
      label: isOwner ? "Website details" : "Website",
      icon: Workflow,
      capability: "wallet.read" as Capability
    },
    {
      href: `/app/wallets/${walletId}/providers`,
      label: isOwner ? "Website services" : "Connected tools",
      icon: PanelLeft,
      capability: "provider.read" as Capability
    },
    {
      href: `/app/wallets/${walletId}/billing`,
      label: isBillingManager ? "Billing" : "Costs & billing",
      icon: CreditCard,
      capability: "billing.read" as Capability
    },
    {
      href: `/app/wallets/${walletId}/access`,
      label: isOwner ? "People & access" : "Team access",
      icon: Shield,
      capability: "access.manage" as Capability
    },
    {
      href: `/app/wallets/${walletId}/handoff`,
      label: isDeveloper ? "Handoff" : "Ownership handoff",
      icon: Handshake,
      capability: "handoff.manage" as Capability
    },
    {
      href: `/app/wallets/${walletId}/alerts`,
      label: isOwner ? "What needs attention" : "Alerts",
      icon: Siren,
      capability: "wallet.read" as Capability
    },
    {
      href: `/app/wallets/${walletId}/activity`,
      label: isOwner ? "Recent activity" : "Activity",
      icon: ClipboardList,
      capability: "wallet.read" as Capability
    },
    {
      href: `/app/wallets/${walletId}/support`,
      label: "Support",
      icon: LifeBuoy,
      capability: "support.read" as Capability
    },
    {
      href: `/app/wallets/${walletId}/settings`,
      label: "Settings",
      icon: Settings2,
      capability: "settings.read" as Capability
    }
  ];

  return isOwner ? items.filter((item) => item.href !== `/app/wallets/${walletId}/handoff`) : items;
}

export async function AppShell({
  children,
  title,
  description,
  walletContext
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  walletContext?: {
    id?: string;
    businessName?: string;
    planTier?: string;
    websiteId?: string;
    userName?: string;
    role?: string;
  };
}) {
  const session = await requireSession();
  const viewer = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, type: true }
  });
  const wallets = await listWalletsForUser(session.user.id);

  const wallet = {
    id: walletContext?.id,
    businessName: walletContext?.businessName ?? "RAEYL",
    planTier: walletContext?.planTier ?? "Platform",
    websiteId: walletContext?.websiteId,
    userName: walletContext?.userName ?? viewer?.name ?? viewer?.email ?? "Signed in",
    role: walletContext?.role
  };

  const nav = wallet.id
    ? buildNav(wallet.id, wallet.role, wallet.websiteId).filter((item) =>
        item.capability && wallet.role ? hasCapability(wallet.role, item.capability) : true
      )
    : [];

  const walletTrail = wallet.id ? "Wallet" : "Workspace";
  const roleLabel = wallet.role
    ? wallet.role.replace(/_/g, " ")
    : null;

  // User initials for avatar
  const displayName = viewer?.name ?? viewer?.email ?? "U";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[268px_1fr]">

        {/* ── SIDEBAR ─────────────────────────────────────── */}
        <aside className="hidden sidebar-surface lg:flex lg:flex-col">
          <div className="sticky top-0 flex min-h-screen flex-col px-4 py-5">

            {/* Logo */}
            <Link href="/" className="mb-6 flex items-center px-2">
              <RaeylLogo markClassName="h-[18px]" />
            </Link>

            {/* Wallet context card */}
            {wallet.id ? (
              <div
                className="mb-5 rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-3.5"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
              >
                <div className="app-eyebrow mb-1.5">Active wallet</div>
                <div className="truncate text-[14px] font-semibold leading-tight text-white/90">
                  {wallet.businessName}
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[10px] font-semibold text-white/55">
                    {wallet.planTier}
                  </span>
                  {roleLabel ? (
                    <span className="text-[10px] text-white/35">· {roleLabel}</span>
                  ) : null}
                </div>
              </div>
            ) : (
              <div
                className="mb-5 rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-3.5"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
              >
                <div className="app-eyebrow mb-1.5">Workspace</div>
                <div className="text-[14px] font-semibold text-white/90">RAEYL workspace</div>
                <div className="mt-1 text-[11px] text-white/35">Client wallets and setup rails</div>
              </div>
            )}

            {/* Primary nav */}
            <div className="mb-1">
              <p className="app-eyebrow mb-2 px-2">Navigation</p>
            </div>
            <nav className="space-y-0.5">
              {nav.map((item, idx) => (
                <NavLink key={item.href} href={item.href} exact={idx === 0}>
                  <item.icon className="h-[15px] w-[15px] flex-shrink-0 opacity-80" strokeWidth={1.6} />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Divider */}
            <div className="chrome-divider my-4" />

            {/* Secondary nav */}
            <nav className="space-y-0.5">
              <NavLink href="/app/notifications">
                <Bell className="h-[15px] w-[15px] flex-shrink-0 opacity-80" strokeWidth={1.6} />
                Notifications
              </NavLink>
              <NavLink href="/app/wallets" exact>
                <PanelLeft className="h-[15px] w-[15px] flex-shrink-0 opacity-80" strokeWidth={1.6} />
                Workspace
              </NavLink>
              {viewer?.type === "ADMIN" ? (
                <NavLink href="/admin">
                  <Shield className="h-[15px] w-[15px] flex-shrink-0 opacity-80" strokeWidth={1.6} />
                  Admin console
                </NavLink>
              ) : null}
              <NavLink href="/app/settings/account">
                <Settings2 className="h-[15px] w-[15px] flex-shrink-0 opacity-80" strokeWidth={1.6} />
                Account settings
              </NavLink>
            </nav>

            {/* Switch wallet */}
            {wallets.length > 1 ? (
              <>
                <div className="chrome-divider my-4" />
                <div className="mb-1.5">
                  <p className="app-eyebrow px-2">Switch wallet</p>
                </div>
                <div className="space-y-0.5">
                  {wallets.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      href={`/app/wallets/${item.id}`}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-[13px] transition-all duration-150",
                        item.id === wallet.id
                          ? "bg-white/[0.07] text-white/90 font-medium"
                          : "text-white/45 hover:bg-white/[0.04] hover:text-white/75"
                      )}
                    >
                      <div className="truncate leading-tight">{item.businessName}</div>
                      <div className="text-[11px] text-white/30 capitalize">{item.role?.replace(/_/g, " ")}</div>
                    </Link>
                  ))}
                </div>
              </>
            ) : null}

            {/* Spacer */}
            <div className="flex-1" />

            {/* User profile row */}
            <div className="chrome-divider mb-3" />
            <div className="flex items-center gap-2.5 px-2">
              {/* Avatar */}
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/50 to-cyan-500/30 text-[11px] font-bold text-white/80 ring-1 ring-white/10">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium text-white/65">{displayName}</div>
              </div>
              <form action={logOut}>
                <button
                  type="submit"
                  title="Sign out"
                  className="rounded-md p-1.5 text-white/30 transition hover:bg-white/[0.05] hover:text-white/65"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* ── MAIN ────────────────────────────────────────── */}
        <main className="min-w-0 flex flex-col">

          {/* Top header */}
          <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl">
            <div className="page-shell flex min-h-[68px] items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                {/* Breadcrumb */}
                <div className="mb-0.5 flex items-center gap-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/30">
                    {walletTrail}
                  </span>
                  {wallet.id ? (
                    <>
                      <span className="text-[11px] text-white/20">·</span>
                      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/40 truncate">
                        {wallet.businessName}
                      </span>
                    </>
                  ) : null}
                </div>
                <h1 className="app-page-title text-[22px] truncate">{title}</h1>
                {description ? (
                  <p className="mt-0.5 text-[13px] leading-5 text-white/45 truncate">{description}</p>
                ) : null}
              </div>

              {/* Header controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href="/app/notifications"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/40 transition-all hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white/70"
                >
                  <Bell className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={wallet.id ? `/app/wallets/${wallet.id}` : "/app/wallets"}
                  className="flex h-8 items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-[12px] font-medium text-white/50 transition-all hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white/80"
                >
                  {wallet.id ? "Wallet home" : "Workspace"}
                </Link>
                <div className="flex h-8 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3">
                  <Link
                    href="/app/settings/account"
                    className="text-[12px] font-medium text-white/55 transition-colors hover:text-white/85 max-w-[140px] truncate"
                  >
                    {wallet.userName}
                  </Link>
                  <form action={logOut}>
                    <button
                      type="submit"
                      title="Sign out"
                      className="flex items-center text-white/30 transition hover:text-white/65"
                    >
                      <LogOut className="h-3 w-3" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </header>

          <div className="page-shell flex-1 py-8">{children}</div>
        </main>
      </div>

      {wallet.id ? <FloatingChat walletId={wallet.id} /> : null}
    </div>
  );
}
