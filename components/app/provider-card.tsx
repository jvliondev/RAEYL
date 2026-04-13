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
        <Badge variant={healthVariant(provider.health)}>{provider.status}</Badge>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between text-sm">
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
