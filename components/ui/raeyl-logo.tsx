import { useId } from "react";

import { cn } from "@/lib/utils";

export function RaeylMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const glowId = `raeyl-glow-${id}`;
  const railBodyId = `raeyl-rail-body-${id}`;
  const railChromeId = `raeyl-rail-chrome-${id}`;
  const railEdgeId = `raeyl-rail-edge-${id}`;
  const shadowId = `raeyl-shadow-${id}`;

  return (
    <svg
      viewBox="0 0 152 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-auto", className)}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={glowId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(82 48) rotate(90) scale(58 66)">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.34" />
          <stop offset="0.45" stopColor="#E8EDF4" stopOpacity="0.18" />
          <stop offset="1" stopColor="#E8EDF4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={railBodyId} x1="45" y1="18" x2="110" y2="102" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F6F9FD" />
          <stop offset="0.16" stopColor="#9098A6" />
          <stop offset="0.32" stopColor="#161B25" />
          <stop offset="0.52" stopColor="#F3F6FB" />
          <stop offset="0.7" stopColor="#2A3140" />
          <stop offset="0.86" stopColor="#DCE3EC" />
          <stop offset="1" stopColor="#6D7686" />
        </linearGradient>
        <linearGradient id={railChromeId} x1="64" y1="18" x2="77" y2="98" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.18" stopColor="#FBFDFF" />
          <stop offset="0.42" stopColor="#C7CFDB" />
          <stop offset="0.62" stopColor="#FFFFFF" />
          <stop offset="0.82" stopColor="#8B94A2" />
          <stop offset="1" stopColor="#F8FBFF" />
        </linearGradient>
        <linearGradient id={railEdgeId} x1="55" y1="22" x2="119" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0A0E15" />
          <stop offset="0.2" stopColor="#212735" />
          <stop offset="0.5" stopColor="#04060A" />
          <stop offset="0.78" stopColor="#30394A" />
          <stop offset="1" stopColor="#090C13" />
        </linearGradient>
        <filter id={shadowId} x="12" y="11" width="126" height="112" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="9" stdDeviation="7" floodColor="#02040A" floodOpacity="0.6" />
        </filter>
      </defs>

      <ellipse cx="80" cy="50" rx="66" ry="44" fill={`url(#${glowId})`} />

      <g filter={`url(#${shadowId})`}>
        <path
          d="M39 24H85C107 24 120 33 120 49C120 60 113 68 97 76L77 86C65 92 56 100 47 111H64C71 103 78 97 89 92L108 83C126 74 134 63 134 48C134 27 117 15 88 15H39V24Z"
          fill={`url(#${railEdgeId})`}
        />
        <path
          d="M35 18H84C107 18 121 28 121 44C121 55 114 63 100 71L79 82C66 88 54 98 43 112C56 110 67 105 77 98L98 84C120 72 132 58 132 41C132 20 114 10 85 10H35V18Z"
          fill={`url(#${railBodyId})`}
        />
        <path
          d="M50 20H83C102 20 113 28 113 41C113 50 107 57 94 64L72 76C58 84 47 93 38 106"
          stroke={`url(#${railChromeId})`}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M117 28C124 34 127 42 126 50C125 60 119 68 106 76L87 88C75 95 65 102 55 111"
          stroke={`url(#${railChromeId})`}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.96"
        />
        <path
          d="M109 29C116 35 118 42 117 49C115 57 110 64 99 71L79 83C66 90 55 99 45 108"
          stroke={`url(#${railEdgeId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.92"
        />
        <path
          d="M102 31C108 36 110 42 109 48C108 55 104 61 94 68L74 80C61 88 50 97 41 105"
          stroke={`url(#${railChromeId})`}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.86"
        />
      </g>
    </svg>
  );
}

export function RaeylLogo({
  className,
  markClassName,
  wordmarkClassName
}: {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <RaeylMark className={cn("h-8 w-auto flex-shrink-0", markClassName)} />
      <span
        className={cn(
          "bg-[linear-gradient(180deg,#f8fbff_0%,#d9e0e9_24%,#818a98_62%,#f5f8fd_100%)] bg-clip-text text-[12px] font-semibold text-transparent drop-shadow-[0_1px_10px_rgba(255,255,255,0.14)]",
          wordmarkClassName
        )}
        style={{
          fontFamily: "var(--font-display), var(--font-inter), system-ui",
          letterSpacing: "0.34em"
        }}
      >
        RAEYL
      </span>
    </span>
  );
}
