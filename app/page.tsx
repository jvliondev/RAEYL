import Link from "next/link";

import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { Hero } from "@/components/marketing/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "One place for everything your website needs",
    description:
      "RAEYL gives owners a clear view of the tools behind the website, the costs attached to them, and the right place to go when work needs to happen."
  },
  {
    title: "Built for handoff, not just setup",
    description:
      "Developers and agencies can hand over websites with a clean ownership layer instead of a pile of links and notes."
  },
  {
    title: "Simple on the surface, powerful underneath",
    description:
      "Owners see calm, business-friendly guidance while the underlying architecture still respects real infrastructure."
  }
];

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <main>
        <Hero />
        <section className="py-16">
          <div className="page-shell grid gap-5 lg:grid-cols-3">
            {sections.map((section) => (
              <Card key={section.title}>
                <CardContent className="space-y-3">
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        <section className="py-16">
          <div className="page-shell rounded-xl border border-white/10 bg-white/[0.03] p-8 sm:p-12">
            <div className="max-w-3xl space-y-4">
              <p className="eyebrow">Ownership Clarity</p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Give every client a website they can actually understand after launch.
              </h2>
              <p className="text-base text-muted">
                RAEYL turns a finished stack into a premium ownership experience:
                connected systems, billing visibility, editing paths, handoff history,
                and access management in one control center.
              </p>
              <div className="flex gap-3 pt-2">
                <Link href="/get-started">
                  <Button>Start building</Button>
                </Link>
                <Link href="/for-owners">
                  <Button variant="secondary">See owner experience</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
