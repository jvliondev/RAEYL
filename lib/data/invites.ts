import crypto from "crypto";

import { InviteStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getInvitePreview(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const invite = await prisma.invite.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      expiresAt: true,
      createdAt: true,
      wallet: {
        select: {
          id: true,
          name: true,
          businessName: true,
          websiteUrl: true,
          ownerContactName: true
        }
      }
    }
  });

  if (!invite) {
    return {
      isValid: false,
      status: "MISSING" as const,
      invite: null
    };
  }

  const now = new Date();
  const isTerminalStatus =
    invite.status === InviteStatus.ACCEPTED ||
    invite.status === InviteStatus.REVOKED ||
    invite.status === InviteStatus.DECLINED;
  const derivedStatus = invite.expiresAt < now && !isTerminalStatus ? "EXPIRED" : invite.status;

  const isValid = !["REVOKED", "DECLINED", "ACCEPTED", "EXPIRED"].includes(derivedStatus);

  return {
    isValid,
    status: derivedStatus,
    invite
  };
}
