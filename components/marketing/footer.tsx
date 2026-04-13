import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="page-shell grid gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <div className="text-sm font-semibold tracking-[0.22em]">RAEYL</div>
          <p className="text-sm text-muted">
            The ownership wallet and control rail for modern websites.
          </p>
        </div>
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">Product</div>
          <div className="space-y-2 text-sm text-muted">
            <Link href="/product" className="block hover:text-foreground">Product</Link>
            <Link href="/how-it-works" className="block hover:text-foreground">How it works</Link>
            <Link href="/pricing" className="block hover:text-foreground">Pricing</Link>
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">Audience</div>
          <div className="space-y-2 text-sm text-muted">
            <Link href="/for-owners" className="block hover:text-foreground">For owners</Link>
            <Link href="/for-developers" className="block hover:text-foreground">For developers</Link>
            <Link href="/security" className="block hover:text-foreground">Security</Link>
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">Company</div>
          <div className="space-y-2 text-sm text-muted">
            <Link href="/faq" className="block hover:text-foreground">FAQ</Link>
            <Link href="/contact" className="block hover:text-foreground">Contact</Link>
            <Link href="/sign-in" className="block hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
