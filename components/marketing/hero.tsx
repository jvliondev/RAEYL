import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe, ShieldCheck, TrendingUp, Wallet, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

const stats = [
  { label: "Average setup", value: "< 10 min" },
  { label: "Tools connected", value: "30+" },
  { label: "Clients managed", value: "1 wallet" }
];

const walletItems = [
  { icon: Globe, label: "Website status", value: "Live & healthy", color: "text-emerald-400" },
  { icon: Wallet, label: "Monthly cost", value: "$518 / mo", color: "text-cyan-400" },
  { icon: ShieldCheck, label: "Domain renewal", value: "214 days left", color: "text-violet-400" },
  { icon: TrendingUp, label: "Last handoff", value: "Mar 12, 2025", color: "text-purple-400" }
];

const providerLogos = [
  { name: "Vercel", abbr: "▲" },
  { name: "Webflow", abbr: "WF" },
  { name: "Sanity", abbr: "S" },
  { name: "Stripe", abbr: "⚡" },
  { name: "Netlify", abbr: "N" },
  { name: "Shopify", abbr: "◈" }
];

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40" />

      {/* Purple glow orb */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 right-0 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-cyan-500/6 blur-[100px]" />

      <div className="page-shell relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px]">

          {/* Left — copy */}
          <div className="space-y-8">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]" />
              <span className="text-xs font-semibold tracking-[0.15em] text-violet-300 uppercase">
                Website Ownership Wallet
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl xl:text-7xl">
                One Place for Your{" "}
                <span className="gradient-text">Website.</span>
                <br />
                <span className="gradient-text">Finally Simple.</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted">
                RAEYL gives business owners one clear control center — every tool,
                cost, access permission, and edit path their website needs.
                100% ready the moment your developer hands it over.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/get-started">
                <Button size="lg" className="gap-2">
                  Get your wallet <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/product">
                <Button variant="secondary" size="lg">
                  See how it works
                </Button>
              </Link>
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  <span className="text-sm text-muted">
                    <span className="font-semibold text-foreground">{s.value}</span>{" "}
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Integration logos */}
            <div className="space-y-2">
              <p className="text-xs text-muted/60 uppercase tracking-widest">Integrates with</p>
              <div className="flex flex-wrap gap-2">
                {providerLogos.map((p) => (
                  <div
                    key={p.name}
                    className="flex h-8 items-center gap-1.5 rounded-md border border-white/[0.07] bg-white/[0.03] px-3"
                  >
                    <span className="text-xs text-muted/70">{p.abbr}</span>
                    <span className="text-xs font-medium text-muted/80">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — wallet preview card */}
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute -inset-4 rounded-2xl bg-violet-600/10 blur-2xl" />

            <div className="surface-elevated relative overflow-hidden rounded-2xl">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
                <div>
                  <p className="text-xs text-muted">Evergreen Dental</p>
                  <p className="font-semibold text-foreground">Website Wallet</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                  <span className="text-xs font-medium text-emerald-400">Live</span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-px bg-white/[0.04] p-px">
                {walletItems.map((item) => (
                  <div key={item.label} className="bg-card p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                      <span className="text-xs text-muted">{item.label}</span>
                    </div>
                    <p className={`text-sm font-semibold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Provider stack */}
              <div className="border-t border-white/[0.06] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-muted">Connected providers</span>
                  <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-medium text-violet-400">
                    6 active
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Vercel", role: "Hosting", dot: "bg-emerald-400" },
                    { name: "Sanity", role: "CMS", dot: "bg-emerald-400" },
                    { name: "Stripe", role: "Payments", dot: "bg-yellow-400" }
                  ].map((p) => (
                    <div key={p.name} className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.025] px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
                        <span className="text-sm font-medium text-foreground">{p.name}</span>
                      </div>
                      <span className="text-xs text-muted">{p.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification badge */}
              <div className="border-t border-white/[0.06] bg-yellow-500/5 px-5 py-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-xs text-yellow-300/80">
                    Stripe billing renewal in{" "}
                    <span className="font-semibold text-yellow-300">14 days</span> — review now
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
