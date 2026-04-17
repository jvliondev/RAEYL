import Link from "next/link";

import { RaeylLogo } from "@/components/ui/raeyl-logo";
import { Button } from "@/components/ui/button";
import { marketingNav } from "@/lib/constants";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.05] bg-background/90 backdrop-blur-xl">
      {/* Subtle top chrome line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="page-shell flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex-shrink-0 transition-opacity hover:opacity-80">
          <RaeylLogo markClassName="h-6" />
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/80"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-white/40 transition-colors hover:text-white/70"
          >
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
