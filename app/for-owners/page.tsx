import Link from "next/link";
import { ArrowRight, Bell, CreditCard, Globe, MessageSquare, Shield, Zap } from "lucide-react";

import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { Button } from "@/components/ui/button";

const ownerCapabilities = [
  {
    icon: Globe,
    title: "See what powers your website",
    description:
      "Every service behind your site — hosting, your content editor, your domain, payments — listed in one place. No technical knowledge required to understand what each one does or what it costs.",
    accent: "card-accent-purple",
    iconClass: "text-violet-400",
    iconBgClass: "border-violet-500/25 bg-violet-500/[0.07]"
  },
  {
    icon: Zap,
    title: "Edit your website without guessing",
    description:
      "Your developer set up a direct path to the right editing tool for your site. One click. No wondering which dashboard it was or which login to use.",
    accent: "card-accent-cyan",
    iconClass: "text-cyan-400",
    iconBgClass: "border-cyan-500/25 bg-cyan-500/[0.07]"
  },
  {
    icon: CreditCard,
    title: "Know what you're paying for",
    description:
      "All website costs in one view: hosting, your CMS, domain renewal, email, and anything else connected to your site. No more mystery charges on statements.",
    accent: "card-accent-amber",
    iconClass: "text-amber-400",
    iconBgClass: "border-amber-500/25 bg-amber-500/[0.07]"
  },
  {
    icon: Shield,
    title: "Control who has access",
    description:
      "See exactly who can access your website systems. Add or remove people. Know when your developer last made changes. Your website, your visibility.",
    accent: "card-accent-emerald",
    iconClass: "text-emerald-400",
    iconBgClass: "border-emerald-500/25 bg-emerald-500/[0.07]"
  },
  {
    icon: Bell,
    title: "Get alerted before problems escalate",
    description:
      "RAEYL watches for renewal dates, disconnected services, and things that need a quick decision — so problems surface before they become emergencies.",
    accent: "card-accent-purple",
    iconClass: "text-violet-400",
    iconBgClass: "border-violet-500/25 bg-violet-500/[0.07]"
  },
  {
    icon: MessageSquare,
    title: "Ask anything, get a real answer",
    description:
      "The AI assistant knows your specific website setup. Ask where to update your hours, what happens if your domain expires, or what Vercel actually does. It explains in plain language.",
    accent: "card-accent-cyan",
    iconClass: "text-cyan-400",
    iconBgClass: "border-cyan-500/25 bg-cyan-500/[0.07]"
  }
];

const reassurances = [
  "You don't need to be technical to use RAEYL",
  "No passwords shared by email",
  "No more mystery charges",
  "Your developer can still help without taking back control",
  "Everything is yours — even if the relationship with your developer changes"
];

export default function ForOwnersPage() {
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
              <p className="eyebrow mb-4">For Website Owners</p>
              <h1 className="display-heading text-5xl text-white sm:text-6xl xl:text-7xl">
                Your website.
                <br />
                <span className="silver-text">Finally explained.</span>
              </h1>
              <div className="velocity-line mt-5" />
              <p className="mt-6 text-lg leading-8 text-white/50">
                RAEYL is the control center your developer sets up for you — so you
                always know what&apos;s running, what you&apos;re paying, and what to do next.
                No technical knowledge required.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/get-started">
                  <Button size="lg" className="gap-2">
                    Get access <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Reassurance banner */}
        <section className="border-t border-white/[0.05] py-12">
          <div className="page-shell">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              {reassurances.map((r) => (
                <div key={r} className="flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.7)" }} />
                  <span className="text-sm text-white/55">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="border-t border-white/[0.05] py-24">
          <div className="page-shell">
            <div className="mb-14">
              <p className="eyebrow mb-3">What you can do</p>
              <h2 className="display-heading text-4xl text-white sm:text-5xl">
                Everything you need
                <br />
                <span className="silver-text">to actually own your site.</span>
              </h2>
              <div className="velocity-line mt-4" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ownerCapabilities.map((c) => (
                <div key={c.title} className={`surface ${c.accent} hover-lift rounded-2xl p-6`}>
                  <div className={`mb-5 inline-flex rounded-xl border p-3 ${c.iconBgClass}`}>
                    <c.icon className={`h-5 w-5 ${c.iconClass}`} strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2 font-semibold text-white/90">{c.title}</h3>
                  <p className="text-sm leading-6 text-white/45">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How you get access */}
        <section className="border-t border-white/[0.05] py-24">
          <div className="page-shell">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="eyebrow mb-4">How it works for you</p>
                <h2 className="display-heading text-3xl text-white sm:text-4xl">
                  One invite.
                  <br />
                  <span className="silver-text">Everything is yours.</span>
                </h2>
                <div className="velocity-line mt-4" />
                <div className="mt-8 space-y-6">
                  {[
                    {
                      step: "1",
                      title: "Your developer sets it up",
                      body: "They connect your website's tools, costs, and editing paths — and prepare a clean handoff designed for you."
                    },
                    {
                      step: "2",
                      title: "You receive one invite",
                      body: "A secure link arrives in your email. One click and you're in — no passwords to create, no apps to install."
                    },
                    {
                      step: "3",
                      title: "Everything is there",
                      body: "Your dashboard is ready. Costs, tools, editing paths, contacts — organized and explained in plain language."
                    }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-bold text-white/50">
                        {item.step}
                      </div>
                      <div>
                        <div className="font-semibold text-white/90">{item.title}</div>
                        <p className="mt-1 text-sm leading-6 text-white/45">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-elevated overflow-hidden rounded-2xl">
                {/* Mock owner dashboard */}
                <div className="flex items-center justify-between border-b border-white/[0.05] bg-black/30 px-5 py-3.5">
                  <span className="text-xs font-medium text-white/40">Your website dashboard</span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 5px rgba(52,211,153,0.7)" }} />
                    Live
                  </span>
                </div>
                <div className="space-y-3 p-5">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                    <p className="mb-1 text-xs text-white/30">Primary edit path</p>
                    <p className="font-medium text-white/80">Edit your website →</p>
                    <p className="mt-0.5 text-xs text-white/30">Opens your content editor directly</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { label: "Monthly cost", value: "$148/mo" },
                      { label: "Tools connected", value: "6 active" },
                      { label: "Alerts", value: "None", ok: true }
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                        <p className="mb-1 text-[10px] text-white/30">{s.label}</p>
                        <p className={`text-sm font-semibold ${s.ok ? "text-emerald-400/80" : "text-white/80"}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
                    <p className="mb-2 text-xs text-white/35">What powers your website</p>
                    {[
                      { name: "Vercel", role: "Hosting" },
                      { name: "Sanity", role: "Content editor" },
                      { name: "GoDaddy", role: "Domain" }
                    ].map((p, i) => (
                      <div key={p.name} className={`flex items-center justify-between py-2 ${i < 2 ? "border-b border-white/[0.04]" : ""}`}>
                        <span className="text-sm text-white/65">{p.name}</span>
                        <span className="text-xs text-white/30">{p.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="page-shell text-center">
            <h2 className="display-heading text-4xl text-white sm:text-5xl">
              Ask your developer
              <br />
              <span className="silver-text">to set up your wallet.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base text-white/45">
              Share this page with the person who built your website. Setting up a
              wallet for you is straightforward — and it changes the whole experience
              of owning a site.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/for-developers">
                <Button size="lg" className="gap-2">
                  For developers <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary" size="lg">
                  Get in touch
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
