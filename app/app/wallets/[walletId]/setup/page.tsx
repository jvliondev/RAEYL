import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/access";
import { getWalletSetupData } from "@/lib/data/wallets";

export default async function WalletSetupPage({
  params
}: {
  params: Promise<{ walletId: string }>;
}) {
  const { walletId } = await params;
  const session = await requireSession();
  const { walletContext, websites } = await getWalletSetupData(walletId, session.user.id);

  const steps = [
    {
      title: "Add website details",
      description: "Document the live site, domain, staging environment, and launch details.",
      href: `/app/wallets/${walletContext.id}/websites/new`
    },
    {
      title: "Connect the website tools",
      description: "Add hosting, CMS, billing visibility, domains, and other key services.",
      href: `/app/wallets/${walletContext.id}/providers/new`
    },
    {
      title: "Set editing paths",
      description: "Define exactly where the owner should go when they need to make changes.",
      href: websites[0]
        ? `/app/wallets/${walletContext.id}/websites/${websites[0].id}`
        : `/app/wallets/${walletContext.id}/websites/new`
    },
    {
      title: "Invite the owner",
      description: "Send the secure ownership invitation and complete handoff with confidence.",
      href: `/app/wallets/${walletContext.id}/handoff`
    }
  ];

  return (
    <AppShell
      title="Wallet setup"
      description="Move through the setup steps in the same order a polished handoff naturally happens."
      walletContext={walletContext}
    >
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
                    <CardTitle>{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
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
