import Link from "next/link";
import { ArrowRight, Building2, HelpCircle, MessageSquare, Users } from "lucide-react";

import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { Button } from "@/components/ui/button";

const channels = [
  {
    icon: MessageSquare,
    title: "General questions",
    description:
      "Ask about product fit, how RAEYL works for your specific situation, or whether it makes sense for the kind of work you deliver.",
    action: "hello@raeyl.com",
    href: "mailto:hello@raeyl.com",
    accent: "card-accent-purple",
    iconClass: "text-violet-400",
    iconBgClass: "border-violet-500/25 bg-violet-500/[0.07]"
  },
  {
    icon: Building2,
    title: "Agency partnerships",
    description:
      "Discuss the partner program, referral attribution, volume pricing, or how RAEYL fits into your agency's delivery process at scale.",
    action: "agencies@raeyl.com",
    href: "mailto:agencies@raeyl.com",
    accent: "card-accent-cyan",
    iconClass: "text-cyan-400",
    iconBgClass: "border-cyan-500/25 bg-cyan-500/[0.07]"
  },
  {
    icon: HelpCircle,
    title: "Platform support",
    description:
      "Review setup guidance, billing questions, account access, or anything that isn't working the way it should.",
    action: "support@raeyl.com",
    href: "mailto:support@raeyl.com",
    accent: "card-accent-amber",
    iconClass: "text-amber-400",
    iconBgClass: "border-amber-500/25 bg-amber-500/[0.07]"
  },
  {
    icon: Users,
    title: "Press and media",
    description:
      "Writing about the developer handoff space, website ownership, or tools for modern web agencies? We'd be glad to help.",
    action: "press@raeyl.com",
    href: "mailto:press@raeyl.com",
    accent: "card-accent-emerald",
    iconClass: "text-emerald-400",
    iconBgClass: "border-emerald-500/25 bg-emerald-500/[0.07]"
  }
];

export default function ContactPage() {
  return (
    <>
      <MarketingHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-20">
          <div className="pointer-events-none absolute inset-0 hero-radial" />
          <div className="page-shell relative">
            <div className="max-w-xl">
              <p className="eyebrow mb-4">Contact</p>
              <h1 className="display-heading text-5xl text-white sm:text-6xl">
                Talk with
                <br />
                <span className="silver-text">RAEYL.</span>
              </h1>
              <div className="velocity-line mt-5" />
              <p className="mt-6 text-lg leading-8 text-white/50">
                We respond to every message, usually within one business day.
                Reach out through whichever channel fits your question best.
              </p>
            </div>
          </div>
        </section>

        {/* Contact channels */}
        <section className="pb-24">
          <div className="page-shell grid gap-5 sm:grid-cols-2">
            {channels.map((ch) => (
              <div key={ch.title} className={`surface ${ch.accent} flex flex-col rounded-2xl p-7`}>
                <div className={`mb-5 inline-flex rounded-xl border p-3 ${ch.iconBgClass}`}>
                  <ch.icon className={`h-5 w-5 ${ch.iconClass}`} strokeWidth={1.5} />
                </div>
                <h2 className="mb-2 text-lg font-semibold text-white/90">{ch.title}</h2>
                <p className="mb-6 flex-1 text-sm leading-7 text-white/45">{ch.description}</p>
                <a
                  href={ch.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white/90"
                >
                  {ch.action}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Quick links */}
        <section className="border-t border-white/[0.05] py-20">
          <div className="page-shell">
            <p className="mb-8 text-sm text-white/30">Before reaching out, you might find your answer here:</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "FAQ", href: "/faq" },
                { label: "Pricing", href: "/pricing" },
                { label: "For developers", href: "/for-developers" },
                { label: "For owners", href: "/for-owners" },
                { label: "How it works", href: "/how-it-works" }
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-sm text-white/50 transition hover:border-white/[0.15] hover:text-white/80"
                >
                  {link.label} →
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
