"use server";

import { redirect } from "next/navigation";
import { supportStatusSchema } from "@/lib/validation/backend";

import { requireAdmin, requireSession } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { addSupportMessage } from "@/lib/services/support-service";
import { recordAuditEvent } from "@/lib/audit";
import { createInAppNotification } from "@/lib/services/notification-service";

export async function updateSupportRequestStatus(formData: FormData) {
  const session = await requireSession();
  await requireAdmin(session.user.id);

  const supportRequestId = String(formData.get("supportRequestId") ?? "");
  const status = supportStatusSchema.parse(formData.get("status"));

  const supportRequest = await prisma.supportRequest.update({
    where: {
      id: supportRequestId
    },
    data: {
      status,
      resolvedAt: status === "RESOLVED" || status === "CLOSED" ? new Date() : null
    }
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    actorType: "ADMIN",
    walletId: supportRequest.walletId,
    entityType: "SUPPORT",
    entityId: supportRequest.id,
    action: "support.status.updated",
    summary: `Support request status changed to ${status.toLowerCase()}.`
  });

  if (supportRequest.requesterId) {
    await createInAppNotification({
      userId: supportRequest.requesterId,
      walletId: supportRequest.walletId,
      type: "SUPPORT",
      subject: "Support status updated",
      body: `Your support request is now ${status.toLowerCase().replace(/_/g, " ")}.`,
      ctaUrl: `/app/wallets/${supportRequest.walletId}/support`
    });
  }

  redirect("/admin/support?updated=1");
}

export async function addSupportReply(formData: FormData) {
  const session = await requireSession();
  const supportRequestId = String(formData.get("supportRequestId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const isInternal = String(formData.get("isInternal") ?? "false") === "true";

  if (!body) {
    throw new Error("Reply cannot be empty.");
  }

  await addSupportMessage({
    supportRequestId,
    authorId: session.user.id,
    body,
    isInternal
  });

  const supportRequest = await prisma.supportRequest.findUnique({
    where: { id: supportRequestId },
    select: { walletId: true }
  });

  if (!supportRequest) {
    throw new Error("Support request not found.");
  }

  redirect(`/app/wallets/${supportRequest.walletId}/support?updated=reply`);
}

export async function addAdminSupportReply(formData: FormData) {
  const session = await requireSession();
  await requireAdmin(session.user.id);

  const supportRequestId = String(formData.get("supportRequestId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const isInternal = String(formData.get("isInternal") ?? "false") === "true";

  if (!body) {
    throw new Error("Reply cannot be empty.");
  }

  await addSupportMessage({
    supportRequestId,
    authorId: session.user.id,
    body,
    isInternal
  });

  redirect("/admin/support?updated=reply");
}
