import Link from "next/link";
import { ArrowRight, Code2, FileText, Handshake, Shield, UserCheck, Zap } from "lucide-react";

import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { Button } from "@/components/ui/button";

const workflow = [
  {
    n: "01",
    icon: Code2,
    title: "Create the wallet",
    description:
      "Set up the ownership record for the website. Add the business name, website URLs, deployment notes, and the context that makes handoff feel intentional — not like a fire sale.",
    accent: "purple",
    iconClass: "text-violet-400",
    iconBgClass: "border-violet-500/25 bg-violet-500/[0.07]",
    numClass: "text-violet-500/40"
  },
  {
    n: "02",
    icon: Zap,
    title: "Connect every provider",
    description:
      "Link hosting, CMS, domain, payments, email, analytics, and anything else behind the site. Use OAuth, API tokens, or manual records. Each one gets an owner-friendly explanation you write once.",
    accent: "cyan",
    iconClass: "text-cyan-400",
    iconBgClass: "border-cyan-500/25 bg-cyan-500/[0.07]",
    numClass: "text-cyan-500/40"
  },
  {
    n: "03",
    icon: FileText,
    title: "Set up the edit paths",
    description:
      "Create edit routes so the owner always lands in the right place when they need to update content. No 'which dashboard was that again?' — just one clear button that goes exactly where it should.",
    accent: "amber",
    iconClass: "text-amber-400",
    iconBgClass: "border-amber-500/25 bg-amber-500/[0.07]",
    numClass: "text-amber-500/40"
  },
  {
    n: "04",
    icon: Handshake,
    title: "Invite the owner",
    description:
      "Send a secure handoff invite. The owner clicks once and lands in their own clean view of the wallet — no technical jargon, no shared passwords, no Notion docs required.",
    accent: "emerald",
    iconClass: "text-emerald-400",
    iconBgClass: "border-emerald-500/25 bg-emerald-500/[0.07]",
    numClass: "text-emerald-500/40"
  }
];

const benefits = [
  {
    icon: Shield,
    title: "You look more professional",
    description:
      "Delivering a wallet alongside the website positions your work as premium and intentional. Clients remember the experience, not just the site.",
    accent: "card-accent-purple",
    iconClass: "text-violet-400",
    iconBgClass: "border-violet-500/25 bg-violet-500/[0.07]"
  },
  {
    icon: Zap,
    title: "Handoffs stop being painful",
    description:
      "No more sharing passwords in Slack, no more 15-tab loom recordings, no more follow-up calls three months later because someone doesn't know where to edit the homepage.",
    accent: "card-accent-cyan",
    iconClass: "text-cyan-400",
    iconBgClass: "border-cyan-500/25 bg-cyan-500/[0.07]"
  },
  {
    icon: UserCheck,
    title: "Clients stay organized after you leave",
    description:
      "The wallet keeps working long after the contract ends. Clients can find what they need, manage access, and understand what they're paying for — without calling you.",
    accent: "card-accent-amber",
    iconClass: "text-amber-400",
    iconBgClass: "border-amber-500/25 bg-amber-500/[0.07]"
  }
];

export default function ForDevelopersPage() {
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
              <p className="eyebrow mb-4">For Developers & Agencies</p>
              <h1 className="display-heading text-5xl text-white sm:text-6xl xl:text-7xl">
                Build the site.
                <br />
                <span className="silver-text">Own the handoff.</span>
              </h1>
              <div className="velocity-line mt-5" />
              <p className="mt-6 text-lg leading-8 text-white/50">
                RAEYL gives you a structured, premium handoff layer that makes your work
                look professional, keeps clients organized, and saves you hours of
                post-launch support.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/get-started">
                  <Button size="lg" className="gap-2">
                    Start building <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="secondary" size="lg">View pricing</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-white/[0.05] py-24">
          <div className="page-shell">
            <div className="mb-14">
              <p className="eyebrow mb-3">The workflow</p>
              <h2 className="display-heading text-4xl text-white sm:text-5xl">
                From build to handoff
                <br />
                <span className="silver-text">in four steps.</span>
              </h2>
              <div className="velocity-line mt-4" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {workflow.map((step) => (
                <div key={step.n} className="surface rounded-2xl p-6">
                  <div className="mb-5 flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border p-2.5 ${step.iconBgClass}`}>
                      <step.icon className={`h-4 w-4 ${step.iconClass}`} strokeWidth={1.5} />
                    </div>
                    <span className={`font-display text-3xl font-bold ${step.numClass}`}>{step.n}</span>
                  </div>
                  <h3 className="mb-2 font-semibold text-white/90">{step.title}</h3>
                  <p className="text-sm leading-6 text-white/45">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-t border-white/[0.05] py-24">
          <div className="page-shell">
            <div className="mb-14">
              <p className="eyebrow mb-3">Why it matters</p>
              <h2 className="display-heading text-4xl text-white sm:text-5xl">
                Better for you.
                <br />
                <span className="silver-text">Better for the client.</span>
              </h2>
              <div className="velocity-line mt-4" />
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {benefits.map((b) => (
                <div key={b.title} className={`surface ${b.accent} hover-lift rounded-2xl p-7`}>
                  <div className={`mb-5 inline-flex rounded-xl border p-3 ${b.iconBgClass}`}>
                    <b.icon className={`h-5 w-5 ${b.iconClass}`} strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2.5 text-lg font-semibold text-white/90">{b.title}</h3>
                  <p className="text-sm leading-7 text-white/45">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What's included callout */}
        <section className="border-t border-white/[0.05] py-24">
          <div className="page-shell">
            <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#141414] to-[#0a0a0a]">
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="grid gap-12 p-10 lg:grid-cols-2 lg:items-center lg:p-16">
                <div>
                  <p className="eyebrow mb-4">What you get</p>
                  <h2 className="display-heading text-3xl text-white sm:text-4xl">
                    Everything you need
                    <br />
                    <span className="silver-text">to deliver properly.</span>
                  </h2>
                  <p className="mt-4 text-base leading-7 text-white/45">
                    Every tool in RAEYL is built around the moment a developer
                    hands work to a client. The whole platform is designed so that
                    moment feels premium, organized, and complete.
                  </p>
                  <div className="mt-8">
                    <Link href="/get-started">
                      <Button className="gap-2">
                        Create your first wallet <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Provider tracking",
                    "Edit routing",
                    "Billing visibility",
                    "Team access control",
                    "Owner handoff flow",
                    "Health monitoring",
                    "AI assistant",
                    "Support inbox",
                    "Audit history",
                    "Partner program"
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                    >
                      <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                      <span className="text-sm font-medium text-white/65">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
