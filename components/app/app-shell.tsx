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

import { logOut } from "@/lib/actions/auth";

import { requireSession } from "@/lib/auth/access";
import { hasCapability, type Capability } from "@/lib/auth/permissions";
import { listWalletsForUser } from "@/lib/data/wallets";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

function buildNav(walletId: string, websiteId?: string) {
  return [
    { href: `/app/wallets/${walletId}`, label: "Overview", icon: Gauge, capability: "wallet.read" as Capability },
    {
      href: websiteId ? `/app/wallets/${walletId}/websites/${websiteId}` : `/app/wallets/${walletId}`,
      label: "Website",
      icon: Workflow,
      capability: "wallet.read" as Capability
    },
    {
      href: `/app/wallets/${walletId}/providers`,
      label: "Connected tools",
      icon: PanelLeft,
      capability: "provider.read" as Capability
    },
    {
      href: `/app/wallets/${walletId}/billing`,
      label: "Costs and billing",
      icon: CreditCard,
      capability: "billing.read" as Capability
    },
    {
      href: `/app/wallets/${walletId}/access`,
      label: "People and access",
      icon: Shield,
      capability: "access.manage" as Capability
    },
    {
      href: `/app/wallets/${walletId}/handoff`,
      label: "Handoff",
      icon: Handshake,
      capability: "handoff.manage" as Capability
    },
    { href: `/app/wallets/${walletId}/alerts`, label: "Attention", icon: Siren, capability: "wallet.read" as Capability },
    {
      href: `/app/wallets/${walletId}/activity`,
      label: "Timeline",
      icon: ClipboardList,
      capability: "wallet.read" as Capability
    },
    { href: `/app/wallets/${walletId}/support`, label: "Support", icon: LifeBuoy, capability: "support.read" as Capability },
    {
      href: `/app/wallets/${walletId}/settings`,
      label: "Settings",
      icon: Settings2,
      capability: "settings.read" as Capability
    }
  ];
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
    select: {
      name: true,
      email: true,
      type: true
    }
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
    ? buildNav(wallet.id, wallet.websiteId).filter((item) =>
        item.capability && wallet.role ? hasCapability(wallet.role, item.capability) : true
      )
    : [];
  const walletTrail = wallet.id ? "Wallet" : "Platform";

  return (
    <div className="min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-white/5 bg-black/10 lg:block">
          <div className="sticky top-0 flex min-h-screen flex-col p-5">
            <Link href="/" className="mb-8 text-sm font-semibold tracking-[0.22em] text-foreground">
              RAEYL
            </Link>
            {wallet.id ? (
              <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted">Current wallet</div>
                <div className="mt-2 font-medium">{wallet.businessName}</div>
                <div className="text-sm text-muted">{wallet.planTier} plan • ownership wallet</div>
              </div>
            ) : (
              <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted">Platform</div>
                <div className="mt-2 font-medium">RAEYL admin</div>
                <div className="text-sm text-muted">Operational visibility and control</div>
              </div>
            )}
            <nav className="space-y-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition hover:bg-white/[0.05] hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <div className="soft-divider mt-4 pt-4">
                <Link
                  href="/app/notifications"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition hover:bg-white/[0.05] hover:text-foreground"
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </Link>
                <Link
                  href="/app/wallets"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition hover:bg-white/[0.05] hover:text-foreground"
                >
                  <PanelLeft className="h-4 w-4" />
                  All wallets
                </Link>
                {viewer?.type === "ADMIN" ? (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition hover:bg-white/[0.05] hover:text-foreground"
                  >
                    <Shield className="h-4 w-4" />
                    Admin console
                  </Link>
                ) : null}
                <Link
                  href="/app/settings/account"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition hover:bg-white/[0.05] hover:text-foreground"
                >
                  <Settings2 className="h-4 w-4" />
                  Account settings
                </Link>
                <form action={logOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition hover:bg-white/[0.05] hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </form>
              </div>
            </nav>
            {wallets.length > 1 ? (
              <div className="soft-divider mt-6 pt-4">
                <div className="mb-2 px-3 text-xs uppercase tracking-[0.16em] text-muted">Switch wallet</div>
                <div className="space-y-1">
                  {wallets.slice(0, 6).map((item) => (
                    <Link
                      key={item.id}
                      href={`/app/wallets/${item.id}`}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm text-muted transition hover:bg-white/[0.05] hover:text-foreground",
                        item.id === wallet.id ? "bg-white/[0.05] text-foreground" : ""
                      )}
                    >
                      <div>{item.businessName}</div>
                      <div className="text-xs text-muted">{item.role}</div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </aside>
        <main className="min-w-0">
          <header className="border-b border-white/5 bg-background/70 backdrop-blur-xl">
            <div className="page-shell flex min-h-20 items-center justify-between gap-4 py-4">
              <div>
                <div className="mb-1 text-xs uppercase tracking-[0.16em] text-muted">
                  {walletTrail}
                  {wallet.id ? ` • ${wallet.businessName}` : ""}
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/app/notifications"
                  className="rounded-md border border-white/10 bg-white/[0.03] p-2 text-muted transition hover:text-foreground"
                >
                  <Bell className="h-4 w-4" />
                </Link>
                <Link
                  href={wallet.id ? `/app/wallets/${wallet.id}` : "/app/wallets"}
                  className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-muted transition hover:text-foreground"
                >
                  {wallet.id ? "Wallet home" : "Wallets"}
                </Link>
                <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-muted">
                  <Link href="/app/settings/account" className="hover:text-foreground transition">
                    {wallet.userName}
                  </Link>
                  <form action={logOut}>
                    <button
                      type="submit"
                      title="Sign out"
                      className="flex items-center text-muted hover:text-foreground transition"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </header>
          <div className="page-shell py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
