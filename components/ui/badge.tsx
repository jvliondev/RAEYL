import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide",
  {
    variants: {
      variant: {
        neutral: "border border-white/[0.09] bg-white/[0.05] text-white/65",
        success: "border border-success/20 bg-success/10 text-success",
        warning: "border border-warning/20 bg-warning/10 text-warning",
        danger:  "border border-destructive/20 bg-destructive/10 text-destructive",
        accent:  "border border-accent/20 bg-accent/10 text-accent"
      }
    },
    defaultVariants: {
      variant: "neutral"
    }
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
