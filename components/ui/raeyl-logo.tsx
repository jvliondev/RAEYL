import { cn } from "@/lib/utils";

/**
 * RaeylMark
 * Precision-machined titanium "R" symbol.
 *
 * Light model: source at upper-left ~40°.
 *   – Main face:  bright silver (upper-left) → mid graphite → deep shadow (lower-right) → subtle bounce-light
 *   – Chrome lip: thin bright edge along the lit side
 *   – Cool tint:  faint blue-white reflection on the inner ribbon (steel in shade)
 *   – Counter:    recessed dark cavity with subtle gradient
 *   – Shadow:     blurred cast shadow behind the form
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
        {/* ── Main face: light from upper-left, shadow lower-right, bounce light ── */}
        <linearGradient
          id="rm-face"
          x1="15" y1="10"
          x2="115" y2="165"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#d8d8d8" />
          <stop offset="22%"  stopColor="#a0a0a0" />
          <stop offset="55%"  stopColor="#3c3c3c" />
          <stop offset="80%"  stopColor="#525252" /> {/* bounce light */}
          <stop offset="100%" stopColor="#1c1c1c" />
        </linearGradient>

        {/* ── Chrome lip: bright highlight on the lit left/top edge ── */}
        <linearGradient
          id="rm-chrome"
          x1="15" y1="10"
          x2="45" y2="162"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#f4f4f4" />
          <stop offset="35%"  stopColor="#d0d0d0" />
          <stop offset="70%"  stopColor="#707070" />
          <stop offset="100%" stopColor="#303030" stopOpacity="0" />
        </linearGradient>

        {/* ── Cool tint: the inner ribbon reads as steel in shade ── */}
        <linearGradient
          id="rm-cool"
          x1="15" y1="162"
          x2="90" y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#7aaeff" stopOpacity="0.22" />
          <stop offset="60%"  stopColor="#b8d0ff" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#dceeff" stopOpacity="0.05" />
        </linearGradient>

        {/* ── Counter cavity ── */}
        <linearGradient
          id="rm-counter"
          x1="95" y1="30"
          x2="38" y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#040404" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>

        {/* ── Specular hotspot (small oval at the top-left corner) ── */}
        <radialGradient
          id="rm-spec"
          cx="28" cy="18"
          r="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* ── Drop-shadow filter ── */}
        <filter id="rm-shadow" x="-25%" y="-15%" width="150%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
          <feOffset dx="5" dy="8" result="offsetBlur" />
          <feComposite in="offsetBlur" in2="SourceAlpha" operator="out" result="shadow" />
          <feFlood floodColor="#000000" floodOpacity="0.7" result="color" />
          <feComposite in="color" in2="shadow" operator="in" result="coloredShadow" />
          <feMerge>
            <feMergeNode in="coloredShadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Render group with drop shadow ── */}
      <g filter="url(#rm-shadow)">

        {/* 1. Main R body — metallic face gradient */}
        <path
          d="M 18 158 L 18 14 L 68 14
             C 102 14 120 35 116 63
             C 113 86  97 101 75 105
             L 116 158 L 89 158
             L 53 107  L 40 107
             L 40 158 Z"
          fill="url(#rm-face)"
        />

        {/* 2. Inner counter — recessed dark cavity */}
        <path
          d="M 40 32 L 40 89
             C 60 94  90 88  95 63
             C 100 37  68 30  40 32 Z"
          fill="url(#rm-counter)"
        />

        {/* 3. Chrome lip — thin bright strip on lit left/inner edge */}
        <path
          d="M 14 14 C 18 8 26 8 34 11
             L 34 108 L 72 158 L 90 158
             L 52 108 L 52 13
             C 42 10 16 10 14 14 Z"
          fill="url(#rm-chrome)"
          opacity="0.92"
        />

        {/* 4. Cool tint overlay on the chrome strip */}
        <path
          d="M 14 14 C 18 8 26 8 34 11
             L 34 108 L 72 158 L 90 158
             L 52 108 L 52 13
             C 42 10 16 10 14 14 Z"
          fill="url(#rm-cool)"
        />

        {/* 5. Specular hotspot — top-left corner brightest point */}
        <path
          d="M 18 14 L 68 14
             C 102 14 120 35 116 63
             C 113 86  97 101 75 105
             L 116 158 L 89 158
             L 53 107  L 40 107
             L 40 158  L 18 158 Z"
          fill="url(#rm-spec)"
        />

      </g>
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
