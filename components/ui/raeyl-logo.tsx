import { cn } from "@/lib/utils";

/**
 * RaeylMark — matches the provided brand logo.
 *
 * 3-layer ribbon R:
 *   Layer 1 (back):  dark navy depth shadow, offset to create dimension
 *   Layer 2 (main):  purple/violet gradient — the primary visible face
 *   Layer 3 (front): cyan/teal inner strip — bright accent along the inner curve
 *   + inner counter: recessed dark cavity in the bowl of the R
 */
export function RaeylMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 130 172"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-auto", className)}
      aria-hidden="true"
    >
      <defs>
        {/* Purple/violet main face — light from upper-left */}
        <linearGradient
          id="rl-purple"
          x1="15" y1="10"
          x2="115" y2="165"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#c084fc" />
          <stop offset="40%"  stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>

        {/* Cyan inner ribbon */}
        <linearGradient
          id="rl-cyan"
          x1="15" y1="165"
          x2="90"  y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>

        {/* Dark navy inner counter */}
        <linearGradient
          id="rl-navy"
          x1="95" y1="25"
          x2="38"  y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#0f0e2a" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
      </defs>

      {/* ── Layer 1: Navy depth shadow (offset back) ── */}
      <path
        d="M 18 158 L 18 14 L 68 14
           C 102 14 120 35 116 63
           C 113 86  97 101 75 105
           L 116 158 L 89 158
           L 53 107  L 40 107
           L 40 158 Z"
        fill="#1e1b4b"
        transform="translate(5 6)"
        opacity="0.85"
      />

      {/* ── Layer 2: Purple main body ── */}
      <path
        d="M 18 158 L 18 14 L 68 14
           C 102 14 120 35 116 63
           C 113 86  97 101 75 105
           L 116 158 L 89 158
           L 53 107  L 40 107
           L 40 158 Z"
        fill="url(#rl-purple)"
      />

      {/* ── Inner counter (the bowl of R) ── */}
      <path
        d="M 40 32 L 40 89
           C 60 94  90 88  95 63
           C 100 37  68 30  40 32 Z"
        fill="url(#rl-navy)"
      />

      {/* ── Layer 3: Cyan inner ribbon strip ── */}
      <path
        d="M 14 14 C 18 8 26 8 34 11
           L 34 108 L 72 158 L 90 158
           L 52 108 L 52 13
           C 42 10 16 10 14 14 Z"
        fill="url(#rl-cyan)"
        opacity="0.9"
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
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <RaeylMark className={cn("h-7 w-auto flex-shrink-0", markClassName)} />
      <span
        className="text-sm font-bold tracking-[0.25em] text-white/90"
        style={{ fontFamily: "var(--font-display), var(--font-inter), system-ui" }}
      >
        RAEYL
      </span>
    </span>
  );
}
