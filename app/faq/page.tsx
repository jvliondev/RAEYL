import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { Button } from "@/components/ui/button";

const faqCategories = [
  {
    category: "What RAEYL is",
    accent: "card-accent-purple",
    questions: [
      {
        q: "What is RAEYL?",
        a: "RAEYL is a website ownership management platform. It gives website owners a clear, organized view of every tool, cost, and editing path connected to their site — and gives developers a structured way to hand that over professionally. It is not a website builder, hosting service, or CMS."
      },
      {
        q: "Who is RAEYL for?",
        a: "RAEYL is primarily used by web developers and digital agencies who build websites for business clients. The developers set up and manage the wallets; the business owners receive access and use RAEYL to understand and operate their site."
      },
      {
        q: "Does RAEYL replace my CMS, hosting, or any existing tool?",
        a: "No. RAEYL sits alongside your existing stack. It connects to Vercel, Sanity, WordPress, Stripe, GoDaddy, and dozens of other providers — but it does not replace any of them. Think of it as the control layer that explains and connects everything else."
      }
    ]
  },
  {
    category: "For owners",
    accent: "card-accent-cyan",
    questions: [
      {
        q: "Do I need technical knowledge to use RAEYL?",
        a: "No. Every part of the owner experience is written in plain language. You see what each tool does, what it costs, and where to go when you need to make a change — without needing to understand any of the technical infrastructure."
      },
      {
        q: "What happens after my developer hands off the site?",
        a: "You receive a secure invite link. One click and you land in your own clean view of the wallet — with all the provider context, billing visibility, editing paths, and alerts your developer set up for you. The wallet is yours."
      },
      {
        q: "Can my developer still have access after handoff?",
        a: "Yes. Developers can remain in the wallet with a collaborator role even after handoff. They keep their technical view, you keep your ownership view. The relationship continues — just with proper access control."
      },
      {
        q: "What if the developer I worked with is no longer around?",
        a: "The wallet remains yours and stays fully accessible. A new developer can be added to the wallet with collaborator access, and can pick up exactly where the last one left off — all the provider context is already there."
      }
    ]
  },
  {
    category: "For developers",
    accent: "card-accent-amber",
    questions: [
      {
        q: "How long does it take to set up a wallet?",
        a: "A complete wallet — with provider connections, billing records, edit routes, and a handoff invite — typically takes 30–60 minutes. For repeat clients or standard stacks, templated setup makes it faster."
      },
      {
        q: "What providers can I connect?",
        a: "RAEYL supports a broad catalog including Vercel, Netlify, Webflow, Sanity, WordPress, Contentful, Stripe, GoDaddy, Cloudflare, Postmark, Resend, Mailchimp, Supabase, Firebase, and dozens more. Custom tools can be added manually with any details you choose."
      },
      {
        q: "Can I connect via OAuth or do I have to enter things manually?",
        a: "Both. Supported providers like Vercel can be connected via OAuth for live verification and health monitoring. Others can be added as manual records with description, billing, and links — which still gives owners full visibility."
      }
    ]
  },
  {
    category: "Billing and accounts",
    accent: "card-accent-emerald",
    questions: [
      {
        q: "Does RAEYL manage my provider billing?",
        a: "No. RAEYL tracks and summarizes your website costs and links to the right billing page for each provider — but it does not collect, process, or replace any billing. Your Vercel invoice still goes to you; RAEYL just shows it in one place."
      },
      {
        q: "Do clients pay to use RAEYL?",
        a: "No. Business owners access their wallet for free, forever. RAEYL is billed to the developer or agency setting up and managing the wallets — not to the client."
      },
      {
        q: "What happens to the wallet if I cancel my subscription?",
        a: "Wallets become read-only — you and the owner can still view all the information, but no new connections or updates can be made. Data is retained for 90 days after cancellation before being removed."
      }
    ]
  }
];

export default function FaqPage() {
  return (
    <>
      <MarketingHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-20">
          <div className="pointer-events-none absolute inset-0 hero-radial" />
          <div className="page-shell relative">
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">FAQ</p>
              <h1 className="display-heading text-5xl text-white sm:text-6xl">
                Straight answers
                <br />
                <span className="silver-text">about RAEYL.</span>
              </h1>
              <div className="velocity-line mt-5" />
              <p className="mt-6 text-lg leading-8 text-white/50">
                RAEYL is not a website builder, hosting platform, or CMS replacement.
                It is the control layer that helps owners understand and operate the
                stack they already have.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="pb-24">
          <div className="page-shell space-y-10">
            {faqCategories.map((cat) => (
              <div key={cat.category}>
                <div className={`surface ${cat.accent} mb-5 flex items-center gap-3 rounded-xl px-5 py-3.5`}>
                  <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">
                    {cat.category}
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.questions.map((item) => (
                    <div
                      key={item.q}
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
                    >
                      <h3 className="mb-3 font-semibold text-white/90">{item.q}</h3>
                      <p className="text-sm leading-7 text-white/45">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/[0.05] py-24">
          <div className="page-shell grid gap-8 lg:grid-cols-2">
            <div className="surface card-accent-purple rounded-2xl p-8">
              <h3 className="mb-2 text-lg font-semibold text-white/90">Still have questions?</h3>
              <p className="mb-6 text-sm leading-7 text-white/45">
                Reach out and someone from the team will get back to you. We&apos;re happy
                to walk through specific use cases or help figure out the right plan.
              </p>
              <Link href="/contact">
                <Button className="gap-2">
                  Talk to us <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="surface card-accent-cyan rounded-2xl p-8">
              <h3 className="mb-2 text-lg font-semibold text-white/90">Ready to try it?</h3>
              <p className="mb-6 text-sm leading-7 text-white/45">
                Start a free trial, set up your first wallet, and experience the full
                handoff flow before committing. No credit card required.
              </p>
              <Link href="/get-started">
                <Button className="gap-2">
                  Start free <ArrowRight className="h-4 w-4" />
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
