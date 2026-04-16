import Link from "next/link";
import {
  ArrowRight,
  Code2,
  FileText,
  Globe,
  Lock,
  RefreshCw,
  UserCheck,
  Wallet,
  Zap
} from "lucide-react";

import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { Hero } from "@/components/marketing/hero";
import { RaeylMark } from "@/components/ui/raeyl-logo";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: Wallet,
    title: "One place for ownership",
    description:
      "Every tool, credential, billing seat, and provider — organized into one clean control center after your developer hands off the site.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20"
  },
  {
    icon: Globe,
    title: "Built for handoff, not just setup",
    description:
      "Developers configure the wallet before they leave. Owners inherit something they can actually understand — not a pile of links and notes.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20"
  },
  {
    icon: Lock,
    title: "Simple on the surface, powerful underneath",
    description:
      "Owners see calm, business-friendly guidance. The underlying infrastructure still respects real permissions, roles, and audit history.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20"
  }
];

const steps = [
  {
    step: "01",
    icon: Code2,
    title: "Developer sets it up",
    description: "Your developer or agency connects your providers and configures the wallet before handing off."
  },
  {
    step: "02",
    icon: UserCheck,
    title: "You get invited",
    description: "You receive a clean invite link. One click and you own the wallet — no tech knowledge required."
  },
  {
    step: "03",
    icon: FileText,
    title: "See everything clearly",
    description: "Your dashboard shows every connected tool, what it costs, who has access, and what needs attention."
  },
  {
    step: "04",
    icon: Zap,
    title: "Manage with confidence",
    description: "Update content, manage access, review billing, request support — all from one place."
  }
];

const features = [
  { icon: Globe, label: "Provider tracking" },
  { icon: Wallet, label: "Billing visibility" },
  { icon: UserCheck, label: "Team access control" },
  { icon: Lock, label: "Secure credential storage" },
  { icon: FileText, label: "Edit routing" },
  { icon: RefreshCw, label: "Handoff history" }
];

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <main>
        <Hero />

        {/* ── Pillars ──────────────────────────────────────── */}
        <section className="py-20 sm:py-24">
          <div className="page-shell">
            <div className="mb-12 text-center">
              <p className="eyebrow mb-3">Why RAEYL</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything after the build.{" "}
                <span className="gradient-text">Finally organized.</span>
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {pillars.map((p) => (
                <div
                  key={p.title}
                  className={`surface rounded-2xl p-6 transition-all duration-300 hover:border-white/15 ${p.border}`}
                >
                  <div className={`mb-4 inline-flex rounded-xl ${p.bg} p-3`}>
                    <p.icon className={`h-5 w-5 ${p.color}`} />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">{p.title}</h3>
                  <p className="text-sm leading-6 text-muted">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────── */}
        <section className="relative py-20 sm:py-24">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent" />
          <div className="page-shell relative">
            <div className="mb-14 text-center">
              <p className="eyebrow mb-3">How it works</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                From Handoff to Confidence{" "}
                <span className="gradient-text">in Minutes</span>
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <div key={s.step} className="relative">
                  {i < steps.length - 1 && (
                    <div className="absolute left-full top-8 z-10 hidden h-px w-full -translate-y-1/2 bg-gradient-to-r from-violet-500/30 to-transparent lg:block" />
                  )}
                  <div className="surface rounded-2xl p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15">
                        <s.icon className="h-5 w-5 text-violet-400" />
                      </div>
                      <span className="text-2xl font-bold text-white/10">{s.step}</span>
                    </div>
                    <h3 className="mb-2 font-semibold text-foreground">{s.title}</h3>
                    <p className="text-sm leading-6 text-muted">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature grid CTA ─────────────────────────────── */}
        <section className="py-20 sm:py-24">
          <div className="page-shell">
            <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/50 via-background to-cyan-950/20 p-8 sm:p-14">
              {/* decorative orb */}
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 left-1/3 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

              <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
                <div className="space-y-6">
                  <p className="eyebrow">Everything you need</p>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Give every client a website{" "}
                    <span className="gradient-text">they can actually understand</span>{" "}
                    after launch.
                  </h2>
                  <p className="text-base leading-7 text-muted">
                    RAEYL turns a finished stack into a premium ownership experience —
                    connected systems, billing visibility, editing paths, handoff history,
                    and access management in one control center.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/get-started">
                      <Button className="gap-2">
                        Start building <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/for-owners">
                      <Button variant="secondary">See owner experience</Button>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                  {features.map((f) => (
                    <div
                      key={f.label}
                      className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3"
                    >
                      <f.icon className="h-4 w-4 flex-shrink-0 text-violet-400" />
                      <span className="text-sm font-medium text-foreground/80">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ───────────────────────────────────── */}
        <section className="py-20 sm:py-24">
          <div className="page-shell">
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-violet-950/60 to-background text-center">
              <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-30" />
              <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl" />
              <div className="relative px-8 py-16 sm:py-20">
                <div className="mx-auto mb-6 flex justify-center">
                  <RaeylMark className="h-16 w-auto opacity-90" />
                </div>
                <h2 className="mx-auto mb-4 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
                  Ready to Take Control?
                </h2>
                <p className="mx-auto mb-8 max-w-md text-base text-muted">
                  Set up your first wallet in under 10 minutes. Your clients will thank you.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/get-started">
                    <Button size="lg" className="gap-2">
                      Create your wallet <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/for-developers">
                    <Button variant="secondary" size="lg">
                      I&apos;m a developer
                    </Button>
                  </Link>
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
