import { cn } from "@/lib/utils";

/**
 * RaeylMark — chrome/titanium metallic R mark.
 *
 * Shape matches reference: large circular bowl, slightly curved spine,
 * diagonal leg extending right, three visible chrome bands/surfaces.
 *
 * Chrome technique:
 *   bright specular peak → silver → dark shadow valley → rising chrome
 *   (classic "chrome tube" multi-stop gradient pattern)
 *   + separate highlight paths for the narrow specular edge streaks
 */
export function RaeylMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 165"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-auto", className)}
      aria-hidden="true"
    >
      <defs>
        {/* ── Main body chrome ─────────────────────────────────────────
            Diagonal light: upper-left → lower-right
            bright → silver → dark valley → rising → chrome             */}
        <linearGradient
          id="rl-body"
          x1="16" y1="8"
          x2="124" y2="158"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#efefef" />
          <stop offset="8%"   stopColor="#d6d6d6" />
          <stop offset="22%"  stopColor="#a0a0a0" />
          <stop offset="40%"  stopColor="#3c3c3c" />
          <stop offset="55%"  stopColor="#1a1a1a" />
          <stop offset="70%"  stopColor="#5a5a5a" />
          <stop offset="84%"  stopColor="#9e9e9e" />
          <stop offset="100%" stopColor="#b8b8b8" />
        </linearGradient>

        {/* ── Inner ribbon / bright chrome strip ───────────────────────
            Lit from the opposite angle — bright at top, fading down     */}
        <linearGradient
          id="rl-ribbon"
          x1="54" y1="10"
          x2="36" y2="155"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="15%"  stopColor="#ebebeb" />
          <stop offset="38%"  stopColor="#c0c0c0" />
          <stop offset="62%"  stopColor="#848484" />
          <stop offset="85%"  stopColor="#686868" />
          <stop offset="100%" stopColor="#909090" />
        </linearGradient>

        {/* ── Top-arc specular streak ───────────────────────────────────
            The narrow bright line along the outer curve peak            */}
        <linearGradient
          id="rl-arc-spec"
          x1="60" y1="8"
          x2="124" y2="65"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="50%"  stopColor="#e8e8e8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#b0b0b0" stopOpacity="0" />
        </linearGradient>

        {/* ── Stem edge specular ────────────────────────────────────────
            Bright vertical streak on the left spine                     */}
        <linearGradient
          id="rl-stem-spec"
          x1="20" y1="8"
          x2="20" y2="110"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="30%"  stopColor="#e0e0e0" stopOpacity="0.75" />
          <stop offset="65%"  stopColor="#c0c0c0" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#808080" stopOpacity="0" />
        </linearGradient>

        {/* ── Counter interior — deep recessed cavity ──────────────────  */}
        <radialGradient
          id="rl-counter"
          cx="58%" cy="42%"
          r="54%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%"   stopColor="#1c1c1c" />
          <stop offset="60%"  stopColor="#111111" />
          <stop offset="100%" stopColor="#060606" />
        </radialGradient>

        {/* ── Ambient base glow (environmental light below mark) ───────  */}
        <radialGradient
          id="rl-glow"
          cx="50%" cy="50%"
          r="50%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%"   stopColor="#c8c8c8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* ── Drop shadow ───────────────────────────────────────────────  */}
        <filter id="rl-shadow" x="-18%" y="-12%" width="145%" height="145%">
          <feDropShadow
            dx="3" dy="6"
            stdDeviation="7"
            floodColor="#000000"
            floodOpacity="0.72"
          />
        </filter>
      </defs>

      {/* Ambient glow at base */}
      <ellipse cx="70" cy="150" rx="56" ry="18" fill="url(#rl-glow)" />

      {/* Hard offset shadow layer */}
      <path
        d="M 22 158 L 20 16
           C 20 10 38 8 66 10
           C 102 12 124 32 122 64
           C 120 90 104 108 80 112
           L 120 158 L 96 158
           L 60 112 L 42 112
           L 42 158 Z"
        fill="#000000"
        opacity="0.6"
        transform="translate(5 6)"
      />

      {/* ── Rendered mark group ── */}
      <g filter="url(#rl-shadow)">

        {/* Main chrome body */}
        <path
          d="M 22 158 L 20 16
             C 20 10 38 8 66 10
             C 102 12 124 32 122 64
             C 120 90 104 108 80 112
             L 120 158 L 96 158
             L 60 112 L 42 112
             L 42 158 Z"
          fill="url(#rl-body)"
        />

        {/* Counter — dark oval bowl interior */}
        <path
          d="M 42 30
             L 42 92
             C 56 100 94 96 100 68
             C 106 40 82 26 42 30 Z"
          fill="url(#rl-counter)"
        />

        {/* Inner chrome ribbon strip */}
        <path
          d="M 16 16 C 18 8 28 8 38 12
             L 38 112 L 76 158 L 96 158
             L 54 112 L 54 13
             C 46 10 18 10 16 16 Z"
          fill="url(#rl-ribbon)"
          opacity="0.93"
        />

      </g>

      {/* ── Specular highlights (drawn above shadow filter) ── */}

      {/* Outer arc top specular streak */}
      <path
        d="M 66 10 C 92 10 112 22 122 42
           C 116 28 100 16 76 12 L 66 10 Z"
        fill="url(#rl-arc-spec)"
      />

      {/* Left stem edge specular streak */}
      <path
        d="M 20 16 L 24 16 L 24 120
           C 24 130 23 144 22 158
           L 20 158 Z"
        fill="url(#rl-stem-spec)"
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
