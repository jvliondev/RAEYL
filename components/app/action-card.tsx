import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function ActionCard({
  href,
  label,
  description,
  rank,
  tone = "default",
  className
}: {
  href: string;
  label: string;
  description: string;
  rank?: number;
  tone?: "default" | "warning" | "success";
  className?: string;
}) {
  return (
    <Link href={href} className={cn("group flex h-full min-h-[136px]", className)}>
      <div
        className={cn(
          "relative flex h-full w-full flex-col overflow-hidden rounded-2xl border p-5",
          "transition-all duration-200",
          "group-hover:-translate-y-px group-hover:shadow-[0_24px_64px_rgba(0,0,0,0.55)]",
          tone === "warning"
            ? "border-warning/[0.2] group-hover:border-warning/[0.35]"
            : tone === "success"
              ? "border-success/[0.2] group-hover:border-success/[0.35]"
              : "border-white/[0.08] group-hover:border-white/[0.16]"
        )}
        style={{
          background: "linear-gradient(158deg, #181818 0%, #101010 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.055), 0 4px 20px rgba(0,0,0,0.32)"
        }}
      >
        {/* Specular top edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />

        {/* Priority row: rank badge + tone dot */}
        <div className="mb-3.5 flex items-center gap-2">
          {rank !== undefined ? (
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.03] text-[10px] font-semibold tabular-nums text-white/30">
              {rank}
            </span>
          ) : null}
          {tone === "warning" ? (
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-warning/55" />
          ) : tone === "success" ? (
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-success/55" />
          ) : null}
        </div>

        {/* Text content — flexes to fill available height */}
        <div className="flex-1 space-y-2">
          <p className="text-[14px] font-semibold leading-snug tracking-tight text-white/90 transition-colors group-hover:text-white">
            {label}
          </p>
          <p className="text-[13px] leading-[1.55] text-white/50 transition-colors group-hover:text-white/62">
            {description}
          </p>
        </div>

        {/* Action footer — anchored to bottom-right */}
        <div className="mt-5 flex items-center justify-end">
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.09] transition-all duration-200 group-hover:border-white/[0.24] group-hover:bg-white/[0.06]"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <ArrowRight className="h-3 w-3 text-white/35 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-white/75" />
          </div>
        </div>
      </div>
    </Link>
  );
}
