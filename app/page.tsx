import Link from "next/link";
import {
  ArrowRight,
  Code2,
  FileText,
  Globe,
  Lock,
  RefreshCw,
  Shield,
  UserCheck,
  Wallet,
  Zap
} from "lucide-react";

import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { Hero } from "@/components/marketing/hero";
import { RaeylMark } from "@/components/ui/raeyl-logo";
import { Button } from "@/components/ui/button";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const pillars = [
  {
    icon: Globe,
    title: "Stop the Chaos",
    description:
      "No more scattered links, forgotten credentials, and mystery costs. Every tool, provider, and billing seat in one clean place."
  },
  {
    icon: FileText,
    title: "See Everything Clearly",
    description:
      "Your website's full picture — what it costs, what's connected, what needs attention — explained in plain language."
  },
  {
    icon: Zap,
    title: "Take Action with Confidence",
    description:
      "Open the right tool, update the right setting, or reach the right person — without needing a developer on call."
  },
  {
    icon: Shield,
    title: "Hand Off with Peace of Mind",
    description:
      "Developers deliver a complete, organized ownership experience — not a Notion doc and a prayer."
  }
];

const steps = [
  {
    n: "01",
    icon: Code2,
    title: "Developer Sets It Up",
    description:
      "Your developer or agency connects your providers, configures the wallet, and prepares your ownership handoff before they leave."
  },
  {
    n: "02",
    icon: UserCheck,
    title: "Owner Gets Invited",
    description:
      "You receive one secure invite link. One click, and the wallet is yours — no technical knowledge required."
  },
  {
    n: "03",
    icon: FileText,
    title: "Everything Appears in One Place",
    description:
      "Hosting, CMS, billing, domains, access, and alerts. Organized, labeled, and ready to act on."
  },
  {
    n: "04",
    icon: Wallet,
    title: "Manage with Confidence",
    description:
      "Update content, control access, track costs, request support — all from a single executive dashboard."
  }
];

const features = [
  { icon: Globe,      label: "Provider Tracking" },
  { icon: Wallet,     label: "Billing Visibility" },
  { icon: UserCheck,  label: "Team Access Control" },
  { icon: Lock,       label: "Credential Storage" },
  { icon: FileText,   label: "Edit Routing" },
  { icon: RefreshCw,  label: "Handoff History" }
];

