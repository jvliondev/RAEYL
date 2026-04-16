import Link from "next/link";

import { RaeylLogo } from "@/components/ui/raeyl-logo";
import { Button } from "@/components/ui/button";
import { marketingNav } from "@/lib/constants";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex-shrink-0">
          <RaeylLogo markClassName="h-7" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:bg-white/[0.05] hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-muted transition hover:text-foreground">
            Sign in
          </Link>
          <Link href="/get-started">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
