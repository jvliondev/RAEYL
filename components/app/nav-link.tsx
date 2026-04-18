"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  exact?: boolean;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
}

export function NavLink({ href, exact = false, children, className, activeClassName }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
        isActive
          ? cn("bg-white/[0.07] text-foreground font-medium", activeClassName)
          : "text-muted hover:bg-white/[0.05] hover:text-foreground",
        className
      )}
    >
      {children}
    </Link>
  );
}
