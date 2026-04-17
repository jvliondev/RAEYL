import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        /* Metallic silver — the premium primary CTA */
        default: "btn-metal",
        /* Dark graphite with silver border — secondary */
        secondary: "btn-ghost-silver",
        /* Transparent — ghost */
        ghost: "text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-colors",
        /* Accent blue — used only for active/confirmation states */
        accent: "bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent/90",
        /* Destructive */
        danger: "bg-destructive text-white hover:bg-destructive/90"
      },
      size: {
        sm:      "h-8  px-3.5 text-xs  rounded-md",
        default: "h-10 px-5",
        lg:      "h-12 px-7  text-base rounded-xl"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
