import { prisma } from "@server/database/prisma";
import { serializeNotification } from "@server/services/serializers";
import type { NotificationType } from "@shared/contracts";

export async function createNotification(input: {
  userId: string;
  type: Uppercase<NotificationType>;
  title: string;
  body: string;
  href?: string;
}) {
  const notification = await prisma.notification.create({
    data: input,
  });
  return serializeNotification(notification);
}

export async function listNotifications(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return notifications.map(serializeNotification);
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const notification = await prisma.notification.update({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
  return serializeNotification(notification);
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
