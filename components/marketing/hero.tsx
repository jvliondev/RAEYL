import Link from "next/link";
import { ArrowRight, ShieldCheck, WalletCards, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

const quickStats = [
  {
    icon: WalletCards,
    title: "One place for ownership",
    description: "See the website, the tools behind it, and who controls what."
  },
  {
    icon: Workflow,
    title: "Clear edit routing",
    description: "Open the right content tool without guessing."
  },
  {
    icon: ShieldCheck,
    title: "Confidence after handoff",
    description: "Know what is connected, what it costs, and what needs attention."
  }
];

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="page-shell grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="eyebrow">Website Ownership Wallet</p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              One calm control center for everything your website needs.
            </h1>
            <p className="max-w-2xl text-lg text-muted sm:text-xl">
              RAEYL gives business owners one clear place to understand their website,
              open the right tools, review costs, manage access, and move forward with
              confidence after handoff.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/get-started">
              <Button className="gap-2">
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/product">
              <Button variant="secondary">Explore product</Button>
            </Link>
          </div>
        </div>
        <Card className="relative overflow-hidden p-0">
          <div className="grid bg-grid bg-[size:36px_36px] p-6">
            <div className="mb-6 rounded-lg border border-white/10 bg-background/80 p-4">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted">Evergreen Dental Wallet</div>
                  <div className="text-lg font-semibold">Your website control center</div>
                </div>
                <div className="rounded-md bg-warning/15 px-2 py-1 text-xs font-medium text-warning">
                  2 items need review
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="bg-white/[0.025]">
                  <CardTitle>Website status</CardTitle>
                  <CardDescription>Healthy</CardDescription>
                </Card>
                <Card className="bg-white/[0.025]">
                  <CardTitle>Monthly website cost</CardTitle>
                  <CardDescription>$518 across active tools</CardDescription>
                </Card>
              </div>
            </div>
            <div className="grid gap-3">
              {quickStats.map((item) => (
                <Card key={item.title} className="bg-white/[0.025]">
                  <CardContent className="flex items-start gap-4">
                    <div className="rounded-md bg-primary/12 p-2 text-primary">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
