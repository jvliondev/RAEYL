import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { type ProviderRecord } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

function healthVariant(health: ProviderRecord["health"]) {
  switch (health) {
    case "healthy":     return "success";
    case "attention":   return "warning";
    case "issue":
    case "disconnected": return "danger";
    default:            return "neutral";
  }
}

function statusLabel(provider: ProviderRecord) {
  if (provider.health === "healthy")     return "Connected";
  if (provider.health === "attention")   return "Needs review";
  if (provider.health === "issue" || provider.health === "disconnected") return "Action needed";
  if (provider.syncState?.toLowerCase().includes("pending")) return "Pending";
  return provider.status;
}

function statusNote(provider: ProviderRecord) {
  if (provider.metadata.selectedProjectName === "not selected")
    return "Account verified — project still needs to be selected.";
  if (provider.connectionMethod?.toLowerCase() === "api token" && provider.syncState?.toLowerCase().includes("pending"))
    return "Live verification is queued.";
  if (provider.connectionMethod?.toLowerCase() === "manual")
    return "Manual record — links to the provider dashboard.";
  if (provider.health === "healthy")     return "This connection is in good shape.";
  if (provider.health === "attention")   return "Connected, but needs a quick review.";
  if (provider.health === "issue" || provider.health === "disconnected")
    return "Needs intervention before handoff.";
  return "Details available in the tool view.";
}

function HealthDot({ health }: { health: ProviderRecord["health"] }) {
  const cls = cn(
    "status-dot mt-px",
    health === "healthy"     ? "status-dot-healthy" :
    health === "attention"   ? "status-dot-attention" :
    (health === "issue" || health === "disconnected") ? "status-dot-issue" :
    "status-dot-neutral"
  );
  return <span className={cls} />;
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-white/40">{label}</span>
      <span className="text-[13px] font-medium text-white/75">{value}</span>
    </div>
  );
}

export function ProviderCard({ provider, walletId }: { provider: ProviderRecord; walletId: string }) {
  return (
    <div className="app-surface rounded-2xl overflow-hidden">
      {/* Card header */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.055]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="app-eyebrow mb-1">{provider.label}</div>
            <div className="text-[15px] font-semibold text-white/90 leading-snug truncate">
              {provider.accountLabel}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
            <HealthDot health={provider.health} />
            <Badge variant={healthVariant(provider.health)}>
              {statusLabel(provider)}
            </Badge>
          </div>
        </div>
        <p className="mt-2 text-[13px] leading-5 text-white/50">
          {provider.ownerDescription}{" "}
          <span className="text-white/65">Powered by {provider.name}.</span>
        </p>
      </div>

      {/* Data rows */}
      <div className="px-5 py-4 space-y-3">
        <DataRow label="Connection" value={provider.connectionMethod ?? "Not recorded"} />
        <DataRow label="Sync" value={provider.syncState ?? "Unknown"} />
        <DataRow label="Est. cost" value={formatCurrency(provider.monthlyCost) + "/mo"} />

        <p className="text-[12px] leading-4 text-white/38 pt-0.5">{statusNote(provider)}</p>

        <Link
          href={`/app/wallets/${walletId}/providers/${provider.id}`}
          className="group mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/55 transition-colors hover:text-white/90"
        >
          Open tool details
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
}
