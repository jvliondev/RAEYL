import Link from "next/link";

import { Button } from "@/components/ui/button";
import { marketingNav } from "@/lib/constants";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center justify-between gap-6">
        <Link href="/" className="text-sm font-semibold tracking-[0.22em] text-foreground">
          RAEYL
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {marketingNav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-muted transition hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-muted transition hover:text-foreground">
            Sign in
          </Link>
          <Link href="/get-started">
            <Button>Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
