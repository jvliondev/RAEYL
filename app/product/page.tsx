import Link from "next/link";
import { ArrowRight, Bell, Bot, CreditCard, FileText, Globe, Handshake, Lock, Shield, Zap } from "lucide-react";

import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Globe,
    title: "Provider connections",
    headline: "Every service behind the site, in one record.",
    description:
      "Connect hosting, CMS, domain registrars, payment processors, email tools, analytics, and more. Use live OAuth verification for supported providers, or add manual records for anything else. Each provider gets an owner-friendly explanation that stays on the record.",
    accent: "card-accent-purple",
    iconClass: "text-violet-400",
    iconBgClass: "border-violet-500/25 bg-violet-500/[0.07]",
    tags: ["Vercel", "Sanity", "Stripe", "GoDaddy", "Cloudflare", "Postmark", "+ more"]
  },
  {
    icon: FileText,
    title: "Edit routing",
    headline: "One click to the right place — every time.",
    description:
      "Set up named edit paths that take owners directly to the correct editing destination for their site. No more hunting through dashboards. The primary edit path becomes the first thing owners see when they log in.",
    accent: "card-accent-cyan",
    iconClass: "text-cyan-400",
    iconBgClass: "border-cyan-500/25 bg-cyan-500/[0.07]",
    tags: ["Primary edit path", "Multi-path routing", "CMS setup", "Role-based visibility"]
  },
  {
    icon: Handshake,
    title: "Owner handoff",
    headline: "A professional ownership experience — not a Notion doc.",
    description:
      "Send a secure invite to the business owner. They click once and land in a clean view of their wallet — with provider context, billing visibility, edit paths, and support access — in plain language, designed for non-technical users.",
    accent: "card-accent-amber",
    iconClass: "text-amber-400",
    iconBgClass: "border-amber-500/25 bg-amber-500/[0.07]",
    tags: ["Secure invite tokens", "Role-based views", "Handoff history", "Completion tracking"]
  },
  {
    icon: CreditCard,
    title: "Billing visibility",
    headline: "All website costs. One view.",
    description:
      "Track what each connected service costs and when it renews. Add manual billing records alongside live provider data. Owners see the total cost of running their site without needing to check five different provider dashboards.",
    accent: "card-accent-emerald",
    iconClass: "text-emerald-400",
    iconBgClass: "border-emerald-500/25 bg-emerald-500/[0.07]",
    tags: ["Monthly totals", "Per-provider costs", "Renewal dates", "Billing links"]
  },
  {
    icon: Bell,
    title: "Health monitoring & alerts",
    headline: "Problems surface before they escalate.",
    description:
      "RAEYL watches for expiring renewals, disconnected providers, incomplete handoffs, and missing edit paths — automatically. Alerts appear in the wallet with a clear recommendation before anything becomes an emergency.",
    accent: "card-accent-purple",
    iconClass: "text-violet-400",
    iconBgClass: "border-violet-500/25 bg-violet-500/[0.07]",
    tags: ["Domain expiry", "Provider disconnects", "Billing sync", "Handoff reminders"]
  },
  {
    icon: Bot,
    title: "AI assistant",
    headline: "Ask anything. Get context-aware answers.",
    description:
      "The AI assistant knows your specific wallet — which providers are connected, what alerts are open, what the edit paths are — and responds accordingly. Owners can ask 'how do I update my homepage?' and get an answer that actually maps to their setup.",
    accent: "card-accent-cyan",
    iconClass: "text-cyan-400",
    iconBgClass: "border-cyan-500/25 bg-cyan-500/[0.07]",
    tags: ["Role-aware persona", "Wallet context", "Monthly usage tracking", "Conversation history"]
  },
  {
    icon: Shield,
    title: "Team access control",
    headline: "The right access for every person.",
    description:
      "Invite collaborators with specific roles — from full developer access to billing-only or view-only. Owners control who can do what. Every access change is logged in the audit trail.",
    accent: "card-accent-amber",
    iconClass: "text-amber-400",
    iconBgClass: "border-amber-500/25 bg-amber-500/[0.07]",
    tags: ["7 role types", "Capability matrix", "Invite flow", "Transfer ownership"]
  },
  {
    icon: Lock,
    title: "Security & audit",
    headline: "Enterprise-grade under the hood.",
    description:
      "Credentials are encrypted with AES-256-GCM. Every action — provider changes, team updates, handoff completions — is logged with actor, timestamp, and metadata. RAEYL is built for auditable, trustworthy ownership.",
    accent: "card-accent-emerald",
    iconClass: "text-emerald-400",
    iconBgClass: "border-emerald-500/25 bg-emerald-500/[0.07]",
    tags: ["AES-256-GCM", "Full audit log", "Session tracking", "Secure tokens"]
  }
];

export default function ProductPage() {
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
              <p className="eyebrow mb-4">Product</p>
              <h1 className="display-heading text-5xl text-white sm:text-6xl xl:text-7xl">
                The ownership layer
                <br />
                <span className="silver-text">for modern websites.</span>
              </h1>
              <div className="velocity-line mt-5" />
              <p className="mt-6 text-lg leading-8 text-white/50">
                RAEYL turns a finished website stack into a calm, trusted control
                center for the business owner after the build is complete. Here&apos;s
                everything that makes it work.
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

        {/* Features */}
        <section className="border-t border-white/[0.05] pb-24">
          <div className="page-shell space-y-6 pt-16">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`surface ${f.accent} overflow-hidden rounded-2xl`}
              >
                <div className={`grid gap-0 ${i % 2 === 0 ? "lg:grid-cols-[1fr_380px]" : "lg:grid-cols-[380px_1fr]"}`}>
                  <div className={`p-8 lg:p-10 ${i % 2 !== 0 ? "lg:order-2" : ""}`}>
                    <div className="mb-5 flex items-center gap-3">
                      <div className={`inline-flex rounded-xl border p-2.5 ${f.iconBgClass}`}>
                        <f.icon className={`h-4 w-4 ${f.iconClass}`} strokeWidth={1.5} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                        {f.title}
                      </span>
                    </div>
                    <h2 className="mb-3 text-2xl font-semibold text-white/90">{f.headline}</h2>
                    <p className="text-sm leading-7 text-white/50">{f.description}</p>
                  </div>
                  <div
                    className={`flex flex-col justify-center gap-2.5 border-white/[0.05] p-8 lg:p-10 ${
                      i % 2 !== 0
                        ? "lg:order-1 lg:border-r"
                        : "lg:border-l"
                    } border-t lg:border-t-0`}
                  >
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                      What&apos;s included
                    </p>
                    {f.tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2"
                      >
                        <div className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${f.iconClass}`} />
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
              Ready to use it?
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base text-white/45">
              Start a free trial and set up your first wallet in under 10 minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/get-started">
                <Button size="lg" className="gap-2">
                  Get started free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary" size="lg">See pricing</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
