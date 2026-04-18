import { cn } from "@/lib/utils";

/**
 * RaeylMark — minimal geometric R mark.
 * Single-weight monoline stroke, clean round caps.
 * No gradients, no chrome simulation — just a confident letterform.
 */
export function RaeylMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-auto", className)}
      aria-hidden="true"
    >
      <path
        d="M 12 68 L 12 8 L 36 8 C 52 8 52 48 36 48 L 12 48 M 34 48 L 50 68"
        stroke="white"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function RaeylLogo({
  className,
  markClassName
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <RaeylMark className={cn("h-7 w-auto flex-shrink-0", markClassName)} />
      <span
        className="text-[12px] font-semibold tracking-[0.32em] text-white/80"
        style={{ fontFamily: "var(--font-display), var(--font-inter), system-ui" }}
      >
        RAEYL
      </span>
    </span>
  );
}
