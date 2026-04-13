import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";
import { hasCapability } from "@/lib/auth/permissions";
import { createInAppNotification } from "@/lib/services/notification-service";

export async function createSupportRequest({
  walletId,
  providerConnectionId,
  requesterId,
  subject,
  category,
  priority,
  description
}: {
  walletId: string;
  providerConnectionId?: string;
  requesterId: string;
  subject: string;
  category: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  description: string;
}) {
  const wallet = await prisma.wallet.findUnique({
    where: {
      id: walletId
    },
    include: {
      memberships: {
        where: {
          status: "ACTIVE",
          OR: [
            { isPrimaryOwner: true },
            { isPrimaryDeveloper: true },
            { role: "SUPPORT" }
          ]
        },
        select: {
          userId: true
        }
      }
    }
  });

  if (!wallet) {
    throw new Error("Wallet not found.");
  }

  if (providerConnectionId) {
    const provider = await prisma.providerConnection.findFirst({
      where: {
        id: providerConnectionId,
        walletId
      },
      select: {
        id: true
      }
    });

    if (!provider) {
      throw new Error("This provider does not belong to the selected wallet.");
    }
  }

  const supportRequest = await prisma.supportRequest.create({
    data: {
      walletId,
      providerConnectionId,
      requesterId,
      subject,
      category,
      priority,
      description
    }
  });

  await recordAuditEvent({
    actorUserId: requesterId,
    actorType: "USER",
    walletId,
    entityType: "SUPPORT",
    entityId: supportRequest.id,
    action: "support.request.created",
    summary: `Support request created: ${subject}`
  });

  for (const member of wallet.memberships) {
    if (member.userId === requesterId) {
      continue;
    }

    await createInAppNotification({
      userId: member.userId,
      walletId,
      type: "SUPPORT",
      subject: "New support request",
      body: subject,
      ctaUrl: `/app/wallets/${walletId}/support`
    });
  }

  return supportRequest;
}

export async function addSupportMessage({
  supportRequestId,
  authorId,
  body,
  isInternal = false
}: {
  supportRequestId: string;
  authorId: string;
  body: string;
  isInternal?: boolean;
}) {
  const supportRequest = await prisma.supportRequest.findUnique({
    where: {
      id: supportRequestId
    },
    include: {
      wallet: {
        include: {
          memberships: {
            where: {
              userId: authorId,
              status: "ACTIVE"
            },
            select: {
              role: true
            }
          }
        }
      }
    }
  });

  if (!supportRequest) {
    throw new Error("Support request not found.");
  }

  const author = await prisma.user.findUnique({
    where: {
      id: authorId
    },
    select: {
      type: true
    }
  });

  const membershipRole = supportRequest.wallet.memberships[0]?.role;
  const canWriteToSupport =
    author?.type === "ADMIN" ||
    Boolean(membershipRole && hasCapability(membershipRole.toLowerCase(), "support.write"));

  if (!canWriteToSupport) {
    throw new Error("You do not have permission to update this support request.");
  }

  const message = await prisma.supportMessage.create({
    data: {
      supportRequestId,
      authorId,
      body,
      isInternal
    },
    include: {
      supportRequest: true
    }
  });

  if (message.supportRequest.requesterId && !isInternal) {
    await createInAppNotification({
      userId: message.supportRequest.requesterId,
      walletId: message.supportRequest.walletId,
      type: "SUPPORT",
      subject: "Support request updated",
      body: "There is a new update on your support request.",
      ctaUrl: `/app/wallets/${message.supportRequest.walletId}/support`
    });
  }

  await recordAuditEvent({
    actorUserId: authorId,
    actorType: author?.type === "ADMIN" ? "ADMIN" : "USER",
    walletId: message.supportRequest.walletId,
    entityType: "SUPPORT",
    entityId: message.supportRequest.id,
    action: "support.message.created",
    summary: "Support conversation updated."
  });

  return message;
}
