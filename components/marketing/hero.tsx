import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Globe, ShieldCheck, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RaeylMark } from "@/components/ui/raeyl-logo";

/* ─── inline wallet mockup ──────────────────────────────── */
function WalletMockup() {
  return (
    <div className="relative">
      {/* Ambient glow behind card */}
      <div className="absolute -inset-8 rounded-3xl bg-white/[0.015] blur-3xl" />

      <div className="surface-elevated relative overflow-hidden rounded-2xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-2.5 border-b border-white/[0.05] bg-black/30 px-4 py-2.5">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
            ))}
          </div>
          <div className="mx-auto flex h-5 w-52 items-center justify-center rounded bg-white/[0.04]">
            <span className="text-[10px] tracking-wide text-white/20">app.raeyl.com · Evergreen Dental</span>
          </div>
        </div>

        {/* App nav bar */}
        <div className="flex items-center justify-between border-b border-white/[0.05] bg-black/20 px-5 py-3">
          <div className="flex items-center gap-2">
            <RaeylMark className="h-4 w-auto opacity-60" />
            <span className="text-xs text-white/25">/ Evergreen Dental</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }} />
            <span className="text-xs font-medium text-emerald-400/70">Live</span>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="space-y-3.5 p-5">

          {/* Stat row */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Monthly Cost",    value: "$518",      sub: "6 tools",     dim: false },
              { label: "Domain Renewal",  value: "214 days",  sub: "dentist.com", dim: false },
              { label: "Pending Alerts",  value: "2 items",   sub: "review now",  dim: true  }
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"
              >
                <p className="mb-1.5 text-[10px] text-white/30">{s.label}</p>
                <p className={`text-sm font-semibold ${s.dim ? "text-yellow-400/80" : "text-white/80"}`}>
                  {s.value}
                </p>
                <p className="mt-0.5 text-[10px] text-white/20">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Connected providers */}
          <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.015]">
            <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-2.5">
              <span className="text-xs text-white/35">Connected Providers</span>
              <span className="rounded-full border border-white/[0.07] px-2 py-0.5 text-[10px] text-white/30">
                6 active
              </span>
            </div>
            {[
              { name: "Vercel",   role: "Hosting",  ok: true  },
              { name: "Sanity",   role: "CMS",      ok: true  },
              { name: "Stripe",   role: "Payments", ok: false }
            ].map((p, i) => (
              <div
                key={p.name}
                className={`flex items-center justify-between px-4 py-2.5 ${i < 2 ? "border-b border-white/[0.04]" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${p.ok ? "bg-emerald-400" : "bg-yellow-400"}`}
                    style={{ boxShadow: p.ok ? "0 0 4px rgba(52,211,153,0.6)" : "0 0 4px rgba(251,191,36,0.6)" }}
                  />
                  <span className="text-sm font-medium text-white/65">{p.name}</span>
                </div>
                <span className="text-xs text-white/25">{p.role}</span>
              </div>
            ))}
          </div>

          {/* Alert strip */}
          <div className="flex items-center gap-2.5 rounded-xl border border-yellow-500/15 bg-yellow-500/[0.05] px-4 py-2.5">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-yellow-400/60" />
            <p className="text-xs text-yellow-400/55">
              Stripe billing renews in{" "}
              <span className="font-semibold text-yellow-400/80">14 days</span>{" "}
              — review payment method
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── Hero ──────────────────────────────────────────────── */
const trust = [
  "No credit card required",
  "Setup in under 10 minutes",
  "Cancel anytime"
];

const integrations = [
  { abbr: "▲", name: "Vercel" },
  { abbr: "◈", name: "Webflow" },
  { abbr: "S",  name: "Sanity" },
  { abbr: "⬡",  name: "Cloudflare" },
  { abbr: "⚡",  name: "Stripe" },
  { abbr: "○",  name: "Supabase" }
];

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Backgrounds */}
      <div className="pointer-events-none absolute inset-0 hero-radial" />
      <div className="pointer-events-none absolute inset-0 bg-dot-grid bg-dot-28 opacity-[0.35]" />
      {/* Faint top-center glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-white/[0.018] blur-[120px]" />

      <div className="page-shell relative">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_480px]">

          {/* ── Left — copy ── */}
          <div className="space-y-9">

            {/* Eyebrow pill */}
            <div className="animate-in delay-0 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                Website Ownership Wallet
              </span>
            </div>

            {/* Statement headline */}
            <div className="animate-in delay-1 space-y-1">
              <h1
                className="display-heading text-[4rem] text-white sm:text-[5rem] xl:text-[6rem]"
              >
                <span className="block">OWN IT.</span>
                <span className="block silver-text">UNDERSTAND IT.</span>
                <span className="block text-white/25">CONTROL IT.</span>
              </h1>
            </div>

            {/* Description */}
            <p className="animate-in delay-2 max-w-md text-base leading-7 text-white/45">
              RAEYL brings hosting, billing, domains, CMS, access, and ownership
              into one clean wallet — built for business owners, ready the moment
              your developer hands off the site.
            </p>

            {/* CTAs */}
            <div className="animate-in delay-3 flex flex-wrap items-center gap-4">
              <Link href="/get-started">
                <Button size="lg" className="gap-2">
                  Create Your Wallet <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="secondary" size="lg">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="animate-in delay-4 flex flex-wrap gap-5">
              {trust.map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-white/25" />
                  <span className="text-sm text-white/30">{t}</span>
                </div>
              ))}
            </div>

            {/* Integrations */}
            <div className="animate-in delay-5 space-y-2.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                Works with your existing stack
              </p>
              <div className="flex flex-wrap gap-2">
                {integrations.map((p) => (
                  <div
                    key={p.name}
                    className="flex h-7 items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.025] px-3"
                  >
                    <span className="text-xs text-white/25">{p.abbr}</span>
                    <span className="text-xs font-medium text-white/35">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Right — wallet mockup ── */}
          <div className="animate-in delay-3">
            <WalletMockup />
          </div>

        </div>
      </div>
    </section>
  );
}
