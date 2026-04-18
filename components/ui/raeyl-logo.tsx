import { cn } from "@/lib/utils";

/**
 * RaeylMark — chrome/titanium metallic R mark.
 *
 * Visual approach:
 *   - Multi-stop chrome gradients simulate curved reflective surfaces
 *     (bright specular → mid silver → deep shadow → rising back to chrome)
 *   - Separate highlight paths add the narrow bright streaks that make
 *     metal look like metal
 *   - A drop shadow gives 3-D depth
 *   - Subtle base glow echoes the environmental light in the reference
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
        {/* ── Chrome main body ──────────────────────────────────────
            Simulates a curved reflective surface lit from upper-left.
            Pattern: bright → mid → dark valley → rising → chrome ─── */}
        <linearGradient
          id="rl-chrome"
          x1="14" y1="10"
          x2="118" y2="162"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#f4f4f4" />
          <stop offset="10%"  stopColor="#d8d8d8" />
          <stop offset="28%"  stopColor="#909090" />
          <stop offset="46%"  stopColor="#2e2e2e" />
          <stop offset="62%"  stopColor="#4a4a4a" />
          <stop offset="78%"  stopColor="#8c8c8c" />
          <stop offset="92%"  stopColor="#c0c0c0" />
          <stop offset="100%" stopColor="#a8a8a8" />
        </linearGradient>

        {/* ── Chrome inner ribbon ────────────────────────────────────
            Catches light from the opposite angle — brighter at top    */}
        <linearGradient
          id="rl-ribbon"
          x1="52" y1="12"
          x2="34" y2="158"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="18%"  stopColor="#e8e8e8" />
          <stop offset="42%"  stopColor="#b4b4b4" />
          <stop offset="68%"  stopColor="#686868" />
          <stop offset="100%" stopColor="#848484" />
        </linearGradient>

        {/* ── Specular edge highlight ────────────────────────────────
            The narrow bright streak on the top/left edge of the stem  */}
        <linearGradient
          id="rl-spec"
          x1="18" y1="14"
          x2="18" y2="120"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="1" />
          <stop offset="35%"  stopColor="#e8e8e8" stopOpacity="0.85" />
          <stop offset="70%"  stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* ── Bowl specular ──────────────────────────────────────────
            Bright streak along the outer curve of the R bowl          */}
        <linearGradient
          id="rl-bowl-spec"
          x1="68" y1="14"
          x2="118" y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#f8f8f8" stopOpacity="0.9" />
          <stop offset="40%"  stopColor="#d0d0d0" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#888888" stopOpacity="0" />
        </linearGradient>

        {/* ── Counter (bowl interior) — deep recessed cavity ───────── */}
        <radialGradient
          id="rl-counter"
          cx="65%" cy="45%"
          r="55%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%"   stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#080808" />
        </radialGradient>

        {/* ── Subtle base glow ──────────────────────────────────────── */}
        <radialGradient
          id="rl-glow"
          cx="50%" cy="50%"
          r="50%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%"   stopColor="#c8c8c8" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* ── Drop shadow filter ─────────────────────────────────────── */}
        <filter id="rl-shadow" x="-15%" y="-10%" width="140%" height="140%">
          <feDropShadow
            dx="3" dy="5"
            stdDeviation="6"
            floodColor="#000000"
            floodOpacity="0.75"
          />
        </filter>
      </defs>

      {/* Ambient base glow */}
      <ellipse
        cx="65" cy="148"
        rx="52" ry="22"
        fill="url(#rl-glow)"
      />

      {/* Hard shadow — offset copy for depth */}
      <path
        d="M 18 158 L 18 14 L 68 14
           C 102 14 120 35 116 63
           C 113 86  97 101 75 105
           L 116 158 L 89 158
           L 53 107  L 40 107
           L 40 158 Z"
        fill="#000000"
        opacity="0.65"
        transform="translate(4 6)"
      />

      {/* ── Main chrome body ── */}
      <g filter="url(#rl-shadow)">
        <path
          d="M 18 158 L 18 14 L 68 14
             C 102 14 120 35 116 63
             C 113 86  97 101 75 105
             L 116 158 L 89 158
             L 53 107  L 40 107
             L 40 158 Z"
          fill="url(#rl-chrome)"
        />

        {/* Counter — dark interior of the bowl */}
        <path
          d="M 40 32 L 40 89
             C 60 94  90 88  95 63
             C 100 37 68 30  40 32 Z"
          fill="url(#rl-counter)"
        />

        {/* Inner ribbon — the bright chrome strip */}
        <path
          d="M 14 14 C 18 8 26 8 34 11
             L 34 108 L 72 158 L 90 158
             L 52 108 L 52 13
             C 42 10 16 10 14 14 Z"
          fill="url(#rl-ribbon)"
          opacity="0.92"
        />
      </g>

      {/* ── Specular highlight — left stem edge ── */}
      <path
        d="M 18 14 L 22 14 L 22 130 C 22 144 20 154 18 158 Z"
        fill="url(#rl-spec)"
      />

      {/* ── Specular highlight — outer bowl curve ── */}
      <path
        d="M 68 14 C 90 14 108 22 116 38 C 120 26 108 14 90 14 L 68 14 Z"
        fill="url(#rl-bowl-spec)"
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
        className="text-[13px] font-bold tracking-[0.3em] text-white/85"
        style={{ fontFamily: "var(--font-display), var(--font-inter), system-ui" }}
      >
        RAEYL
      </span>
    </span>
  );
}
