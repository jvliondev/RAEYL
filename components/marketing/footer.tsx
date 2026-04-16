import Link from "next/link";

import { RaeylLogo } from "@/components/ui/raeyl-logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-14">
      <div className="page-shell grid gap-10 md:grid-cols-4">
        <div className="space-y-4">
          <RaeylLogo markClassName="h-7" />
          <p className="text-sm leading-6 text-muted">
            The ownership wallet and control rail for modern websites.
          </p>
        </div>
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/60">Product</div>
          <div className="space-y-2 text-sm text-muted">
            <Link href="/product" className="block transition hover:text-foreground">Product</Link>
            <Link href="/how-it-works" className="block transition hover:text-foreground">How it works</Link>
            <Link href="/pricing" className="block transition hover:text-foreground">Pricing</Link>
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/60">Audience</div>
          <div className="space-y-2 text-sm text-muted">
            <Link href="/for-owners" className="block transition hover:text-foreground">For owners</Link>
            <Link href="/for-developers" className="block transition hover:text-foreground">For developers</Link>
            <Link href="/security" className="block transition hover:text-foreground">Security</Link>
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/60">Company</div>
          <div className="space-y-2 text-sm text-muted">
            <Link href="/faq" className="block transition hover:text-foreground">FAQ</Link>
            <Link href="/contact" className="block transition hover:text-foreground">Contact</Link>
            <Link href="/sign-in" className="block transition hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </div>
      <div className="page-shell mt-10 border-t border-white/[0.05] pt-6">
        <p className="text-xs text-muted/50">
          © {new Date().getFullYear()} RAEYL. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
