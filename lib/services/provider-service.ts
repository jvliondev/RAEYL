import { Prisma } from "@prisma/client/index";

import { providerRepository } from "@/lib/repositories/provider-repository";
import { recordAuditEvent } from "@/lib/audit";
import type { ProviderConnectionInput } from "@/lib/validation/backend";

export async function createProviderForWallet(
  input: ProviderConnectionInput,
  actorUserId: string
) {
  const provider = await providerRepository.create({
    ...input,
    monthlyCostEstimate:
      input.monthlyCostEstimate !== undefined
        ? new Prisma.Decimal(input.monthlyCostEstimate)
        : undefined,
    status: input.connectionMethod === "MANUAL" ? "CONNECTED" : "PENDING_VERIFICATION",
    syncState: input.connectionMethod === "MANUAL" ? "DISABLED" : "PENDING",
    healthStatus: input.connectionMethod === "MANUAL" ? "UNKNOWN" : "ATTENTION_NEEDED",
    createdById: actorUserId
  });

  await recordAuditEvent({
    actorUserId,
    actorType: "USER",
    walletId: input.walletId,
    entityType: "PROVIDER",
    entityId: provider.id,
    action: "provider.created",
    summary: `${provider.providerName} added as a connected provider.`
  });

  return provider;
}
