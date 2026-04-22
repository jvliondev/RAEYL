import crypto from "crypto";
import { WalletRole } from "@prisma/client/index";

import { inviteRepository } from "@/lib/repositories/invite-repository";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";

export async function sendOwnerInvite({
  walletId,
  email,
  actorUserId,
  welcomeNote,
  expiresAt
}: {
  walletId: string;
  email: string;
  actorUserId: string;
  welcomeNote?: string;
  expiresAt: Date;
}) {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const invite = await inviteRepository.create({
    walletId,
    sentById: actorUserId,
    email,
    role: WalletRole.WALLET_OWNER,
    inviteType: "OWNER_HANDOFF",
    tokenHash,
    status: "SENT",
    sentAt: new Date(),
    expiresAt,
    context: {
      welcomeNote
    }
  });

  await prisma.wallet.update({
    where: { id: walletId },
    data: {
      handoffStatus: "OWNER_INVITED",
      ownerAcceptanceStatus: "PENDING"
    }
  });

  await recordAuditEvent({
    actorUserId,
    actorType: "USER",
    walletId,
    entityType: "INVITE",
    entityId: invite.id,
    action: "invite.sent",
    summary: `Ownership invite sent to ${email}.`
  });

  return { invite, token };
}
