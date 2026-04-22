import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { type ProviderRecord } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

function healthVariant(health: ProviderRecord["health"]) {
  switch (health) {
    case "healthy":
      return "success";
    case "attention":
      return "warning";
    case "issue":
    case "disconnected":
      return "danger";
    default:
      return "neutral";
  }
}

function statusLabel(provider: ProviderRecord) {
  if (provider.health === "healthy") return "Connected";
  if (provider.health === "attention") return "Needs review";
  if (provider.health === "issue" || provider.health === "disconnected") return "Action needed";
  if (provider.syncState?.toLowerCase().includes("pending")) return "Pending";
  return provider.status;
}

function statusNote(provider: ProviderRecord) {
  if (provider.connectionState?.toLowerCase().includes("awaiting selection")) {
    return "RAEYL verified the account, but it still needs one resource confirmation.";
  }

  if (typeof provider.confidenceScore === "number" && provider.confidenceScore < 70) {
    return "RAEYL connected this tool, but the match confidence is still low.";
  }

  if (provider.metadata.selectedProjectName === "not selected") {
    return "Account verified - project still needs to be selected.";
  }

  if (provider.connectionMethod?.toLowerCase() === "api token" && provider.syncState?.toLowerCase().includes("pending")) {
    return "Live verification is queued.";
  }

  if (provider.connectionMethod?.toLowerCase() === "manual") {
    return "Manual record - links to the provider dashboard.";
  }

  if (provider.health === "healthy") return "This connection is in good shape.";
  if (provider.health === "attention") return "Connected, but needs a quick review.";
  if (provider.health === "issue" || provider.health === "disconnected") return "Needs intervention before handoff.";
  return "Details available in the tool view.";
}

function ctaLabel(provider: ProviderRecord) {
  if (
    provider.health === "issue" ||
    provider.health === "disconnected" ||
    provider.connectionState?.toLowerCase().includes("awaiting") ||
    (typeof provider.confidenceScore === "number" && provider.confidenceScore < 70)
  ) {
    return "Review and repair";
  }

  return "Open tool details";
}

function HealthDot({ health }: { health: ProviderRecord["health"] }) {
  const cls = cn(
    "status-dot mt-px",
    health === "healthy"
      ? "status-dot-healthy"
      : health === "attention"
        ? "status-dot-attention"
        : health === "issue" || health === "disconnected"
          ? "status-dot-issue"
          : "status-dot-neutral"
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
    <div className="app-surface overflow-hidden rounded-2xl">
      <div className="border-b border-white/[0.055] px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="app-eyebrow mb-1">{provider.label}</div>
            <div className="truncate text-[15px] font-semibold leading-snug text-white/90">{provider.accountLabel}</div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 pt-0.5">
            <HealthDot health={provider.health} />
            <Badge variant={healthVariant(provider.health)}>{statusLabel(provider)}</Badge>
          </div>
        </div>
        <p className="mt-2 text-[13px] leading-5 text-white/50">
          {provider.ownerDescription} <span className="text-white/65">Powered by {provider.name}.</span>
        </p>
      </div>

      <div className="space-y-3 px-5 py-4">
        <DataRow label="Connection" value={provider.connectionMethod ?? "Not recorded"} />
        <DataRow label="State" value={provider.connectionState ?? "Not recorded"} />
        <DataRow label="Sync" value={provider.syncState ?? "Unknown"} />
        <DataRow
          label="Confidence"
          value={typeof provider.confidenceScore === "number" ? `${provider.confidenceScore}%` : "Unscored"}
        />
        <DataRow label="Est. cost" value={`${formatCurrency(provider.monthlyCost)}/mo`} />

        <p className="pt-0.5 text-[12px] leading-4 text-white/38">{statusNote(provider)}</p>

        <Link
          href={`/app/wallets/${walletId}/providers/${provider.id}`}
          className="group mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/55 transition-colors hover:text-white/90"
        >
          {ctaLabel(provider)}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
