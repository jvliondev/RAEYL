import Link from "next/link";

import { RaeylLogo } from "@/components/ui/raeyl-logo";

const links = {
  Product: [
    { href: "/product",     label: "Product" },
    { href: "/how-it-works",label: "How it works" },
    { href: "/pricing",     label: "Pricing" }
  ],
  Audience: [
    { href: "/for-owners",     label: "For owners" },
    { href: "/for-developers", label: "For developers" },
    { href: "/security",       label: "Security" }
  ],
  Company: [
    { href: "/faq",     label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/sign-in", label: "Sign in" }
  ]
};

export function MarketingFooter() {
  return (
    <footer className="relative border-t border-white/[0.05] py-16">
      {/* Top chrome line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      <div className="page-shell">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="space-y-4">
            <RaeylLogo markClassName="h-6" />
            <p className="max-w-xs text-sm leading-6 text-white/30">
              The ownership wallet and control rail for modern websites.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group} className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                {group}
              </p>
              <div className="space-y-2">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block text-sm text-white/35 transition-colors hover:text-white/65"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/[0.05] pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} RAEYL. All rights reserved.
          </p>
          <p className="text-xs text-white/15">
            Built for the people who own the web.
          </p>
        </div>
      </div>
    </footer>
  );
}
