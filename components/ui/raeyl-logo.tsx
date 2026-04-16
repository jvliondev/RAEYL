import { cn } from "@/lib/utils";

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
        <linearGradient id="raeyl-purple" x1="0" y1="0" x2="130" y2="172" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
        <linearGradient id="raeyl-cyan" x1="130" y1="172" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
      </defs>

      {/* Depth / shadow layer */}
      <path
        d="M 24 162 L 24 18 L 72 18 C 105 18 122 38 118 66 C 115 88 100 103 78 107 L 118 162 L 92 162 L 56 110 L 44 110 L 44 162 Z"
        fill="#1e1b4b"
        transform="translate(5 6)"
      />

      {/* Main R body — purple gradient */}
      <path
        d="M 18 158 L 18 14 L 68 14 C 102 14 120 35 116 63 C 113 86 97 101 75 105 L 116 158 L 89 158 L 53 107 L 40 107 L 40 158 Z"
        fill="url(#raeyl-purple)"
      />

      {/* Inner counter — dark cutout */}
      <path
        d="M 40 32 L 40 89 C 60 94 90 88 95 63 C 100 37 68 30 40 32 Z"
        fill="#0f0e2a"
      />

      {/* Cyan ribbon — inner accent strip */}
      <path
        d="M 14 14 C 18 8 26 8 34 11 L 34 108 L 72 158 L 90 158 L 52 108 L 52 13 C 42 10 16 10 14 14 Z"
        fill="url(#raeyl-cyan)"
        opacity="0.88"
      />
    </svg>
  );
}

export function RaeylLogo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <RaeylMark className={cn("h-7 w-auto flex-shrink-0", markClassName)} />
      <span className="text-sm font-bold tracking-[0.22em] text-foreground">RAEYL</span>
    </span>
  );
}
