import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ActionCard({
  href,
  label,
  description
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className="relative h-full overflow-hidden rounded-xl border border-white/[0.07] bg-gradient-to-b from-[#141414] to-[#0d0d0d] p-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-white/[0.13] group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="text-[13px] font-semibold leading-5 text-white/88 transition-colors group-hover:text-white">
              {label}
            </div>
            <p className="text-[13px] leading-5 text-white/48">{description}</p>
          </div>
          <div className="flex-shrink-0 rounded-full border border-white/[0.09] bg-white/[0.03] p-1.5 transition-all duration-200 group-hover:border-white/[0.18] group-hover:bg-white/[0.07]">
            <ArrowRight className="h-3 w-3 text-white/35 transition-colors group-hover:text-white/75" />
          </div>
        </div>
      </div>
    </Link>
  );
}
