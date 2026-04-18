import * as React from "react";

import { cn } from "@/lib/utils";

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-lg border border-white/[0.09] bg-[#0d0d0d] px-3.5 py-2",
        "text-sm text-white/90 outline-none transition-all duration-150",
        "focus:border-white/20 focus:ring-2 focus:ring-white/[0.07]",
        "hover:border-white/[0.13]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