/* ─────────────────────────────────────────────
   DASHBOARD SHOWCASE
   A realistic premium admin mockup
───────────────────────────────────────────── */
function DashboardShowcase() {
  const providers = [
    { name: "Vercel",     role: "Hosting",     cost: "$20/mo",   ok: true  },
    { name: "Sanity",     role: "CMS",         cost: "$99/mo",   ok: true  },
    { name: "Stripe",     role: "Payments",    cost: "0.25%",    ok: false },
    { name: "Cloudflare", role: "DNS & CDN",   cost: "$0/mo",    ok: true  },
    { name: "Postmark",   role: "Email",       cost: "$15/mo",   ok: true  },
    { name: "GoDaddy",    role: "Domain",      cost: "$14/yr",   ok: true  }
  ];

  return (
    <div className="relative">
      {/* Ambient glow */}
      <div className="absolute -inset-10 rounded-3xl bg-white/[0.012] blur-3xl" />

      <div className="surface-elevated relative overflow-hidden rounded-2xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-2.5 border-b border-white/[0.05] bg-black/40 px-5 py-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-2.5 w-2.5 rounded-full bg-white/[0.07]" />
            ))}
          </div>
          <div className="mx-auto flex h-6 w-64 items-center justify-center rounded-md bg-white/[0.04]">
            <span className="text-xs text-white/20">app.raeyl.com/wallets/evergreen-dental</span>
          </div>
        </div>

        <div className="flex min-h-[480px]">
          {/* Sidebar */}
          <div className="hidden w-52 flex-shrink-0 flex-col gap-0.5 border-r border-white/[0.05] bg-black/20 p-3 sm:flex">
            <div className="mb-3 flex items-center gap-2 px-3 py-2">
              <RaeylMark className="h-5 w-auto opacity-55" />
              <span className="text-xs font-semibold text-white/40">Evergreen Dental</span>
            </div>
            {[
              { label: "Dashboard",  active: true  },
              { label: "Providers",  active: false },
              { label: "Billing",    active: false },
              { label: "Access",     active: false },
              { label: "Alerts",     active: false },
              { label: "Handoff",    active: false },
              { label: "Settings",   active: false }
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  item.active
                    ? "bg-white/[0.06] text-white/80"
                    : "text-white/30 hover:text-white/50"
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* Main panel */}
          <div className="flex-1 overflow-hidden p-5 space-y-5">
            {/* Page header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-0.5">
                  Wallet Dashboard
                </p>
                <h2 className="text-base font-semibold text-white/80">Evergreen Dental</h2>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full bg-emerald-400"
                  style={{ boxShadow: "0 0 8px rgba(52,211,153,0.7)" }}
                />
                <span className="text-xs font-medium text-emerald-400/70">Website Live</span>
              </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Monthly Cost",  value: "$518",  note: "across 6 tools" },
                { label: "Active Tools",  value: "6",     note: "all connected"  },
                { label: "Team Members",  value: "3",     note: "with access"    },
                { label: "Alerts",        value: "2",     note: "need review", warn: true }
              ].map((k) => (
                <div
                  key={k.label}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5"
                >
                  <p className="mb-2 text-[10px] text-white/30">{k.label}</p>
                  <p className={`text-xl font-bold tabular-nums ${k.warn ? "text-yellow-400/80" : "text-white/80"}`}>
                    {k.value}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/20">{k.note}</p>
                </div>
              ))}
            </div>

            {/* Provider list */}
            <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.015]">
              <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-2.5">
                <span className="text-xs font-medium text-white/40">Connected Providers</span>
                <span className="text-[10px] text-white/25">Monthly total: $148</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {providers.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${p.ok ? "bg-emerald-400" : "bg-yellow-400"}`}
                        style={{
                          boxShadow: p.ok
                            ? "0 0 4px rgba(52,211,153,0.6)"
                            : "0 0 4px rgba(251,191,36,0.6)"
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium text-white/70">{p.name}</p>
                        <p className="text-[10px] text-white/25">{p.role}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-white/35">{p.cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <main>
        <Hero />

        {/* Chrome section divider */}
        <div className="page-shell">
          <div className="chrome-divider" />
        </div>

        {/* ── 1. VALUE PILLARS ─────────────────────── */}
        <section className="py-24 sm:py-28">
          <div className="page-shell">
            <div className="mb-14 max-w-xl">
              <p className="eyebrow mb-3">Why RAEYL</p>
              <h2
                className="display-heading text-4xl text-white sm:text-5xl"
              >
                Everything After the Build.
                <br />
                <span className="silver-text">Finally Organized.</span>
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map((p, i) => (
                <div
                  key={p.title}
                  className={`surface hover-lift animate-in rounded-2xl p-6 delay-${i}`}
                >
                  <div className="mb-5 inline-flex rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
                    <p.icon className="h-5 w-5 text-white/50" strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2 font-semibold text-white/80">{p.title}</h3>
                  <p className="text-sm leading-6 text-white/35">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="page-shell">
          <div className="chrome-divider" />
        </div>

        {/* ── 2. HOW IT WORKS ──────────────────────── */}
        <section className="relative py-24 sm:py-28">
          <div className="pointer-events-none absolute inset-0 section-radial" />
          <div className="page-shell relative">
            <div className="mb-14 text-center">
              <p className="eyebrow mb-3">How It Works</p>
              <h2 className="display-heading text-4xl text-white sm:text-5xl">
                From Handoff to Confidence
                <br />
                <span className="silver-text">in Four Steps.</span>
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  className={`surface animate-in rounded-2xl p-6 delay-${i}`}
                >
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                      <s.icon className="h-4.5 w-4.5 text-white/50" strokeWidth={1.5} />
                    </div>
                    <span className="font-display text-3xl font-bold text-white/[0.07]">
                      {s.n}
                    </span>
                  </div>
                  <h3 className="mb-2 font-semibold text-white/80">{s.title}</h3>
                  <p className="text-sm leading-6 text-white/35">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="page-shell">
          <div className="chrome-divider" />
        </div>

        {/* ── 3. DASHBOARD SHOWCASE ────────────────── */}
        <section className="py-24 sm:py-28">
          <div className="page-shell">
            <div className="mb-14 max-w-xl">
              <p className="eyebrow mb-3">The Control Center</p>
              <h2 className="display-heading text-4xl text-white sm:text-5xl">
                An Executive Dashboard
                <br />
                <span className="silver-text">for Every Website.</span>
              </h2>
              <p className="mt-4 text-base leading-7 text-white/40">
                Every provider, every cost, every alert — surfaced in one calm,
                premium interface built for the owner, not the developer.
              </p>
            </div>
            <DashboardShowcase />
          </div>
        </section>

        <div className="page-shell">
          <div className="chrome-divider" />
        </div>

        {/* ── 4. FEATURE GRID + CTA ────────────────── */}
        <section className="py-24 sm:py-28">
          <div className="page-shell">
            <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#141414] to-[#0a0a0a]">
              {/* Inner top chrome line */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="p-10 sm:p-14 lg:p-16">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                  {/* Copy */}
                  <div className="space-y-6">
                    <p className="eyebrow">Everything you need</p>
                    <h2 className="display-heading text-4xl text-white sm:text-5xl">
                      Give Every Client a Website
                      <br />
                      <span className="silver-text">They Can Actually Own.</span>
                    </h2>
                    <p className="text-base leading-7 text-white/40">
                      RAEYL turns a finished web stack into a premium ownership
                      experience — connected systems, billing visibility, editing
                      paths, handoff history, and access management in one place.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
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

                  {/* Feature chips */}
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                    {features.map((f) => (
                      <div
                        key={f.label}
                        className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]"
                      >
                        <f.icon className="h-4 w-4 flex-shrink-0 text-white/40" strokeWidth={1.5} />
                        <span className="text-sm font-medium text-white/55">{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. FINAL CTA ─────────────────────────── */}
        <section className="pb-24 sm:pb-32">
          <div className="page-shell">
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0a0a0a] text-center">
              {/* Top chrome line */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

              {/* Dot grid overlay */}
              <div className="pointer-events-none absolute inset-0 bg-dot-grid bg-dot-28 opacity-30" />

              {/* Top center glow */}
              <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-white/[0.03] blur-3xl" />

              <div className="relative px-8 py-20 sm:py-24">
                {/* Large R mark */}
                <div className="mb-8 flex justify-center">
                  <RaeylMark className="h-20 w-auto opacity-80" />
                </div>

                <p className="eyebrow mb-5">Ready to take control?</p>
                <h2 className="display-heading mx-auto mb-5 max-w-xl text-4xl text-white sm:text-5xl">
                  Your Website. Finally
                  <br />
                  <span className="silver-text">Under Your Control.</span>
                </h2>
                <p className="mx-auto mb-10 max-w-md text-base text-white/40">
                  Set up your first wallet in under 10 minutes. Your clients will
                  feel the difference from day one.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/get-started">
                    <Button size="lg" className="gap-2">
                      Create Your Wallet <ArrowRight className="h-4 w-4" />
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
