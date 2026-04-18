import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-white/[0.09] bg-white/[0.03] px-3.5 py-2",
        "text-sm text-white/90 placeholder:text-white/25",
        "outline-none transition-all duration-150",
        "focus:border-white/20 focus:bg-white/[0.05] focus:ring-2 focus:ring-white/[0.07]",
        "hover:border-white/[0.13]",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
