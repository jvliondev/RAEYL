import Link from "next/link";
import { ArrowRight, Check, Minus, Zap } from "lucide-react";

import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "For freelancers delivering clean, professional handoffs on smaller projects.",
    cta: "Start free trial",
    href: "/get-started",
    highlight: false,
    accentClass: "",
    features: [
      { label: "1 active wallet", ok: true },
      { label: "Up to 5 connected providers", ok: true },
      { label: "Owner handoff flow", ok: true },
      { label: "Billing visibility", ok: true },
      { label: "Edit routing", ok: true },
      { label: "30 AI assistant messages/mo", ok: true },
      { label: "Health monitoring", ok: false },
      { label: "Multi-user team access", ok: false },
      { label: "Partner program", ok: false },
      { label: "Admin controls", ok: false }
    ]
  },
  {
    name: "Growth",
    price: "$99",
    period: "/month",
    description: "For agencies managing multiple client websites with live monitoring and team collaboration.",
    cta: "Start free trial",
    href: "/get-started",
    highlight: true,
    accentClass: "card-accent-purple",
    features: [
      { label: "Up to 10 active wallets", ok: true },
      { label: "Unlimited connected providers", ok: true },
      { label: "Owner handoff flow", ok: true },
      { label: "Billing visibility", ok: true },
      { label: "Edit routing", ok: true },
      { label: "100 AI assistant messages/mo", ok: true },
      { label: "Health monitoring", ok: true },
      { label: "Multi-user team access", ok: true },
      { label: "Partner program", ok: false },
      { label: "Admin controls", ok: false }
    ]
  },
  {
    name: "Scale",
    price: "$249",
    period: "/month",
    description: "For larger agencies with partner networks, referral attribution, and advanced operational control.",
    cta: "Talk to us",
    href: "/contact",
    highlight: false,
    accentClass: "card-accent-cyan",
    features: [
      { label: "Unlimited active wallets", ok: true },
      { label: "Unlimited connected providers", ok: true },
      { label: "Owner handoff flow", ok: true },
      { label: "Billing visibility", ok: true },
      { label: "Edit routing", ok: true },
      { label: "Unlimited AI assistant messages", ok: true },
      { label: "Health monitoring", ok: true },
      { label: "Multi-user team access", ok: true },
      { label: "Partner program", ok: true },
      { label: "Admin controls", ok: true }
    ]
  }
];

const faqs = [
  {
    q: "What exactly is a wallet?",
    a: "A wallet is a single client website's control record — all connected providers, billing, editing paths, team access, and handoff history in one place. Each wallet maps to one website ownership context."
  },
  {
    q: "Is there a free trial?",
    a: "Yes. You get a 14-day free trial on Starter and Growth with no credit card required. Set up your first wallet, connect providers, and experience the full owner handoff before committing."
  },
  {
    q: "Do clients pay to access their wallet?",
    a: "No. Owners access their wallet for free, forever. RAEYL is a tool for the developer or agency building and handing off the site — not a fee charged to the client."
  },
  {
    q: "What counts as an AI assistant message?",
    a: "Each message a wallet owner or developer sends to the AI assistant counts as one. The assistant knows your specific setup — providers, costs, alerts — and responds in full context. Overage messages are $0.016 each."
  },
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Yes. Upgrades take effect immediately with prorated billing. Downgrades apply at the next billing cycle and your data stays intact."
  },
  {
    q: "Can an agency keep access after handoff?",
    a: "Yes. Developers can remain in the wallet with a controlled collaborator role after handing off to the owner. The owner gets their view, the developer keeps theirs."
  }
];

export default function PricingPage() {
  return (
    <>
      <MarketingHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-20">
          <div className="pointer-events-none absolute inset-0 hero-radial" />
          <div className="page-shell relative">
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">Pricing</p>
              <h1 className="display-heading text-5xl text-white sm:text-6xl">
                Simple, transparent
                <br />
                <span className="silver-text">pricing.</span>
              </h1>
              <div className="velocity-line mt-5" />
              <p className="mt-6 text-lg leading-8 text-white/50">
                No per-seat fees. No hidden limits. One plan for your whole agency,
                priced by the number of active client wallets you manage.
              </p>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="pb-24">
          <div className="page-shell">
            <div className="grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`surface ${plan.accentClass} relative flex flex-col rounded-2xl p-8`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                        <Zap className="h-3 w-3" />
                        Most popular
                      </span>
                    </div>
                  )}

                  <div className="mb-7">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                      {plan.name}
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="display-heading text-5xl text-white">{plan.price}</span>
                      <span className="text-sm text-white/30">{plan.period}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/45">{plan.description}</p>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3.5">
                    {plan.features.map((f) => (
                      <li key={f.label} className="flex items-center gap-3">
                        {f.ok ? (
                          <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" strokeWidth={2.5} />
                        ) : (
                          <Minus className="h-4 w-4 flex-shrink-0 text-white/15" />
                        )}
                        <span className={`text-sm ${f.ok ? "text-white/75" : "text-white/22"}`}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href}>
                    <Button
                      variant={plan.highlight ? "default" : "secondary"}
                      className="w-full gap-2"
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-white/25">
              14-day free trial on Starter and Growth · No credit card required to start
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-white/[0.05] py-24">
          <div className="page-shell">
            <div className="mb-14">
              <p className="eyebrow mb-3">Common questions</p>
              <h2 className="display-heading text-4xl text-white sm:text-5xl">
                Pricing, clearly explained.
              </h2>
              <div className="velocity-line mt-4" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
                >
                  <h3 className="mb-2.5 font-semibold text-white/90">{faq.q}</h3>
                  <p className="text-sm leading-7 text-white/45">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24">
          <div className="page-shell">
            <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0a0a0a] text-center">
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="px-8 py-20">
                <h2 className="display-heading text-4xl text-white sm:text-5xl">
                  Deliver better.
                  <br />
                  <span className="silver-text">Starting today.</span>
                </h2>
                <p className="mx-auto mt-5 max-w-md text-base text-white/45">
                  Start your free trial and set up your first wallet in under 10 minutes.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Link href="/get-started">
                    <Button size="lg" className="gap-2">
                      Create your first wallet <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="secondary" size="lg">
                      Talk to the team
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
