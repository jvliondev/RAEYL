"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  exact?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function NavLink({ href, exact = false, children, className }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-all duration-150",
        isActive
          ? "bg-white/[0.08] font-medium text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "text-white/50 hover:bg-white/[0.04] hover:text-white/80",
        className
      )}
    >
      {/* Active indicator pill */}
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
          style={{
            height: "55%",
            background: "linear-gradient(to bottom, #8b5cf6, #06b6d4)"
          }}
        />
      )}
      {children}
    </Link>
  );
}
