import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";
import type { NotificationChannel, NotificationType } from "@prisma/client/index";

async function isNotificationEnabledForUser(
  userId: string,
  type: NotificationType,
  channel: NotificationChannel
) {
  const preference = await prisma.notificationPreference.findUnique({
    where: {
      userId_type_channel: {
        userId,
        type,
        channel
      }
    }
  });

  return preference?.isEnabled ?? true;
}

export async function createInAppNotification({
  userId,
  walletId,
  type,
  subject,
  body,
  ctaUrl
}: {
  userId: string;
  walletId?: string;
  type: NotificationType;
  subject?: string;
  body: string;
  ctaUrl?: string;
}) {
  const inAppEnabled = await isNotificationEnabledForUser(userId, type, "IN_APP");
  if (!inAppEnabled) {
    return null;
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      walletId,
      type,
      channel: "IN_APP",
      status: "QUEUED",
      subject,
      body,
      ctaUrl
    }
  });

  await recordAuditEvent({
    actorType: "SYSTEM",
    walletId,
    entityType: "NOTIFICATION",
    entityId: notification.id,
    action: "notification.created",
    summary: subject ?? "Notification created."
  });

  return notification;
}

export async function markNotificationRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId
    },
    data: {
      status: "READ",
      readAt: new Date()
    }
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      readAt: null
    },
    data: {
      status: "READ",
      readAt: new Date()
    }
  });
}
