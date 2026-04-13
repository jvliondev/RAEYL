"use server";

import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/services/notification-service";
import { notificationChannelSchema, notificationTypeSchema } from "@/lib/validation/backend";

export async function markNotificationAsRead(formData: FormData) {
  const session = await requireSession();
  const notificationId = String(formData.get("notificationId") ?? "");

  if (!notificationId) {
    throw new Error("Notification not found.");
  }

  await markNotificationRead(notificationId, session.user.id);
  redirect("/app/notifications?updated=1");
}

export async function markAllNotificationsAsRead() {
  const session = await requireSession();
  await markAllNotificationsRead(session.user.id);
  redirect("/app/notifications?updated=all");
}

export async function updateNotificationPreference(formData: FormData) {
  const session = await requireSession();
  const type = notificationTypeSchema.parse(formData.get("type"));
  const channel = notificationChannelSchema.parse(formData.get("channel"));
  const isEnabled = String(formData.get("isEnabled") ?? "true") === "true";

  await prisma.notificationPreference.upsert({
    where: {
      userId_type_channel: {
        userId: session.user.id,
        type,
        channel
      }
    },
    create: {
      userId: session.user.id,
      type,
      channel,
      isEnabled
    },
    update: {
      isEnabled
    }
  });

  redirect("/app/settings/notifications?updated=1");
}
