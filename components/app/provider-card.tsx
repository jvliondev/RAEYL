import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ProviderRecord } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

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
  if (provider.health === "healthy") {
    return "Connected";
  }

  if (provider.health === "attention") {
    return "Needs review";
  }

  if (provider.health === "issue" || provider.health === "disconnected") {
    return "Action needed";
  }

  if (provider.syncState?.toLowerCase().includes("pending")) {
    return "Pending verification";
  }

  return provider.status;
}

export function ProviderCard({ provider, walletId }: { provider: ProviderRecord; walletId: string }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <div className="text-sm text-muted">{provider.label}</div>
          <CardTitle>{provider.accountLabel}</CardTitle>
          <CardDescription>
            {provider.ownerDescription} <span className="text-foreground/70">Powered by {provider.name}.</span>
          </CardDescription>
        </div>
        <Badge variant={healthVariant(provider.health)}>{statusLabel(provider)}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Connection</span>
          <span>{provider.connectionMethod ?? "Not recorded"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Sync</span>
          <span>{provider.syncState ?? "Unknown"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Estimated cost</span>
          <span>{formatCurrency(provider.monthlyCost)}</span>
        </div>
        <Link
          href={`/app/wallets/${walletId}/providers/${provider.id}`}
          className="text-sm font-medium text-primary"
        >
          Open tool details
        </Link>
      </CardContent>
    </Card>
  );
}
