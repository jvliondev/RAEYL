import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const toneConfig = {
  neutral: {
    glow: "glow-neutral",
    valueClass: "text-white/92",
    borderAccent: "border-t-white/[0.07]"
  },
  success: {
    glow: "glow-success",
    valueClass: "text-success",
    borderAccent: "border-t-success/30"
  },
  warning: {
    glow: "glow-warning",
    valueClass: "text-warning",
    borderAccent: "border-t-warning/30"
  },
  danger: {
    glow: "glow-danger",
    valueClass: "text-destructive",
    borderAccent: "border-t-destructive/30"
  },
  accent: {
    glow: "glow-accent",
    valueClass: "text-accent",
    borderAccent: "border-t-accent/30"
  }
} as const;

export function StatCard({
  label,
  value,
  supporting,
  tone = "neutral",
  tag
}: {
  label: string;
  value: string;
  supporting: string;
  tone?: keyof typeof toneConfig;
  tag?: string;
}) {
  const t = toneConfig[tone] ?? toneConfig.neutral;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#141414] to-[#0d0d0d] p-5",
        "border-t-2",
        t.borderAccent,
        t.glow,
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.11]"
      )}
    >
      {/* Subtle inner top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <div className="mb-4 flex items-start justify-between gap-2">
        <p className="app-eyebrow pt-px">{label}</p>
        {tag ? (
          <Badge variant={tone === "neutral" ? "neutral" : tone} className="shrink-0">
            {tag}
          </Badge>
        ) : null}
      </div>

      <div className={cn("stat-num text-[2.35rem]", t.valueClass)}>
        {value}
      </div>

      <p className="mt-3 text-[13px] leading-5 text-white/48">{supporting}</p>
    </div>
  );
}
