import Link from "next/link";
import { ArrowRight, Code2, FileText, Handshake, Zap } from "lucide-react";

import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { Button } from "@/components/ui/button";

const phases = [
  {
    n: "01",
    icon: Code2,
    phase: "Build",
    headline: "Create the wallet.",
    description:
      "The website is finished on the tools your team already chose. Now you create a wallet — the ownership record that explains and connects everything the site runs on. Add the business name, site URLs, and tech context that makes handoff feel intentional.",
    accent: "card-accent-purple",
    iconClass: "text-violet-400",
    iconBgClass: "border-violet-500/25 bg-violet-500/[0.07]",
    numClass: "text-violet-500/35",
    details: [
      "Business name and website URLs",
      "Deployment environment notes",
      "Template matching for stack type",
      "Internal tech context"
    ]
  },
  {
    n: "02",
    icon: Zap,
    phase: "Connect",
    headline: "Connect every service.",
    description:
      "Link hosting, CMS, domain registrar, payment processor, email, analytics — every tool behind the site. Use OAuth for live verification where supported, or add manual records for anything else. Each gets an owner-friendly explanation you write once and reuse.",
    accent: "card-accent-cyan",
    iconClass: "text-cyan-400",
    iconBgClass: "border-cyan-500/25 bg-cyan-500/[0.07]",
    numClass: "text-cyan-500/35",
    details: [
      "OAuth + API token connections",
      "Manual records for any service",
      "Owner-readable descriptions",
      "Billing amounts and renewal dates"
    ]
  },
  {
    n: "03",
    icon: FileText,
    phase: "Configure",
    headline: "Set up the edit paths.",
    description:
      "Define exactly where the owner goes when they need to update content — one primary path, and as many additional routes as the site needs. No more 'which dashboard was it again?' — just a direct link to the right place, labeled for the owner.",
    accent: "card-accent-amber",
    iconClass: "text-amber-400",
    iconBgClass: "border-amber-500/25 bg-amber-500/[0.07]",
    numClass: "text-amber-500/35",
    details: [
      "One primary edit path (homepage action)",
      "Named routes for specific content areas",
      "Role-based path visibility",
      "CMS setup notes and context"
    ]
  },
  {
    n: "04",
    icon: Handshake,
    phase: "Hand off",
    headline: "Invite the owner.",
    description:
      "Send a secure, one-time invite to the business owner. They click once and land in their own clean view of the wallet — no technical language, no passwords in email, no Notion doc required. The relationship continues, just with proper access control in place.",
    accent: "card-accent-emerald",
    iconClass: "text-emerald-400",
    iconBgClass: "border-emerald-500/25 bg-emerald-500/[0.07]",
    numClass: "text-emerald-500/35",
    details: [
      "Secure invite token (single-use)",
      "Owner lands in their own clean view",
      "Developer keeps collaborator access",
      "Handoff status tracked and logged"
    ]
  }
];

const roles = [
  {
    role: "Developer or agency",
    description:
      "You create and manage the wallet. You connect providers, set up edit paths, and control the handoff. RAEYL is where your delivery becomes a professional, documented handoff instead of a spreadsheet.",
    accent: "card-accent-purple",
    iconClass: "text-violet-400"
  },
  {
    role: "Business owner",
    description:
      "You receive access via a secure invite. Your view is clean, plain-language, and focused on what you actually need — not the technical infrastructure. You can always find what you're paying for and where to go to make changes.",
    accent: "card-accent-cyan",
    iconClass: "text-cyan-400"
  },
  {
    role: "Collaborators",
    description:
      "Contractors, team members, or future developers can be added to the wallet with specific roles — billing-only, view-only, or full developer access. Every permission change is logged.",
    accent: "card-accent-amber",
    iconClass: "text-amber-400"
  }
];

export default function HowItWorksPage() {
  return (
    <>
      <MarketingHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="pointer-events-none absolute inset-0 hero-radial" />
          <div className="pointer-events-none absolute inset-0 bg-dot-grid bg-dot-28 opacity-[0.25]" />
          <div className="page-shell relative">
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">How it works</p>
              <h1 className="display-heading text-5xl text-white sm:text-6xl xl:text-7xl">
                Build to handoff
                <br />
                <span className="silver-text">in four steps.</span>
              </h1>
              <div className="velocity-line mt-5" />
              <p className="mt-6 text-lg leading-8 text-white/50">
                RAEYL is a structured handoff layer that turns a finished website stack
                into a calm, trusted control center — for both the developer and the
                business owner.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/get-started">
                  <Button size="lg" className="gap-2">
                    Start a wallet <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/product">
                  <Button variant="secondary" size="lg">See all features</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Phase breakdown */}
        <section className="border-t border-white/[0.05] pb-24">
          <div className="page-shell space-y-5 pt-16">
            {phases.map((p) => (
              <div key={p.n} className={`surface ${p.accent} overflow-hidden rounded-2xl`}>
                <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
                  <div className="p-8 lg:p-10">
                    <div className="mb-5 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`inline-flex rounded-xl border p-2.5 ${p.iconBgClass}`}>
                          <p.icon className={`h-4 w-4 ${p.iconClass}`} strokeWidth={1.5} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                          Phase {p.phase}
                        </span>
                      </div>
                      <span className={`font-display text-4xl font-bold ${p.numClass}`}>{p.n}</span>
                    </div>
                    <h2 className="mb-3 text-2xl font-semibold text-white/90">{p.headline}</h2>
                    <p className="text-sm leading-7 text-white/50">{p.description}</p>
                  </div>
                  <div className="flex flex-col justify-center gap-2.5 border-t border-white/[0.05] p-8 lg:border-l lg:border-t-0 lg:p-10">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                      What you do
                    </p>
                    {p.details.map((d) => (
                      <div
                        key={d}
                        className="flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2"
                      >
                        <div className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${p.iconClass}`} />
                        <span className="text-sm text-white/60">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Roles */}
        <section className="border-t border-white/[0.05] py-24">
          <div className="page-shell">
            <div className="mb-14">
              <p className="eyebrow mb-3">Who it&apos;s for</p>
              <h2 className="display-heading text-4xl text-white sm:text-5xl">
                One platform.
                <br />
                <span className="silver-text">Different views for everyone.</span>
              </h2>
              <div className="velocity-line mt-4" />
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {roles.map((r) => (
                <div key={r.role} className={`surface ${r.accent} rounded-2xl p-7`}>
                  <div className={`mb-3 text-xs font-bold uppercase tracking-[0.2em] ${r.iconClass}`}>
                    {r.role}
                  </div>
                  <p className="text-sm leading-7 text-white/50">{r.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24">
          <div className="page-shell text-center">
            <h2 className="display-heading text-4xl text-white sm:text-5xl">
              Ready to build
              <br />
              <span className="silver-text">your first wallet?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base text-white/45">
              Set up is fast — most developers have a complete wallet ready in under an hour.
              No credit card needed to start.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/get-started">
                <Button size="lg" className="gap-2">
                  Get started free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary" size="lg">View pricing</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
