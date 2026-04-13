import { walletRepository } from "@/lib/repositories/wallet-repository";
import { recordAuditEvent } from "@/lib/audit";
import type { WalletCreateInput } from "@/lib/validation/backend";
import { prisma } from "@/lib/prisma";

export async function createWalletWithMembership(input: WalletCreateInput, actorUserId: string) {
  const wallet = await prisma.$transaction(async (tx) => {
    const created = await tx.wallet.create({
      data: {
        ...input,
        createdById: actorUserId,
        primaryDeveloperId: actorUserId,
        status: "IN_SETUP",
        setupStatus: "PROFILE_COMPLETE",
        memberships: {
          create: {
            userId: actorUserId,
            role: "DEVELOPER",
            status: "ACTIVE",
            isPrimaryDeveloper: true,
            joinedAt: new Date()
          }
        }
      }
    });

    return created;
  });

  await recordAuditEvent({
    actorUserId,
    actorType: "USER",
    walletId: wallet.id,
    entityType: "WALLET",
    entityId: wallet.id,
    action: "wallet.created",
    summary: `Wallet ${wallet.name} created.`
  });

  return wallet;
}

export async function listUserWallets(userId: string) {
  return walletRepository.findByUser(userId);
}
