"use client";

import { Trash2 } from "lucide-react";
import { deleteProviderConnection } from "@/lib/actions/wallets";
import { Button } from "@/components/ui/button";

export function DeleteProviderButton({
  walletId,
  providerId,
  label
}: {
  walletId: string;
  providerId: string;
  label: string;
}) {
  return (
    <form action={deleteProviderConnection}>
      <input type="hidden" name="walletId" value={walletId} />
      <input type="hidden" name="providerId" value={providerId} />
      <Button
        type="submit"
        variant="danger"
        className="gap-2"
        onClick={(e) => {
          if (!confirm(`Remove "${label}" from this wallet?`)) {
            e.preventDefault();
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
        Remove tool
      </Button>
    </form>
  );
}
