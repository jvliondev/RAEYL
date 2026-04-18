import { cn } from "@/lib/utils";

export function RaeylMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 118 112"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-auto", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="raeyl-rail-base" x1="22" y1="18" x2="91" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f5f7fb" />
          <stop offset="0.16" stopColor="#aab0bc" />
          <stop offset="0.34" stopColor="#3f4653" />
          <stop offset="0.56" stopColor="#f8fafc" />
          <stop offset="0.76" stopColor="#434a57" />
          <stop offset="1" stopColor="#d7dde7" />
        </linearGradient>
        <linearGradient id="raeyl-rail-shadow" x1="28" y1="24" x2="96" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0b0f17" />
          <stop offset="0.45" stopColor="#2a3140" />
          <stop offset="1" stopColor="#06080d" />
        </linearGradient>
        <linearGradient id="raeyl-rail-highlight" x1="44" y1="23" x2="68" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#f5f7fb" stopOpacity="0.9" />
          <stop offset="1" stopColor="#c1c9d6" stopOpacity="0.25" />
        </linearGradient>
        <filter id="raeyl-rail-glow" x="0" y="0" width="118" height="112" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 .18 0"
          />
        </filter>
      </defs>

      <g filter="url(#raeyl-rail-glow)">
        <path
          d="M31 21H66C85 21 95 34 91 48C88 58 79 63 69 66L48 73C39 76 33 82 30 91H21C24 77 31 67 43 61L65 52C72 49 77 45 79 39C82 30 76 24 62 24H31V21Z"
          fill="#dfe5ef"
        />
      </g>

      <path
        d="M29 18H67C88 18 99 31 95 47C92 58 83 65 71 68L50 75C41 78 35 84 31 93H21C24 79 32 69 44 63L66 54C74 51 80 47 83 40C87 29 79 21 63 21H29V18Z"
        fill="url(#raeyl-rail-shadow)"
      />
      <path
        d="M26 15H65C86 15 99 27 98 44C97 56 90 66 76 73L58 82C50 86 44 92 39 97L29 93C33 85 41 76 50 71L69 61C81 54 87 47 88 39C90 28 82 18 64 18H26V15Z"
        fill="url(#raeyl-rail-base)"
      />
      <path
        d="M59 18H65C84 18 93 29 90 41C88 50 82 57 68 64L50 73C42 77 36 83 32 90"
        stroke="url(#raeyl-rail-highlight)"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <path
        d="M83 24C95 30 99 42 94 54C91 62 85 69 75 75L56 86C47 91 40 96 34 101"
        stroke="url(#raeyl-rail-base)"
        strokeWidth="3.6"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M77 26C87 32 90 41 86 51C83 58 77 64 67 70L47 81C40 85 34 91 29 97"
        stroke="url(#raeyl-rail-shadow)"
        strokeWidth="2.2"
        strokeLinecap="round"
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
      <RaeylMark className={cn("h-8 w-auto flex-shrink-0", markClassName)} />
      <span
        className="bg-[linear-gradient(180deg,#f8fafc_0%,#d2d8e2_28%,#7f8797_60%,#f8fafc_100%)] bg-clip-text text-[12px] font-semibold tracking-[0.36em] text-transparent drop-shadow-[0_1px_8px_rgba(255,255,255,0.16)]"
        style={{ fontFamily: "var(--font-display), var(--font-inter), system-ui" }}
      >
        RAEYL
      </span>
    </span>
  );
}
