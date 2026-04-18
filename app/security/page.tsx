import Link from "next/link";
import { ArrowRight, FileLock2, KeyRound, Lock, ScrollText, Shield, ShieldCheck } from "lucide-react";

import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: KeyRound,
    title: "Encrypted credentials",
    description:
      "Provider secrets, API tokens, and sensitive connection data are encrypted with AES-256-GCM before they ever touch the database. Keys are stored separately from the data they protect.",
    accent: "card-accent-purple",
    iconClass: "text-violet-400",
    iconBgClass: "border-violet-500/25 bg-violet-500/[0.07]",
    tags: ["AES-256-GCM", "Separate key storage", "No plaintext secrets", "Encrypted at rest"]
  },
  {
    icon: Shield,
    title: "Role-based access control",
    description:
      "Every wallet action is gated by role. Owners, developers, collaborators, and billing managers each have exactly the capabilities they need — no more. Permission checks happen on the server, not just in the UI.",
    accent: "card-accent-cyan",
    iconClass: "text-cyan-400",
    iconBgClass: "border-cyan-500/25 bg-cyan-500/[0.07]",
    tags: ["7 role types", "18-capability matrix", "Server-side checks", "Role-aware views"]
  },
  {
    icon: FileLock2,
    title: "Secure invite tokens",
    description:
      "Handoff invites are one-time tokens with expiry timestamps. They can only be used once and expire after 72 hours. No password sharing, no link forwarding, no guessable URLs.",
    accent: "card-accent-amber",
    iconClass: "text-amber-400",
    iconBgClass: "border-amber-500/25 bg-amber-500/[0.07]",
    tags: ["Single-use tokens", "72-hour expiry", "Signed server-side", "Auto-invalidated on use"]
  },
  {
    icon: ScrollText,
    title: "Full audit trail",
    description:
      "Every important action is logged with actor, timestamp, and detail. Provider changes, team updates, handoff completions, ownership transfers — all of it is recorded and visible in the wallet activity log.",
    accent: "card-accent-emerald",
    iconClass: "text-emerald-400",
    iconBgClass: "border-emerald-500/25 bg-emerald-500/[0.07]",
    tags: ["Actor + timestamp", "Action metadata", "Ownership events", "Immutable records"]
  },
  {
    icon: ShieldCheck,
    title: "Authentication and sessions",
    description:
      "Sessions are authenticated server-side before any wallet data is returned. Middleware guards every application route. No client-side-only auth — every protected page verifies identity on the server.",
    accent: "card-accent-purple",
    iconClass: "text-violet-400",
    iconBgClass: "border-violet-500/25 bg-violet-500/[0.07]",
    tags: ["Server-side auth", "Middleware route guards", "Session validation", "Auto sign-out on expiry"]
  },
  {
    icon: Lock,
    title: "Data isolation",
    description:
      "Wallet data is scoped to membership. Accessing a wallet you don&apos;t belong to returns nothing — not a permissions error, not a redirect. Users can only query data they are explicitly authorized to see.",
    accent: "card-accent-cyan",
    iconClass: "text-cyan-400",
    iconBgClass: "border-cyan-500/25 bg-cyan-500/[0.07]",
    tags: ["Membership-scoped queries", "No data leakage", "Hard tenant isolation", "Ownership transfer logs"]
  }
];

const facts = [
  "No plaintext secrets ever written to disk",
  "Invites expire and invalidate on first use",
  "Role checks happen server-side, not in the UI",
  "All ownership events are immutably logged",
  "Sessions are verified before any data is returned",
  "Wallet data is isolated by membership — not just hidden"
];

export default function SecurityPage() {
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
              <p className="eyebrow mb-4">Security</p>
              <h1 className="display-heading text-5xl text-white sm:text-6xl xl:text-7xl">
                Built for
                <br />
                <span className="silver-text">auditable trust.</span>
              </h1>
              <div className="velocity-line mt-5" />
              <p className="mt-6 text-lg leading-8 text-white/50">
                RAEYL handles credentials, ownership records, and access control for business-critical websites.
                Security is built into the architecture — not layered on top.
              </p>
            </div>
          </div>
        </section>

        {/* Trust facts banner */}
        <section className="border-t border-white/[0.05] py-10">
          <div className="page-shell">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              {facts.map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <div
                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400"
                    style={{ boxShadow: "0 0 6px rgba(52,211,153,0.7)" }}
                  />
                  <span className="text-sm text-white/55">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security pillars */}
        <section className="border-t border-white/[0.05] pb-24">
          <div className="page-shell space-y-5 pt-16">
            {pillars.map((p, i) => (
              <div key={p.title} className={`surface ${p.accent} overflow-hidden rounded-2xl`}>
                <div
                  className={`grid gap-0 ${i % 2 === 0 ? "lg:grid-cols-[1fr_320px]" : "lg:grid-cols-[320px_1fr]"}`}
                >
                  <div className={`p-8 lg:p-10 ${i % 2 !== 0 ? "lg:order-2" : ""}`}>
                    <div className="mb-5 flex items-center gap-3">
                      <div className={`inline-flex rounded-xl border p-2.5 ${p.iconBgClass}`}>
                        <p.icon className={`h-4 w-4 ${p.iconClass}`} strokeWidth={1.5} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                        {p.title}
                      </span>
                    </div>
                    <p className="text-sm leading-7 text-white/50">{p.description}</p>
                  </div>
                  <div
                    className={`flex flex-col justify-center gap-2.5 border-white/[0.05] p-8 lg:p-10 ${
                      i % 2 !== 0 ? "lg:order-1 lg:border-r" : "lg:border-l"
                    } border-t lg:border-t-0`}
                  >
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                      How it works
                    </p>
                    {p.tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2"
                      >
                        <div className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${p.iconClass}`} />
                        <span className="text-sm text-white/60">{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24">
          <div className="page-shell text-center">
            <h2 className="display-heading text-4xl text-white sm:text-5xl">
              Questions about
              <br />
              <span className="silver-text">how we protect your data?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base text-white/45">
              Reach out — we&apos;re happy to walk through specific security questions, review use cases,
              or discuss how RAEYL handles credentials and access for your workflow.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="gap-2">
                  Talk to us <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/product">
                <Button variant="secondary" size="lg">See all features</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
