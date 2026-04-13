import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingPage() {
  const steps = [
    "Create the website wallet",
    "Add the live site and staging details",
    "Connect the website tools",
    "Define the editing paths",
    "Invite the owner and complete handoff"
  ];

  return (
    <AppShell
      title="Developer onboarding"
      description="Set up the ownership layer your client will actually rely on after launch."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader className="block space-y-2">
            <SectionHeading
              eyebrow="Get Started"
              title="Set up the wallet your client will actually use"
              description="Move from website setup to connected tools to owner handoff in one clean working flow."
            />
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-4 rounded-md border border-white/10 bg-white/[0.02] p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <p className="text-sm text-foreground">{step}</p>
              </div>
            ))}
            <Link href="/app/wallets/new">
              <Button className="mt-2">Start first wallet</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Partner visibility</CardTitle>
              <CardDescription>
                Referral attribution and post-handoff collaborator mode stay tied to the wallet from the start.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
              <p>Keep ownership clear for the client from day one.</p>
              <p>Stay connected only with the collaborator access you actually want after handoff.</p>
              <p>Track referred client wallets and recurring rewards in the partner dashboard.</p>
            </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
